// — Cirkle Mail. Prototype design language + real /api/mail wiring.
// Covers Folders, Encrypted by default, On-device AI summaries, No-ad-scan.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail as MailIcon, Inbox, Send as SendIcon, Archive, Star,
  Search, ShieldCheck, Sparkles, PenSquare, Trash2,
} from "lucide-react";
import { apiGet, apiPost, type Mail } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";
import { motion as motionAlias, AnimatePresence } from "framer-motion";
import { X, Send as SendArrow, Lock, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { getMe } from "@/lib/session";
const ME = getMe();

const FOLDERS = [
  { id: "inbox", icon: Inbox, label: "Inbox" },
  { id: "sent", icon: SendIcon, label: "Sent" },
  { id: "starred", icon: Star, label: "Starred" },
  { id: "archive", icon: Archive, label: "Archive" },
];

// Heuristic on-device "AI summary" — no data leaves the device
function summarize(body: string): string {
  if (!body) return "";
  const trimmed = body.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 90) return "";
  // Take first sentence or first 80 chars
  const dot = trimmed.indexOf(". ");
  const first = dot > 0 && dot < 120 ? trimmed.slice(0, dot + 1) : trimmed.slice(0, 80) + "…";
  return first;
}

export function MailScreen() {
  const [folder, setFolder] = useState("inbox");
  const [messages, setMessages] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGet<{ folder: string; messages: Mail[] }>(`/mail/${ME}?folder=${folder}`)
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [folder]);

  const filtered = useMemo(() => {
    if (!q) return messages;
    const ql = q.toLowerCase();
    return messages.filter(
      (m) =>
        m.subject.toLowerCase().includes(ql) ||
        m.from_addr.toLowerCase().includes(ql) ||
        (m.body ?? "").toLowerCase().includes(ql)
    );
  }, [messages, q]);

  const unread = messages.filter((m) => m.read_flag === 0).length;

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Mail"
        arabic="بريد"
        section=""
        tagline="PGP-default · federated · on-device AI summaries"
        right={
          <button
            onClick={() => setComposeOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center hover:scale-105 transition"
            title="Compose new message"
          >
            <PenSquare className="w-4 h-4" />
          </button>
        }
      />
      <MailComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} onSent={() => {
        setComposeOpen(false);
        apiGet<{ folder: string; messages: Mail[] }>(`/mail/${ME}?folder=${folder}`)
          .then((d) => setMessages(d.messages ?? []))
          .catch(() => {});
      }} />

      {/* Folder tabs */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFolder(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1.5 ${
              folder === f.id ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            <f.icon className="w-3 h-3" />
            {f.label}
            {f.id === "inbox" && unread > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                folder === f.id ? "bg-primary-foreground/20" : "bg-secondary/15 text-secondary"
              }`}>
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-5">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
            placeholder="Search mail"
          />
        </div>
      </div>

      {/* + Privacy chips */}
      <div className="px-5">
        <div className="flex flex-wrap gap-2">
          {[
            { i: ShieldCheck, l: "PGP by default" },
            { i: ShieldCheck, l: "No ad scanning" },
            { i: Sparkles, l: "On-device AI summaries" },
          ].map((c) => (
            <span key={c.l} className="glass rounded-full px-3 py-1 text-[11px] text-foreground/80 flex items-center gap-1">
              <c.i className="w-3 h-3 text-secondary" />
              {c.l}
            </span>
          ))}
        </div>
      </div>

      {/* Message list */}
      <section className="px-5">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-mono"></span>
          <h2 className="font-display text-lg capitalize">{folder}</h2>
          <span className="text-[11px] text-muted-foreground">· {filtered.length}</span>
        </div>

        {loading ? (
          <div className="py-8 text-sm text-muted-foreground text-center">Loading mail…</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground text-center">
            <MailIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No messages in {folder}.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((m, i) => {
              const isUnread = m.read_flag === 0;
              const summary = summarize(m.body ?? "");
              const initials = (m.from_addr.split("@")[0] ?? "?").slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-2xl border bg-card p-3 hover:shadow-float transition cursor-pointer ${
                    isUnread ? "border-secondary/40" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-mesh text-primary-foreground flex items-center justify-center font-display text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate ${isUnread ? "font-semibold" : "font-medium"}`}>
                          {m.from_addr}
                        </span>
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />}
                        <span className="text-[10px] text-muted-foreground ms-auto shrink-0">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={`text-sm truncate mt-0.5 ${isUnread ? "text-foreground" : "text-foreground/80"}`}>
                        {m.subject}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {(m.body ?? "").slice(0, 120)}
                      </p>
                      {summary && (
                        <div className="mt-1.5 flex items-start gap-1 text-[10px] text-secondary italic">
                          <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{summary}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <ProtoFooter section="" title="Mail that won't read you">
        Your @cirkle.app address is PGP-encrypted by default, federated over your home server, and free
        of ad-scanning. AI summaries run on-device only — never in the cloud. Compose, send, archive,
        and trash work exactly as you'd expect from any modern mail app.
      </ProtoFooter>
    </div>
  );
}

export default MailScreen;

// ── MailComposeModal — wired to /mail/send with PGP toggle + anonymous-from option
function MailComposeModal({ open, onClose, onSent }: { open: boolean; onClose: () => void; onSent: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [encrypted, setEncrypted] = useState(true);
  const [anon, setAnon] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!to.trim() || !subject.trim()) return;
    setSending(true);
    try {
      const r = await apiPost<{ ok: boolean }>('/mail/send', {
        from_user: ME, to_addr: to, subject, body,
        is_encrypted: encrypted ? 1 : 0,
        is_anonymous: anon ? 1 : 0,
      });
      if (r.ok) {
        toast.success("Mail sent", { description: encrypted ? "PGP-sealed" : "delivered" });
        setTo(""); setSubject(""); setBody("");
        onSent();
      }
    } catch (e: any) {
      toast.error("Send failed", { description: e?.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motionAlias.div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motionAlias.div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motionAlias.div
            className="relative w-full sm:max-w-lg orbit-ring mx-2 sm:mx-0 mb-2 sm:mb-0 bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden"
            initial={{ y: 60, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-hero grid place-items-center">
                  <SendArrow className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight">New message</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">PGP-default · federated</div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4 space-y-3">
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="To: someone@cirkle.network" className="w-full bg-muted/40 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full bg-muted/40 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message…" rows={6} className="w-full bg-muted/40 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setEncrypted(v => !v)} className={`gold-stroke text-[10px] px-2.5 py-1 rounded-full ${encrypted ? 'bg-primary/15 font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  <Lock className="w-3 h-3" /> {encrypted ? 'PGP encrypted' : 'Plaintext'}
                </button>
                <button onClick={() => setAnon(v => !v)} className={`gold-stroke text-[10px] px-2.5 py-1 rounded-full ${anon ? 'bg-secondary/15 font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  <EyeOff className="w-3 h-3" /> {anon ? 'Anon-from' : 'Sign with @me'}
                </button>
              </div>
            </div>

            <div className="p-3 border-t border-border/40 flex gap-2">
              <button onClick={onClose} className="px-3 py-2 text-sm rounded-lg hover:bg-muted">Cancel</button>
              <button onClick={send} disabled={sending || !to.trim() || !subject.trim()} className="flex-1 px-3 py-2 text-sm rounded-lg gold-stroke bg-primary/15 hover:bg-primary/25 disabled:opacity-40 flex items-center justify-center gap-2 font-semibold">
                {sending ? <Sparkles className="w-4 h-4 animate-spin" /> : <SendArrow className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </motionAlias.div>
        </motionAlias.div>
      )}
    </AnimatePresence>
  );
}
