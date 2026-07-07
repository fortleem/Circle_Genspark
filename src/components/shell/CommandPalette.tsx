// Cirkle Universal Command Palette — ⌘K / Ctrl+K from any screen.
// Distinguishes Cirkle: WhatsApp/IG/X/YT have NO universal launcher. This one merges
// navigation (37 routes), server-side fuzzy search across all pillars, and quick actions.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, X, MessageCircle, Play, Image as ImageIcon, Hash, Wallet, MapPin,
  Sparkles, ChevronRight, Compass, Mail, Plane, Languages, ShieldCheck,
  KeyRound, BookOpen, Briefcase, Building2, Loader2, ArrowRight,
} from "lucide-react";
import { NAV_ITEMS, findNavMatch } from "@/lib/tabs";
import { apiGet, type CommandResult } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

const KIND_ICON: Record<CommandResult["kind"], any> = {
  room: MessageCircle,
  channel: Compass,
  video: Play,
  post: Hash,
  user: Briefcase,
};

const QUICK_ACTIONS = [
  { label: "Send money via Wasl",   route: "/wasl",     icon: Wallet,        hint: "Tap a chat → 💰" },
  { label: "Compose mail",          route: "/mail",     icon: Mail,          hint: "Encrypted by default" },
  { label: "Plan a trip",           route: "/rihla",    icon: Plane,         hint: "Rihla itinerary" },
  { label: "Translate live",        route: "/translate",icon: Languages,     hint: "On-device · no cloud" },
  { label: "AI safety controls",    route: "/aisafety", icon: ShieldCheck,   hint: "Per-pillar limits" },
  { label: "My digital ID",         route: "/id",       icon: KeyRound,      hint: "Passkeys + DIDs" },
  { label: "Education workspace",   route: "/madrasa",  icon: Building2,     hint: "Madrasa" },
  { label: "Open journeys",         route: "/journeys", icon: BookOpen,      hint: "User stories" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CommandResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { names } = useApp();
  const navigate = useNavigate();

  // Global keyboard shortcut: ⌘K / Ctrl+K to open, Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-focus input when opened.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQ("");
      setResults([]);
      setActiveIdx(0);
    }
  }, [open]);

  // Debounced server-side content search.
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const r = await apiGet<{ results: CommandResult[] }>(`/command/search?q=${encodeURIComponent(q.trim())}`);
        setResults(r.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  // Local nav matches (route jump).
  const navMatches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return NAV_ITEMS
      .filter((n) => {
        const label = n.label(names).toLowerCase();
        return (
          label.includes(term) ||
          n.id.includes(term) ||
          n.hint.toLowerCase().includes(term) ||
          n.keywords.some((k) => k.toLowerCase().includes(term))
        );
      })
      .slice(0, 6);
  }, [q, names]);

  // Combined hit list for arrow-key navigation.
  const allHits = useMemo(() => {
    const term = q.trim();
    if (!term) {
      // No query — show quick actions + recent pillars
      return [
        ...QUICK_ACTIONS.map((a, i) => ({ id: `qa-${i}`, label: a.label, hint: a.hint, route: a.route, icon: a.icon, group: "Quick" })),
        ...NAV_ITEMS.filter((n) => n.primary).map((n) => ({
          id: `nav-${n.id}`, label: n.label(names), hint: n.hint, route: n.path, icon: n.icon, group: "Pillars",
        })),
      ];
    }
    const navHits = navMatches.map((n) => ({
      id: `nav-${n.id}`, label: n.label(names), hint: n.hint, route: n.path, icon: n.icon, group: "Jump to",
    }));
    const contentHits = results.map((r) => ({
      id: `${r.kind}-${r.id}`, label: r.title, hint: r.hint || r.kind, route: r.route, icon: KIND_ICON[r.kind], group: "Content",
    }));
    return [...navHits, ...contentHits];
  }, [q, navMatches, results, names]);

  // Keep active index in bounds
  useEffect(() => { setActiveIdx(0); }, [q]);

  const submit = (idx?: number) => {
    const hit = allHits[idx ?? activeIdx];
    if (hit) {
      navigate(hit.route);
      setOpen(false);
    } else if (q.trim()) {
      // Fallback to label-based nav match
      const m = findNavMatch(q, (item) => item.label(names));
      if (m) {
        navigate(m.path);
        setOpen(false);
      }
    }
  };

  // Group rendering helper
  const grouped = useMemo(() => {
    const m = new Map<string, typeof allHits>();
    allHits.forEach((h) => {
      const arr = m.get(h.group) ?? [];
      arr.push(h);
      m.set(h.group, arr);
    });
    return Array.from(m.entries());
  }, [allHits]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-xl flex items-start justify-center pt-[12vh] px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.97 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl orbit-ring overflow-hidden shadow-float"
              role="dialog"
              aria-label="Cirkle command palette"
            >
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allHits.length - 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
                    else if (e.key === "Enter") { e.preventDefault(); submit(); }
                  }}
                  placeholder="Search anything — chats, videos, posts, people, places…"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                {loadingSearch && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
                <span className="gold-stroke text-[9px] uppercase">⌘K</span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-muted/50 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[55vh] overflow-y-auto py-1">
                {grouped.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    <Sparkles className="w-5 h-5 mx-auto mb-2 opacity-50" />
                    No matches. Try a pillar name, a person's handle, or a hashtag.
                  </div>
                ) : (
                  grouped.map(([group, items]) => (
                    <div key={group} className="px-1 py-1">
                      <div className="px-3 pt-1 pb-1 text-[9px] uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                        {group}
                      </div>
                      {items.map((h) => {
                        const idx = allHits.indexOf(h);
                        const Icon = h.icon ?? ImageIcon;
                        const active = idx === activeIdx;
                        return (
                          <button
                            key={h.id}
                            onMouseEnter={() => setActiveIdx(idx)}
                            onClick={() => submit(idx)}
                            className={`w-full text-start flex items-center gap-3 px-3 py-2 mx-1 rounded-xl transition ${
                              active ? "bg-gradient-to-r from-secondary/20 to-primary/10 ring-1 ring-secondary/40" : "hover:bg-muted/40"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              active ? "bg-gradient-gold text-brand-charcoal" : "bg-muted/40 text-foreground"
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{h.label}</div>
                              {h.hint && (
                                <div className="text-[10.5px] text-muted-foreground truncate">{h.hint}</div>
                              )}
                            </div>
                            {active ? (
                              <ArrowRight className="w-3.5 h-3.5 text-secondary shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span><kbd className="px-1 py-0.5 rounded bg-muted/40 font-mono">↑↓</kbd> navigate</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-muted/40 font-mono">⏎</kbd> open</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-muted/40 font-mono">Esc</kbd> close</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> Searches your local D1 only — never cloud-indexed
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
