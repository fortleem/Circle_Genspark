// — The Cirkle (Group System). Prototype design language.
// Covers Creating, Roles, Modes, Features, Summary.
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Search, Globe2, Lock, Sparkles, Calendar, FileText,
  Vote, FolderArchive, BookOpen, UserPlus, ScrollText, ShieldCheck,
} from "lucide-react";
import { apiGet, type CirkleGroup } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

type Mode = "all" | "public" | "private" | "federated";

export function CirklesScreen() {
  const [cirkles, setCirkles] = useState<CirkleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    apiGet<{ cirkles: CirkleGroup[] }>("/cirkles")
      .then((d) => setCirkles(d.cirkles ?? []))
      .catch(() => setCirkles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return cirkles.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !(c.description ?? "").toLowerCase().includes(q.toLowerCase())) return false;
      if (mode === "all") return true;
      const v = c.visibility ?? c.mode ?? "public";
      return v === mode;
    });
  }, [cirkles, q, mode]);

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Cirkles"
        arabic="الدائرة"
        section=""
        tagline="Public · private · federated"
        right={
          <button className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-5">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
            placeholder="Discover cirkles, communities, causes"
          />
          <Sparkles className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* Mode filter */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {([
          { k: "all", l: "All" },
          { k: "public", l: "Public" },
          { k: "private", l: "Private" },
          { k: "federated", l: "Federated" },
        ] as { k: Mode; l: string }[]).map((m) => (
          <button
            key={m.k}
            onClick={() => setMode(m.k)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              mode === m.k ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {m.l}
          </button>
        ))}
      </div>

      {/* Features row */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Built into every Cirkle
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {[
            { i: Calendar, l: "Events" },
            { i: Vote, l: "Polls" },
            { i: FolderArchive, l: "Files" },
            { i: FileText, l: "Wiki" },
            { i: BookOpen, l: "Watch" },
            { i: UserPlus, l: "Members" },
            { i: ScrollText, l: "Audit" },
            { i: ShieldCheck, l: "Bylaws" },
          ].map((f) => (
            <div key={f.l} className="glass rounded-xl py-2.5 flex flex-col items-center gap-1 hover:scale-[1.02] transition" title={f.l}>
              <f.i className="w-4 h-4 text-secondary" />
              <span className="text-[9px] text-foreground/80">{f.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cirkle cards */}
      {loading ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">Loading cirkles…</div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">No cirkles match this filter</div>
      ) : (
        <ul className="space-y-3 px-3">
          {filtered.map((c, i) => {
            const isPrivate = (c.visibility ?? c.mode) === "private";
            return (
              <motion.li key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft hover:shadow-float transition">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-mesh flex items-center justify-center text-primary-foreground font-display text-lg shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium truncate">{c.name}</span>
                        {isPrivate ? (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Private
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-secondary/15 text-secondary flex items-center gap-0.5">
                            <Globe2 className="w-2.5 h-2.5" /> Public
                          </span>
                        )}
                        {c.category && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c.category}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.member_count.toLocaleString()}</span>
                        {c.city && <span>· {c.city}</span>}
                        <button className="ms-auto text-secondary hover:underline">
                          {isPrivate ? "Request to join" : "Join"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      <ProtoFooter section="Summary" title="Long-haul communities">
        Owner / admin / moderator / member roles · IPFS-pinned archives · member voting · bylaws ·
        audit log · full data export. No algorithmic engagement traps — Cirkles are for the long haul.
      </ProtoFooter>
    </div>
  );
}

export default CirklesScreen;
