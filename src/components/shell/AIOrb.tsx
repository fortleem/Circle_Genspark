import { motion } from "framer-motion";
import { Sparkles, X, Send, Mic } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/tabs";
import { useApp } from "@/providers/AppProvider";

export function AIOrb() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { names } = useApp();
  const nav = useNavigate();

  const ask = (text: string) => {
    const t = text.trim().toLowerCase();
    if (!t) return;
    // Naive intent routing — find the first nav item whose label/id/sections contains the query
    const match = NAV_ITEMS.find(n =>
      n.label(names).toLowerCase().includes(t) ||
      n.id.includes(t) ||
      n.sections.toLowerCase().includes(t)
    );
    if (match) {
      nav(match.path);
      setOpen(false);
      setQ("");
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
        aria-label="AI Assistant"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-mesh rounded-full blur-xl opacity-70 animate-spin-slow" />
          <div className="relative w-14 h-14 rounded-full bg-gradient-mesh animate-orb-float flex items-center justify-center shadow-float">
            <div className="absolute inset-0.5 rounded-full bg-background/30 backdrop-blur-md" />
            <Sparkles className="relative w-6 h-6 text-primary-foreground drop-shadow" />
          </div>
        </div>
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-background/60 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="glass-strong w-full max-w-2xl rounded-3xl p-6 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-mesh flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-display text-lg">Ask {names.brand_name}</div>
                  <div className="text-xs text-muted-foreground">On-device · No data leaves your phone</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); ask(q); }}
              className="relative"
            >
              <input
                autoFocus
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Try: mesh, payments, mashahd, …"
                className="w-full bg-muted/40 rounded-2xl pl-4 pr-24 py-3 text-sm outline-none focus:bg-muted/60 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </button>
                <button type="submit" className="w-9 h-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {['wasl', 'mashahd', 'mesh', 'translate'].map((s) => (
                <button key={s} onClick={() => ask(s)}
                  className="text-[11px] text-muted-foreground px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition">
                  Open <span className="text-foreground capitalize">{s}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
