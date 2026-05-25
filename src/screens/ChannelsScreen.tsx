// Official Channels + Creator Channels. Prototype design language.
// Covers Channel types, Verification, Emergency alerts, Discovery,
// .x Creator monetisation, + Summary.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Radio, BadgeCheck, Search, Plus, AlertTriangle, Sparkles, Globe2, Building2,
  Mic2, Tv, Users, ShieldCheck,
} from "lucide-react";
import { apiGet, type Channel } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

type Filter = "all" | "official" | "creator";

export function ChannelsScreen() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    apiGet<{ channels: Channel[] }>("/channels")
      .then((d) => setChannels(d.channels ?? []))
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      channels.filter((c) => {
        if (filter !== "all" && c.channel_type !== filter) return false;
        if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [channels, filter, q]
  );

  const counts = useMemo(() => {
    const off = channels.filter((c) => c.channel_type === "official").length;
    const cre = channels.filter((c) => c.channel_type === "creator").length;
    return { off, cre, total: channels.length };
  }, [channels]);

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Channels"
        arabic="القنوات"
        section="+ "
        tagline="Verified institutions · Independent creators"
        right={
          <button className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      {/* Stats strip */}
      <div className="px-5 grid grid-cols-3 gap-2">
        <StatPill icon={Building2} label="Official" value={counts.off} />
        <StatPill icon={Mic2} label="Creator" value={counts.cre} />
        <StatPill icon={Tv} label="Total" value={counts.total} />
      </div>

      {/* Search */}
      <div className="px-5">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
            placeholder="Search ministries, broadcasters, creators"
          />
          <Sparkles className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {([
          { k: "all", l: "All" },
          { k: "official", l: "Official" },
          { k: "creator", l: "Creators" },
        ] as { k: Filter; l: string }[]).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              filter === f.k ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Emergency banner */}
      <div className="mx-5 rounded-2xl border border-red-500/30 bg-red-500/5 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-red-500">Emergency alerts</div>
          <div className="text-xs text-foreground/90">Opt-in high-priority push for civil-defense, weather, earthquake.</div>
        </div>
        <button className="text-[11px] px-2.5 py-1 rounded-full bg-red-500/15 text-red-500 hover:bg-red-500/25 transition">Enable</button>
      </div>

      {/* Channel list */}
      {loading ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">Loading channels…</div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">No channels match this filter</div>
      ) : (
        <ul className="space-y-2 px-3">
          {filtered.map((c, i) => (
            <motion.li key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft hover:bg-muted/30 transition">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground font-display text-lg shrink-0 ${
                  c.channel_type === "official" ? "bg-gradient-hero" : "bg-gradient-mesh"
                }`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium truncate">{c.name}</span>
                    {c.verified ? <BadgeCheck className="w-3.5 h-3.5 text-secondary" /> : null}
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                      c.channel_type === "official" ? "bg-secondary/15 text-secondary" : "bg-amber-500/15 text-amber-600"
                    }`}>
                      {c.channel_type === "official" ? "Official" : "Creator"}
                    </span>
                    {c.category && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c.category}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.subscriber_count.toLocaleString()}</span>
                    {c.country && <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> {c.country}</span>}
                  </div>
                </div>
                <button className="text-[11px] px-3 py-1.5 rounded-full bg-secondary/15 text-secondary hover:bg-secondary/25 transition shrink-0">
                  Follow
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Verification info card */}
      <div className="mx-5 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <h3 className="font-display text-sm">Verification</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Government channels verify via diplomatic-mission DNS records ·
          Businesses & media self-verify via domain TXT records ·
          Creators verify via Circle Verify () — no paid blue check.
        </p>
      </div>

      <ProtoFooter section="+ " title="Broadcast without gatekeepers">
        Cryptographically verified institutions and creators. Federation via Matrix; content stored on
        IPFS. Anonymous aggregate analytics only. No paid verification.
      </ProtoFooter>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl py-3 px-3 flex items-center gap-2">
      <Icon className="w-4 h-4 text-secondary" />
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-lg leading-none">{value}</div>
      </div>
    </div>
  );
}

export default ChannelsScreen;
