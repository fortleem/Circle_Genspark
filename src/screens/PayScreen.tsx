// — Cirkle Pay. Prototype design language + real /api/pay/wallet wiring.
// Covers Wallet card, Send (P2P), Scan/NFC, Activity, Egyptian payment methods, Top-up, Compliance.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine, Send, Plus, Eye, EyeOff, Nfc, ShieldCheck,
  ArrowUpRight, ArrowDownLeft, X, Loader2, Sparkles,
  CreditCard, Smartphone, Store, Zap, Globe2, ChevronRight,
  QrCode, Banknote, CheckCircle2, ExternalLink,
} from "lucide-react";
import { apiGet, apiPost, type Wallet, type Txn } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";
import { toast } from "sonner";

const ME = 1; // Demo current-user id

interface PaymentMethod {
  id: string;
  label: string;
  category: 'wallet' | 'instant' | 'card' | 'cash' | 'crypto';
  deeplink_scheme?: string;
  qr_supported: boolean;
  ussd_code?: string;
  min: number;
  max: number;
  fee_pct: number;
  currency: string;
  provider?: string;
  icon: string;
}

const CATEGORY_META: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  instant: { icon: Zap, label: 'Instant Transfer', color: 'text-amber-400' },
  wallet:  { icon: Smartphone, label: 'Mobile Wallet', color: 'text-emerald-400' },
  card:    { icon: CreditCard, label: 'Card Payment', color: 'text-blue-400' },
  cash:    { icon: Store, label: 'Cash / Retail', color: 'text-orange-400' },
  crypto:  { icon: Globe2, label: 'Crypto', color: 'text-purple-400' },
};

export function PayScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [regionInfo, setRegionInfo] = useState<{ country: string; country_name: string; currency: string; nfc: boolean; qr: boolean; compliance_notes: string | null }>({ country: 'EG', country_name: 'Egypt', currency: 'EGP', nfc: true, qr: true, compliance_notes: null });

  const load = () => {
    setLoading(true);
    Promise.all([
      apiGet<{ wallet: Wallet; transactions: Txn[] }>(`/pay/wallet/${ME}`)
        .then((d) => { setWallet(d.wallet ?? null); setTxns(d.transactions ?? []); })
        .catch(() => { setWallet(null); setTxns([]); }),
      apiGet<{ methods: PaymentMethod[]; country: string; country_name: string; currency: string; nfc: boolean; qr: boolean; compliance_notes: string | null }>('/pay/methods?country=EG')
        .then((d) => { setMethods(d.methods ?? []); setRegionInfo({ country: d.country, country_name: d.country_name, currency: d.currency, nfc: d.nfc, qr: d.qr, compliance_notes: d.compliance_notes }); })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? "EGP";

  // Build contact list from recent counterparties
  const contacts = (() => {
    const seen = new Map<number, string>();
    txns.forEach((t) => {
      if (t.from_user === ME && t.to_name) seen.set(t.to_user, t.to_name);
      else if (t.to_user === ME && t.from_name) seen.set(t.from_user, t.from_name);
    });
    return [...seen.entries()].slice(0, 8).map(([id, name]) => ({ id, name }));
  })();

  // Group payment methods by category
  const groupedMethods = methods.reduce<Record<string, PaymentMethod[]>>((acc, m) => {
    (acc[m.category] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Pay"
        arabic="دفع"
        section=""
        tagline="Wallet · P2P · NFC · KYC-Lite compliance"
        right={
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/15 transition">
            <ScanLine className="w-4 h-4 text-secondary" />
          </button>
        }
      />

      {/* Wallet card */}
      <div className="px-5">
        <motion.div
          initial={{ rotateX: -10, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          className="relative rounded-3xl aspect-[16/10] p-5 overflow-hidden shadow-float bg-gradient-hero"
          style={{ color: "hsl(var(--cream))" }}
        >
          <div className="absolute inset-0 bg-gradient-aurora opacity-70" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full border border-white/15" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-white/10" />
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-70">· Balance</div>
                <div className="font-display text-4xl mt-1">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin opacity-70" />
                  ) : hide ? (
                    "•••••"
                  ) : (
                    `${currency} ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  )}
                </div>
              </div>
              <button
                onClick={() => setHide(!hide)}
                className="w-9 h-9 rounded-full glass-strong flex items-center justify-center"
              >
                {hide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs opacity-70">Cirkle ID · @ahmed.saleh</div>
                <div className="text-sm tracking-[0.3em] mt-1">•••• {String(ME).padStart(4, "0")}</div>
              </div>
              <div className="flex items-center gap-2">
                {regionInfo.nfc && <Nfc className="w-5 h-5 opacity-80" />}
                {regionInfo.qr && <QrCode className="w-5 h-5 opacity-80" />}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 px-5">
        {[
          { icon: ScanLine, label: "Scan", onClick: () => toast.info("Point camera at QR code to pay") },
          { icon: Send, label: "Send", onClick: () => setShowSend(true) },
          { icon: Plus, label: "Top-up", onClick: () => setShowTopup(true) },
          { icon: ShieldCheck, label: "Vault", onClick: () => toast.info("Family Vault: secure shared savings with multi-sig") },
        ].map((q) => (
          <button
            key={q.label}
            onClick={q.onClick}
            className="glass rounded-2xl py-3 flex flex-col items-center gap-2 shadow-soft hover:scale-[1.02] transition"
          >
            <q.icon className="w-5 h-5 text-secondary" />
            <span className="text-[11px]">{q.label}</span>
          </button>
        ))}
      </div>

      {/* 🇪🇬 Egyptian Payment Methods */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-secondary font-mono mb-0.5">
              {regionInfo.country_name} Payment Rails
            </div>
            <h2 className="font-display text-lg">Payment Methods</h2>
          </div>
          <span className="text-2xl">🇪🇬</span>
        </div>

        {methods.length === 0 ? (
          <div className="py-6 text-sm text-muted-foreground text-center glass rounded-2xl">Loading payment methods…</div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedMethods).map(([cat, catMethods]) => {
              const meta = CATEGORY_META[cat] ?? CATEGORY_META.instant;
              const Icon = meta.icon;
              return (
                <div key={cat} className="glass rounded-2xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border/40 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                    <span className="text-xs font-medium">{meta.label}</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {catMethods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (m.deeplink_scheme) {
                            toast.success(`Opening ${m.label}…`, { description: m.deeplink_scheme });
                          } else if (m.ussd_code) {
                            toast.info(`Dial ${m.ussd_code} on your phone`, { description: `${m.label} USSD top-up` });
                          } else {
                            toast.info(`${m.label} selected`, { description: `Fee: ${m.fee_pct}% · Limit: ${m.currency} ${m.max.toLocaleString()}` });
                          }
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/5 transition text-left"
                      >
                        <span className="text-xl w-8 text-center">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{m.label}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span>{m.fee_pct === 0 ? 'Zero fees' : `${m.fee_pct}% fee`}</span>
                            <span>·</span>
                            <span>Limit {m.currency} {m.max.toLocaleString()}</span>
                            {m.qr_supported && <><span>·</span><span className="text-secondary">QR</span></>}
                            {m.ussd_code && <><span>·</span><span>USSD {m.ussd_code}</span></>}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Send to (recent contacts) */}
      {contacts.length > 0 && (
        <div className="px-5">
          <div className="text-[10px] uppercase tracking-widest text-secondary font-mono mb-2">
            Send to
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {contacts.map((c) => (
              <div key={c.id} className="shrink-0 flex flex-col items-center gap-1.5">
                <div
                  className="w-14 h-14 rounded-full bg-gradient-mesh flex items-center justify-center font-display text-lg"
                  style={{ color: "hsl(var(--cream))" }}
                >
                  {c.name.charAt(0)}
                </div>
                <span className="text-[10px] text-muted-foreground max-w-[60px] truncate">{c.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-widest text-secondary font-mono"></span>
            <h2 className="font-display text-lg">Recent activity</h2>
          </div>
          <button className="text-xs text-secondary hover:underline">See all</button>
        </div>

        {loading ? (
          <div className="py-8 text-sm text-muted-foreground text-center">Loading transactions…</div>
        ) : txns.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground text-center">No transactions yet</div>
        ) : (
          <div className="glass rounded-2xl divide-y divide-border/60 overflow-hidden">
            {txns.slice(0, 8).map((tx) => {
              const incoming = tx.to_user === ME;
              const other = incoming ? tx.from_name : tx.to_name;
              const sign = incoming ? "+" : "-";
              return (
                <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      incoming ? "bg-secondary/20 text-secondary" : "bg-muted text-foreground"
                    }`}
                  >
                    {incoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{other ?? "Unknown"}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {tx.method} · {tx.note ?? "—"} · {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${incoming ? "text-secondary" : ""}`}>
                    {sign}
                    {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {tx.currency}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Compliance chips */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Built-in compliance
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "KYC-Lite (Tier 2 ID)",
            "CBE-compliant",
            "Per-jurisdiction TX limits",
            "AML screening",
            "Funds segregation",
            "PCI-DSS",
            "Data Protection Law 151/2020",
          ].map((c) => (
            <span key={c} className="glass rounded-full px-3 py-1 text-[11px] text-foreground/80 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-secondary" />
              {c}
            </span>
          ))}
        </div>
        {regionInfo.compliance_notes && (
          <p className="text-[10px] text-muted-foreground mt-2 px-1">{regionInfo.compliance_notes}</p>
        )}
      </div>

      <ProtoFooter section="" title="Money that respects you">
        Real wallet, real transactions, zero surveillance ads. Send to anyone with a @handle, tap-to-pay
        over NFC, scan QR codes — and stay compliant in 80+ jurisdictions through Tier-2 KYC-Lite.
        Egyptian rails: InstaPay, Vodafone Cash, Orange Money, Etisalat Cash, WE Pay, Fawry, Meeza.
      </ProtoFooter>

      {/* Send modal */}
      <AnimatePresence>
        {showSend && (
          <SendModal
            onClose={() => setShowSend(false)}
            onSent={() => { setShowSend(false); load(); }}
            methods={methods}
          />
        )}
      </AnimatePresence>

      {/* Top-up modal */}
      <AnimatePresence>
        {showTopup && (
          <TopupModal
            methods={methods}
            currency={regionInfo.currency}
            onClose={() => setShowTopup(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SendModal({ onClose, onSent, methods }: { onClose: () => void; onSent: () => void; methods: PaymentMethod[] }) {
  const [handle, setHandle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("instapay");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const n = parseFloat(amount);
    if (!handle || !n || n <= 0) { setErr("Enter handle + amount"); return; }
    setBusy(true);
    try {
      await apiPost("/pay/send", {
        from_user: ME,
        to_handle: handle.replace(/^@/, ""),
        amount: n,
        method: selectedMethod || "handle",
        note: note || undefined,
      });
      onSent();
    } catch (e: any) {
      setErr(e?.body?.error ?? "Failed to send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md rounded-3xl bg-card border border-border shadow-float p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-secondary font-mono"></div>
            <div className="font-display text-2xl">Send money</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <div className="text-xs text-muted-foreground mb-1">Recipient handle</div>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@layla.mansour"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>
          <label className="block">
            <div className="text-xs text-muted-foreground mb-1">Amount (EGP)</div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>

          {/* Payment method selector */}
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Payment method</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {methods.filter(m => m.category === 'instant' || m.category === 'wallet').slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`shrink-0 px-3 py-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                    selectedMethod === m.id ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <div className="text-xs text-muted-foreground mb-1">Note (optional)</div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dinner, splitting bill, ..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>

          {err && (
            <div className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs px-3 py-2">
              {err}
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full rounded-full bg-gradient-hero text-primary-foreground py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60 hover:opacity-95 transition"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {busy ? "Sending…" : "Send"}
          </button>
          <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            No fees · settles instantly via Cirkle Pay rails
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TopupModal({ methods, currency, onClose }: { methods: PaymentMethod[]; currency: string; onClose: () => void }) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<'choose' | 'amount' | 'confirm'>('choose');

  const quickAmounts = [50, 100, 250, 500, 1000, 2000];

  const handleConfirm = () => {
    if (!selected) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    toast.success(`Top-up initiated via ${selected.label}`, {
      description: selected.deeplink_scheme
        ? `Opening ${selected.label} app…`
        : selected.ussd_code
          ? `Dial ${selected.ussd_code} to complete`
          : `${currency} ${amt.toLocaleString()} via ${selected.label}`,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-float p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-secondary font-mono">
              {step === 'choose' ? 'Step 1/3' : step === 'amount' ? 'Step 2/3' : 'Step 3/3'}
            </div>
            <div className="font-display text-2xl">
              {step === 'choose' ? 'Choose method' : step === 'amount' ? 'Enter amount' : 'Confirm'}
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'choose' && (
          <div className="space-y-1.5">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); setStep('amount'); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/5 transition text-left border border-transparent hover:border-border"
              >
                <span className="text-xl w-8 text-center">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {m.fee_pct === 0 ? 'Zero fees' : `${m.fee_pct}% fee`} · Max {m.currency} {m.max.toLocaleString()}
                    {m.ussd_code ? ` · USSD ${m.ussd_code}` : ''}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {step === 'amount' && selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/5 border border-secondary/20">
              <span className="text-lg">{selected.icon}</span>
              <span className="text-sm font-medium">{selected.label}</span>
              <button onClick={() => setStep('choose')} className="ml-auto text-[10px] text-secondary hover:underline">Change</button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`rounded-xl py-2.5 text-sm font-medium border transition ${
                    amount === String(a) ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  {currency} {a}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Custom amount in ${currency}`}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />

            <button
              onClick={() => amount && parseFloat(amount) > 0 && setStep('confirm')}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full rounded-full bg-gradient-hero text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-60 hover:opacity-95 transition"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'confirm' && selected && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium flex items-center gap-1">{selected.icon} {selected.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-display text-lg">{currency} {parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span>{selected.fee_pct === 0 ? 'FREE' : `${currency} ${(parseFloat(amount) * selected.fee_pct / 100).toFixed(2)} (${selected.fee_pct}%)`}</span>
              </div>
              {selected.deeplink_scheme && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">App</span>
                  <span className="text-secondary flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Opens {selected.label}</span>
                </div>
              )}
              {selected.ussd_code && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">USSD</span>
                  <span className="font-mono">{selected.ussd_code}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-muted/50 transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-full bg-gradient-hero text-primary-foreground py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Cirkle Pay is non-custodial. Your wallet app handles authentication and KYC.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
