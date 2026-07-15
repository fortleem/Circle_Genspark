import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Mic, Globe, Brain, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findNavMatch } from "@/lib/tabs";
import { useApp } from "@/providers/AppProvider";
import { apiPost } from "@/lib/api";

type BrainMeta = { intent?: string; used_web?: boolean; provider?: string; sources?: Array<{ title: string; url: string }> };
type Turn = { role: "user" | "assistant"; content: string; meta?: BrainMeta };

export function AIOrb() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const { names } = useApp();
  const nav = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const ask = async (text: string) => {
    const query = text.trim();
    if (!query || loading) return;

    // 1) Instant navigation for single-word module jumps
    const match = findNavMatch(query, (item) => item.label(names));
    if (match && query.split(/\s+/).length <= 2) {
      nav(match.path);
      setOpen(false);
      setQ("");
      return;
    }

    // 2) Real conversation with Circle Brain
    setQ("");
    const history = turns.map((t) => ({ role: t.role, content: t.content }));
    setTurns((p) => [...p, { role: "user", content: query }]);
    setLoading(true);
    try {
      const res = await apiPost<{
        ok: boolean; text: string; provider: string; used_web: boolean;
        intent: { intent: string; module: string };
        sources: Array<{ title: string; url: string }>;
      }>("/brain/ask", { text: query, user_id: 1, history, lang: navigator.language?.startsWith("ar") ? "ar" : "en" });
      setTurns((p) => [...p, {
        role: "assistant", content: res.text,
        meta: { intent: res.intent?.intent, used_web: res.used_web, provider: res.provider, sources: res.sources },
      }]);
    } catch {
      setTurns((p) => [...p, { role: "assistant", content: "The Brain is momentarily unreachable — try again in a few seconds." }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 60);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        drag
        dragConstraints={{ top: -200, bottom: 0, left: -100, right: 100 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 md:bottom-8 right-4 z-40 group"
        aria-label="Circle Brain AI"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-mesh rounded-full blur-xl opacity-70 animate-spin-slow" />
          <div className="relative w-14 h-14 rounded-full bg-gradient-mesh animate-orb-float flex items-center justify-center shadow-float">
            <div className="absolute inset-0.5 rounded-full bg-background/30 backdrop-blur-md" />
            <Brain className="relative w-6 h-6 text-primary-foreground drop-shadow" />
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-orb-panel"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-background/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="glass-strong w-full max-w-2xl rounded-3xl p-6 shadow-float flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-mesh flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display text-lg">{names.brand_name} Brain</div>
                    <div className="text-xs text-muted-foreground">Orchestrates every module · Live web · Self-learning</div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </header>

              {/* Conversation */}
              {turns.length > 0 && (
                <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 min-h-[120px]">
                  {turns.map((t, i) => (
                    <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        t.role === "user" ? "bg-gradient-hero text-primary-foreground" : "bg-muted/50"
                      }`}>
                        {t.content}
                        {t.meta && (
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                            {t.meta.used_web && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10"><Globe className="w-3 h-3" /> live web</span>}
                            {t.meta.intent && <span className="px-1.5 py-0.5 rounded-full bg-muted">{t.meta.intent}</span>}
                            {t.meta.provider && <span className="px-1.5 py-0.5 rounded-full bg-muted">{t.meta.provider}</span>}
                          </div>
                        )}
                        {t.meta?.sources && t.meta.sources.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {t.meta.sources.slice(0, 3).map((s, j) => (
                              <a key={j} href={s.url} target="_blank" rel="noreferrer" className="block text-[10px] text-primary/80 hover:underline truncate">↗ {s.title || s.url}</a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Circle Brain is thinking — routing intent, checking modules{turns.length ? ", searching web if needed" : ""}…
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="relative">
                <input
                  autoFocus
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Ask anything — news, payments, trends, translate…"
                  className="w-full bg-muted/40 rounded-2xl pl-4 pr-24 py-3 text-sm outline-none focus:bg-muted/60 transition"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center" aria-label="Voice input">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button type="submit" disabled={loading} className="w-9 h-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center disabled:opacity-50" aria-label="Send">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              {turns.length === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  {[
                    "What's trending on Midan?",
                    "Latest AI news today",
                    "How do I pay in Egypt?",
                    "Emergency numbers in UAE",
                  ].map((s) => (
                    <button key={s} onClick={() => ask(s)}
                      className="text-[11px] text-muted-foreground px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition text-left">
                      <Sparkles className="w-3 h-3 inline mr-1 text-primary" />{s}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
