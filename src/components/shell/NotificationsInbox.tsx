// Cirkle Notifications Inbox — universal cross-pillar inbox in a slide-down sheet.
// Triggered from the TopBar bell. Distinct from incumbents: shows priority bands,
// pillar-coloured kind chips, "mark all read", and deep-links into the right route.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, X, MessageCircle, Play, Hash, Wallet, Compass,
  BadgeCheck, Vote, Sparkles, AlertTriangle, CheckCheck, Loader2,
} from "lucide-react";
import { apiGet, apiPost, type Notification, type NotificationCounts } from "@/lib/api";

const ME = 1;

const KIND_META: Record<Notification["kind"], { icon: any; tone: string; label: string }> = {
  wasl:    { icon: MessageCircle, tone: "from-primary/30 to-primary/10",     label: "Chat" },
  mashahd: { icon: Play,          tone: "from-secondary/30 to-secondary/10", label: "Video" },
  midan:   { icon: Hash,          tone: "from-accent/30 to-accent/10",       label: "Square" },
  pay:     { icon: Wallet,        tone: "from-amber-500/30 to-amber-500/10", label: "Pay" },
  mesh:    { icon: Compass,       tone: "from-emerald-500/30 to-emerald-500/10", label: "Mesh" },
  verify:  { icon: BadgeCheck,    tone: "from-cyan-500/30 to-cyan-500/10",   label: "Verify" },
  gov:     { icon: Vote,          tone: "from-purple-500/30 to-purple-500/10", label: "Gov" },
  system:  { icon: Sparkles,      tone: "from-muted/40 to-transparent",      label: "System" },
};

export function NotificationsInbox({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, high: 0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "priority">("all");
  const navigate = useNavigate();

  const refresh = async () => {
    setLoading(true);
    try {
      const path = filter === "unread"
        ? `/notifications/${ME}?unread=1`
        : `/notifications/${ME}`;
      const r = await apiGet<{ notifications: Notification[]; counts: NotificationCounts }>(path);
      let n = r.notifications ?? [];
      if (filter === "priority") n = n.filter((x) => x.priority >= 50);
      setItems(n);
      setCounts(r.counts ?? { total: 0, unread: 0, high: 0 });
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filter]);

  const click = async (n: Notification) => {
    try { await apiPost(`/notifications/${ME}/read`, { id: n.id }); } catch { /* silent */ }
    if (n.link) navigate(n.link);
    onClose();
  };

  const markAll = async () => {
    try {
      await apiPost(`/notifications/${ME}/read`, { all: true });
      await refresh();
    } catch { /* silent */ }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-background/60 backdrop-blur-md flex items-start justify-end p-3 sm:p-4"
        >
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="orbit-ring w-full sm:w-[400px] max-h-[88vh] flex flex-col overflow-hidden shadow-float mt-[60px]"
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full mesh-fill flex items-center justify-center">
                <Bell className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base">Inbox</div>
                <div className="text-[10px] text-muted-foreground">
                  {counts.unread} unread · {counts.total} total {counts.high > 0 && (
                    <span className="text-accent ms-1">· {counts.high} high-priority</span>
                  )}
                </div>
              </div>
              {counts.unread > 0 && (
                <button
                  onClick={markAll}
                  className="gold-stroke text-[10px] uppercase tracking-wider"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all
                </button>
              )}
              <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-muted/50 flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter chips */}
            <div className="px-3 py-2 flex items-center gap-1.5 border-b border-border/30">
              {(["all", "unread", "priority"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full transition ${
                    filter === f
                      ? "bg-gradient-to-r from-secondary/30 to-primary/15 ring-1 ring-secondary/40 text-foreground"
                      : "text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-1 px-1">
              {loading ? (
                <div className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  <Bell className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  Nothing to show. You're all caught up.
                </div>
              ) : (
                items.map((n) => {
                  const meta = KIND_META[n.kind] ?? KIND_META.system;
                  const Icon = meta.icon;
                  const isHigh = n.priority >= 50;
                  return (
                    <button
                      key={n.id}
                      onClick={() => click(n)}
                      className={`w-full text-start flex items-start gap-3 px-3 py-2.5 mx-1 my-0.5 rounded-xl transition relative ${
                        n.unread ? "bg-muted/30" : "hover:bg-muted/30"
                      }`}
                    >
                      {/* Priority strip */}
                      {isHigh && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-accent" />
                      )}
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.tone} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-medium text-[13px] truncate">{n.title}</span>
                          {n.unread === 1 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                          )}
                          {isHigh && (
                            <AlertTriangle className="w-3 h-3 text-accent shrink-0" />
                          )}
                        </div>
                        {n.body && (
                          <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                            {n.body}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="gold-stroke text-[8.5px] uppercase tracking-widest">
                            {meta.label}
                          </span>
                          <span className="text-[9px] text-muted-foreground/70">
                            {formatRelative(n.created_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Local-first · synced via mesh when offline</span>
              <span className="font-mono">⌘ + N</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMin = Math.floor((now - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString();
}
