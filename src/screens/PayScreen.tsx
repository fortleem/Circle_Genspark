// — Circle Pay. Prototype design language + real /api/pay/wallet wiring.
// Covers Wallet card, Send (P2P), Scan/NFC, Activity, Compliance.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ScanLine, Send, Plus, Eye, EyeOff, Nfc, ShieldCheck,
  ArrowUpRight, ArrowDownLeft, X, Loader2, Sparkles,
} from "lucide-react";
import { apiGet, apiPost, type Wallet, type Txn } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

const ME = 1; // Demo current-user id

export function PayScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [showSend, setShowSend] = useState(false);

  const load = () => {
    setLoading(true);
    apiGet<{ wallet: Wallet; transactions: Txn[] }>(`/pay/wallet/${ME}`)
      .then((d) => {
        setWallet(d.wallet ?? null);
        setTxns(d.transactions ?? []);
      })
      .catch(() => { setWallet(null); setTxns([]); })
      .finally(() => setLoading(false));
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
                <div className="text-xs opacity-70">Circle ID · @ahmed.saleh</div>
                <div className="text-sm tracking-[0.3em] mt-1">•••• {String(ME).padStart(4, "0")}</div>
              </div>
              <Nfc className="w-6 h-6 opacity-80" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 px-5">
        {[
          { icon: ScanLine, label: "Scan", onClick: () => {} },
          { icon: Send, label: "Send", onClick: () => setShowSend(true) },
          { icon: Plus, label: "Top-up", onClick: () => {} },
          { icon: ShieldCheck, label: "Vault", onClick: () => {} },
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
            "Per-jurisdiction TX limits",
            "AML screening",
            "Funds segregation",
            "PCI-DSS",
          ].map((c) => (
            <span key={c} className="glass rounded-full px-3 py-1 text-[11px] text-foreground/80 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-secondary" />
              {c}
            </span>
          ))}
        </div>
      </div>

      <ProtoFooter section="" title="Money that respects you">
        Real wallet, real transactions, zero surveillance ads. Send to anyone with a @handle, tap-to-pay
        over NFC, scan QR codes — and stay compliant in 80+ jurisdictions through Tier-2 KYC-Lite.
      </ProtoFooter>

      {/* Send modal */}
      {showSend && (
        <SendModal
          onClose={() => setShowSend(false)}
          onSent={() => { setShowSend(false); load(); }}
        />
      )}
    </div>
  );
}

function SendModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [handle, setHandle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
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
        method: "handle",
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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            <div className="text-xs text-muted-foreground mb-1">Amount</div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>
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
            No fees · settles instantly via Circle Pay rails
          </p>
        </div>
      </motion.div>
    </div>
  );
}
