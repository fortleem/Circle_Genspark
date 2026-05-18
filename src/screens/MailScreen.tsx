// §20 — Circle Mail (Gmail replacement)
import { PageShell, GlassCard, EmptyState, SectionHeader } from "@/components/shell/PageShell";
import { Mail as MailIcon, Inbox, Send, Archive, Star } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { Mail } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";
import { useState } from "react";

const FOLDERS = [
  { id: "inbox",   icon: Inbox,   label: "Inbox" },
  { id: "sent",    icon: Send,    label: "Sent" },
  { id: "starred", icon: Star,    label: "Starred" },
  { id: "archive", icon: Archive, label: "Archive" },
];

export function MailScreen() {
  const { names } = useApp();
  const [folder, setFolder] = useState("inbox");
  // For demo: load user_id=1's mailbox
  const { data, loading } = useApi<{ mail: Mail[] }>(`/mail/1?folder=${folder}`, [folder]);
  const mail = data?.mail ?? [];
  return (
    <PageShell
      icon={MailIcon}
      title={names.module_mail}
      arabicTitle="بريد دواير"
      section="§20"
      tagline="Encrypted federated email with on-device AI summaries — no ad scanning"
      intro="Circle Mail uses PGP-by-default plus the Matrix-bridged Maildir on your federated home server. AI summaries run on-device only; nothing is read by any external service."
      actions={
        <div className="flex flex-wrap gap-1 text-xs">
          {FOLDERS.map((f) => (
            <button key={f.id} onClick={() => setFolder(f.id)}
              className={`px-2.5 py-1 rounded-full border flex items-center gap-1 ${folder === f.id ? "bg-secondary text-secondary-foreground border-secondary" : "glass border-border/40"}`}>
              <f.icon className="w-3 h-3" /> {f.label}
            </button>
          ))}
        </div>
      }
    >
      <SectionHeader title="Messages" hint={`${mail.length} in ${folder}`} />
      {loading ? <EmptyState message="Loading mail..." /> : mail.length === 0 ? <EmptyState message="No messages in this folder." /> : (
        <div className="space-y-2">
          {mail.map((m) => (
            <GlassCard key={m.id} className={!m.is_read ? "border-secondary/30" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{m.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">From: {m.from_addr}</p>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{m.preview}</p>
                  {m.ai_summary && (
                    <p className="text-xs text-secondary mt-2 italic">AI: {m.ai_summary}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default MailScreen;
