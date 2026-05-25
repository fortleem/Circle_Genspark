// — Mashahd (Video Module). Prototype reels-stack UI preserved.
// Wired to /api/mashahd/videos. Adds overview, .x revenue chips,
// tipping widget mock, compliance footer.
import { useEffect, useState } from "react";
import {
  Heart, MessageCircle, Share2, Music, Sparkles, Radio, Gift, Coins,
  Shield, BadgeCheck, Hash, DollarSign, Globe2, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost, type Video } from "@/lib/api";

type Filter = "For you" | "Following" | "Live" | "Cinematic" | "Channels" | "Music" | "Local";

export function MashahdScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("For you");
  const [tipping, setTipping] = useState<Video | null>(null);

  useEffect(() => {
    setLoading(true);
    apiGet<{ videos: Video[] }>("/mashahd/videos")
      .then((d) => setVideos(d.videos ?? []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  async function like(v: Video) {
    try {
      await apiPost(`/mashahd/videos/${v.id}/like`, {});
      setVideos((all) => all.map((x) => (x.id === v.id ? { ...x, likes: x.likes + 1 } : x)));
    } catch { /* silent */ }
  }

  return (
    <div className="pb-24">
      {/* Header — prototype */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">
            Mashahd <span className="text-base text-muted-foreground tracking-widest uppercase">مشاهد</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            · PeerTube + IPFS · P2P
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> {Math.max(1, videos.length)} streaming
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {(["For you", "Following", "Live", "Cinematic", "Channels", "Music", "Local"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              filter === f ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sponsored Hashtag strip (city-level) */}
      <div className="mx-5 mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 flex items-center gap-2 text-[11px]">
        <Tag className="w-3.5 h-3.5 text-amber-500" />
        <span className="uppercase tracking-wider text-amber-600 text-[9px]">Sponsored </span>
        <span className="text-foreground/80">#BestCoffeeAlex</span>
        <span className="ms-auto text-muted-foreground text-[10px]">City-level only · no profiling</span>
      </div>

      {/* Reels stack — real videos, prototype design */}
      {loading ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">Loading videos…</div>
      ) : videos.length === 0 ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">No videos yet</div>
      ) : (
        <div className="px-3 mt-5 space-y-4">
          {videos.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-3xl overflow-hidden aspect-[9/14] sm:aspect-[16/9] shadow-float"
            >
              <div className="absolute inset-0 bg-gradient-mesh" />
              <div
                className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent"
                style={{ ["--tw-gradient-from" as any]: "hsl(var(--charcoal) / 0.85)" }}
              />

              {/* Top chips */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="glass text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-secondary" /> AI captions
                </div>
                <div className="glass text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" /> P2P · IPFS
                </div>
              </div>

              {/* Title & creator */}
              <div className="absolute bottom-4 left-4 right-16" style={{ color: "hsl(var(--cream))" }}>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {v.display_name ?? v.handle}
                  {v.verified ? <BadgeCheck className="w-3.5 h-3.5 text-secondary" /> : null}
                </div>
                <div className="text-xs opacity-90 mt-1 line-clamp-2">{v.title}</div>
                {v.description && (
                  <div className="text-[10px] opacity-70 mt-0.5 line-clamp-1">{v.description}</div>
                )}
                <div className="flex items-center gap-3 text-[11px] mt-2 opacity-80">
                  <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Original audio</span>
                  <span>· {Math.floor(v.duration_seconds / 60)}:{String(v.duration_seconds % 60).padStart(2, "0")}</span>
                  <span>· {v.views.toLocaleString()} views</span>
                </div>
              </div>

              {/* Right action rail */}
              <div className="absolute bottom-4 right-3 flex flex-col items-center gap-3" style={{ color: "hsl(var(--cream))" }}>
                <ActionPill icon={Heart} label={kn(v.likes)} onClick={() => like(v)} />
                <ActionPill icon={MessageCircle} label="—" />
                <ActionPill icon={Share2} label="Share" />
                <ActionPill icon={Gift} label="Tip" onClick={() => setTipping(v)} accent />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* / footer — overview + commitments */}
      <div className="mx-5 mt-8 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              · 100% free · zero-cost
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            PeerTube + WebTorrent + IPFS · viewers seed (opt-out) · city-level ads (no profiling) · no premium tier · no viewing history leaves your device.
          </p>
        </div>
      </div>

      {/* Revenue model grid */}
      <div className="mx-5 mt-4 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-secondary" />
          <h3 className="font-display text-sm">Income streams · zero cost to Circle</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <RevTile num="7.3.1" title="Local CPM ads" desc="30% Circle / 70% creator" />
          <RevTile num="7.3.2" title="Affiliate links" desc="80% creator / 20% Circle" />
          <RevTile num="7.3.3" title="Creator premium" desc="$5-10/mo via Stripe/Paymob" />
          <RevTile num="7.3.5" title="Sponsored trends" desc="City-level only · labelled" />
          <RevTile num="7.3.6" title="API freemium" desc="Free <1k req/day" />
          <RevTile num="7.3.7" title="Brand reward pools" desc="5% admin fee" />
          <RevTile num="7.3.8" title="Non-custodial tipping" desc="MoonPay/Ramp · 1.5% referral" />
          <RevTile num="7.3.9" title="Channel memberships" desc="Stripe/Paymob handled" />
        </div>
      </div>

      {/* Compliance footer */}
      <div className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4 text-[11px]">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-secondary" />
          <span className="uppercase tracking-widest text-secondary text-[10px]">Compliance</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Circle never receives, holds, or sends user funds. Widget providers (MoonPay/Ramp/Paymob) handle KYC/AML, sanctions screening, cross-border tax. No money-transmitter licence required. Tipping disabled for under-18; sanctioned regions auto-blocked at widget level.
        </p>
      </div>

      {/* Tipping modal — non-custodial widget mock */}
      <AnimatePresence>
        {tipping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setTipping(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-background rounded-3xl border border-border max-w-sm w-full p-5 shadow-float"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-brand-charcoal">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg">Send a tip</div>
                  <div className="text-xs text-muted-foreground truncate">
                    to @{tipping.handle} · {tipping.title}
                  </div>
                </div>
                <button onClick={() => setTipping(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
              </div>

              <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
                <Globe2 className="w-3 h-3" /> Widget auto-selected by your country
              </p>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {[1, 5, 10, 25].map((amt) => (
                  <button
                    key={amt}
                    className="rounded-xl border border-border bg-card hover:bg-secondary/10 transition py-3 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5 text-secondary" /> ${amt}
                  </button>
                ))}
              </div>

              <button className="w-full rounded-full bg-gradient-hero text-primary-foreground py-3 text-sm font-medium">
                Continue via MoonPay →
              </button>

              <div className="mt-3 text-[10px] text-muted-foreground space-y-1">
                <p>• Circle never sees your payment details</p>
                <p>• Widget handles KYC, currency conversion, payout</p>
                <p>• Net amount goes directly to creator's wallet</p>
                <p>• Circle earns a small referral fee (~1.5%)</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionPill({ icon: Icon, label, onClick, accent }: { icon: any; label: string; onClick?: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <span className={`w-10 h-10 rounded-full flex items-center justify-center ${accent ? "bg-gradient-gold text-brand-charcoal" : "glass-strong"}`}>
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function RevTile({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-2.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[9px] font-mono text-secondary uppercase">§{num}</span>
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function kn(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
  return String(n);
}

export default MashahdScreen;
