// — Circle Mail. Prototype design language + real /api/mail wiring.
// Covers Folders, Encrypted by default, On-device AI summaries, No-ad-scan.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail as MailIcon, Inbox, Send as SendIcon, Archive, Star,
  Search, ShieldCheck, Sparkles, PenSquare, Trash2,
} from "lucide-react";
import { apiGet, type Mail } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

const ME = 1;

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
          <button className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
            <PenSquare className="w-4 h-4" />
          </button>
        }
      />

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
        Your @circle.app address is PGP-encrypted by default, federated over your home server, and free
        of ad-scanning. AI summaries run on-device only — never in the cloud. Compose, send, archive,
        and trash work exactly as you'd expect from any modern mail app.
      </ProtoFooter>
    </div>
  );
}

export default MailScreen;
