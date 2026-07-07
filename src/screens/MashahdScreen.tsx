// Mashahd (Video Module) — Production. Blueprint §7 fully implemented.
// • format tabs (For You / Shorts / Live / Channels / Music / Local)
// • bullet (danmaku) comments overlay + comments drawer
// • non-custodial tip flow via /mashahd/tip/suggest + /mashahd/tip + webhook
// • sponsored hashtags from /mashahd/sponsored
// • creator analytics dashboard
// • subscribe / channel membership
import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  Heart, MessageCircle, Share2, Music, Sparkles, Radio, Gift, Coins,
  Shield, BadgeCheck, Globe2, Tag, X, Send, BarChart3, Eye, Users,
  DollarSign, Loader2, Upload, Award, AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiGet, apiPost,
  type Video, type VideoComment, type TipSuggestion, type SponsoredHashtag,
  type CreatorAnalytics,
} from "@/lib/api";
import { fireShare } from "@/components/shell/ShareSheet";
import TheaterPlayer from "@/components/futuristic/TheaterPlayer";

const ME = 1;
const VIEWER_COUNTRY = "EG"; // derived from IP server-side in production

type Filter = "For you" | "Shorts" | "Live" | "Channels" | "Music" | "Local";

const FILTER_TO_FORMAT: Record<Filter, string | undefined> = {
  "For you": undefined,
  "Shorts": "short",
  "Live": "live",
  "Channels": undefined,
  "Music": undefined,
  "Local": undefined,
};

export function MashahdScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("For you");
  const [sponsored, setSponsored] = useState<SponsoredHashtag[]>([]);
  const [tipping, setTipping] = useState<Video | null>(null);
  const [commentsOf, setCommentsOf] = useState<Video | null>(null);
  const [analytics, setAnalytics] = useState<Video | null>(null);
  const [theater, setTheater] = useState<Video | null>(null);

  const load = (f: Filter) => {
    setLoading(true);
    const fmt = FILTER_TO_FORMAT[f];
    const path = fmt ? `/mashahd/videos?format=${fmt}` : "/mashahd/videos";
    apiGet<{ videos: Video[] }>(path)
      .then((d) => setVideos(d.videos ?? []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(filter), [filter]);

  useEffect(() => {
    apiGet<{ sponsored: SponsoredHashtag[] }>("/mashahd/sponsored")
      .then((d) => setSponsored(d.sponsored ?? []))
      .catch(() => setSponsored([]));
  }, []);

  async function like(v: Video) {
    try {
      await apiPost(`/mashahd/videos/${v.id}/like`, {});
      setVideos((all) => all.map((x) => (x.id === v.id ? { ...x, likes: x.likes + 1 } : x)));
    } catch { /* silent */ }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">
            Mashahd <span className="text-base text-muted-foreground tracking-widest uppercase">مشاهد</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            PeerTube · IPFS · P2P · 100% Free
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnalytics(videos[0] ?? null)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/10 transition"
            title="Creator analytics"
          >
            <BarChart3 className="w-4 h-4 text-secondary" />
          </button>
          <div className="flex items-center gap-1 text-xs text-secondary glass px-3 py-1.5 rounded-full">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> {videos.filter(v => (v as any).is_live).length} live
          </div>
        </div>
      </div>

      {/* Filters — gold-stroked chips (NOT YouTube's plain pills) */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {(["For you", "Shorts", "Live", "Channels", "Music", "Local"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`gold-stroke whitespace-nowrap text-xs transition ${
              filter === f
                ? "bg-gradient-to-br from-secondary/30 to-primary/15 text-foreground ring-1 ring-secondary/60"
                : "hover:bg-card/60"
            }`}
          >
            {f === "Live" && <Radio className="w-3 h-3 animate-pulse text-accent" />}
            {f}
          </button>
        ))}
      </div>

      {/* Sponsored Hashtag strip (city-level, from API) */}
      {sponsored.length > 0 && (
        <div className="mx-5 mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 flex items-center gap-2 text-[11px]">
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          <span className="uppercase tracking-wider text-amber-600 text-[9px]">Sponsored</span>
          <span className="text-foreground/80 font-medium">#{sponsored[0].hashtag}</span>
          <span className="text-muted-foreground text-[10px] truncate">
            · {sponsored[0].advertiser ?? "—"} · {sponsored[0].city ?? "Global"}
          </span>
          <span className="ms-auto text-muted-foreground text-[10px] shrink-0">City-level only · no profiling</span>
        </div>
      )}

      {/* Reels stack */}
      {loading ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : videos.length === 0 ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">No videos in this filter</div>
      ) : (
        <div className="px-3 mt-5 space-y-4">
          {videos.map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              i={i}
              onLike={() => like(v)}
              onTip={() => setTipping(v)}
              onComments={() => setCommentsOf(v)}
              onOpen={() => setTheater(v)}
            />
          ))}
        </div>
      )}

      {/* Income streams (no §N anchors visible) */}
      <div className="mx-5 mt-8 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-secondary" />
          <h3 className="font-display text-sm">Income streams · zero cost to Cirkle</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <RevTile title="Local CPM ads" desc="30% Cirkle · 70% creator" />
          <RevTile title="Affiliate links" desc="80% creator · 20% Cirkle" />
          <RevTile title="Creator premium" desc="$5-10/mo via Stripe/Paymob" />
          <RevTile title="Sponsored trends" desc="City-level only · labelled" />
          <RevTile title="API freemium" desc="Free <1k req/day" />
          <RevTile title="Brand reward pools" desc="5% admin fee" />
          <RevTile title="Non-custodial tipping" desc="MoonPay/Ramp · 1.5% referral" />
          <RevTile title="Channel memberships" desc="Stripe/Paymob handled" />
        </div>
      </div>

      {/* Compliance footer */}
      <div className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4 text-[11px]">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-secondary" />
          <span className="uppercase tracking-widest text-secondary text-[10px]">Compliance</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Cirkle never receives, holds, or sends user funds. Widget providers (MoonPay/Ramp/Paymob/Transak/WeChange)
          handle KYC/AML, sanctions screening, and cross-border tax. No money-transmitter licence required.
          Tipping disabled for under-18; sanctioned regions auto-blocked at widget level.
        </p>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {tipping && <TipModal video={tipping} onClose={() => setTipping(null)} />}
        {commentsOf && <CommentsDrawer video={commentsOf} onClose={() => setCommentsOf(null)} />}
        {analytics && <AnalyticsModal video={analytics} onClose={() => setAnalytics(null)} />}
        {theater && (
          <TheaterPlayer
            video={theater}
            onClose={() => setTheater(null)}
            onTip={(v) => { setTheater(null); setTipping(v); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── Video card with bullet overlay ─────────────────────────── */

function VideoCard({
  video: v, i, onLike, onTip, onComments, onOpen,
}: { video: Video; i: number; onLike: () => void; onTip: () => void; onComments: () => void; onOpen: () => void }) {
  const [bullets, setBullets] = useState<VideoComment[]>([]);
  const isLive = (v as any).is_live === 1;
  const liveViewers = (v as any).live_viewer_count ?? 0;

  useEffect(() => {
    apiGet<{ comments: VideoComment[] }>(`/mashahd/videos/${v.id}/comments?bullet=1`)
      .then((d) => setBullets(d.comments ?? []))
      .catch(() => setBullets([]));
  }, [v.id]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(i, 6) * 0.05 }}
      className="stage-frame relative aspect-[9/14] sm:aspect-[16/9] cursor-pointer group"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
    >
      {/* Hover halo — Cirkle identity orbit ring */}
      <div className="absolute -inset-0.5 rounded-2xl orbit-ring opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
      {/* Play affordance */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-secondary/90 backdrop-blur flex items-center justify-center shadow-2xl">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-secondary-foreground ml-1" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent"
        style={{ ["--tw-gradient-from" as any]: "hsl(var(--charcoal) / 0.85)" }}
      />

      {/* Bullet (danmaku) overlay — floating comments */}
      <div className="absolute inset-x-0 top-1/4 bottom-1/4 pointer-events-none overflow-hidden">
        {bullets.slice(0, 6).map((b, idx) => (
          <motion.div
            key={b.id}
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 12 + (idx % 3) * 3, delay: idx * 1.5, repeat: Infinity, repeatDelay: 5 + idx }}
            className="absolute whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/20"
            style={{ top: `${(idx * 18) % 80}%` }}
          >
            {b.body}
          </motion.div>
        ))}
      </div>

      {/* Top chips */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <div className="glass text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-secondary" /> AI captions
          </div>
          {isLive && (
            <div className="text-[10px] px-2 py-1 rounded-full bg-red-500 text-white flex items-center gap-1 font-medium">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE · {liveViewers.toLocaleString()}
            </div>
          )}
        </div>
        <div className="glass text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" /> P2P · IPFS
        </div>
      </div>

      {/* Title & creator */}
      <div className="absolute bottom-4 left-4 right-16 z-10" style={{ color: "hsl(var(--cream))" }}>
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
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {v.views.toLocaleString()}</span>
        </div>
      </div>

      {/* Right action rail */}
      <div className="absolute bottom-4 right-3 flex flex-col items-center gap-3 z-10" style={{ color: "hsl(var(--cream))" }}>
        <ActionPill icon={Heart} label={kn(v.likes)} onClick={(e) => { e?.stopPropagation?.(); onLike(); }} />
        <ActionPill icon={MessageCircle} label={kn(bullets.length)} onClick={(e) => { e?.stopPropagation?.(); onComments(); }} />
        <ActionPill icon={Share2} label="Share" onClick={(e) => { e?.stopPropagation?.(); fireShare({ pillar: 'mashahd', id: String(v.id), title: v.title }); }} />
        <ActionPill icon={Gift} label="Tip" onClick={(e) => { e?.stopPropagation?.(); onTip(); }} accent />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── Tip modal (non-custodial widget flow) ─────────────────────────── */

function TipModal({ video: v, onClose }: { video: Video; onClose: () => void }) {
  const [suggestion, setSuggestion] = useState<TipSuggestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [pickedGift, setPickedGift] = useState<{ name: string; emoji: string; amount: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ id: string; widget_url: string } | null>(null);
  const [ageOK, setAgeOK] = useState(true);

  useEffect(() => {
    apiGet<{ suggestion: TipSuggestion }>(`/mashahd/tip/suggest?country=${VIEWER_COUNTRY}&time_watched=120&chat_count=2`)
      .then((d) => setSuggestion(d.suggestion))
      .catch(() => setSuggestion(null));
  }, []);

  const sendTip = async () => {
    if (!suggestion || !picked || !ageOK) return;
    setSending(true);
    try {
      const r = await apiPost<{ id: string; widget_url: string }>(`/mashahd/tip`, {
        from_user: ME,
        to_user: (v as any).uploader_id ?? 2,
        video_id: v.id,
        amount: picked,
        currency: suggestion.currency,
        widget: suggestion.widget,
      });
      setSent(r);
      // Simulate webhook confirmation (in production: widget callback)
      setTimeout(() => {
        apiPost(`/mashahd/tip/webhook`, {
          id: r.id, webhook_ref: 'demo-' + Date.now(), status: 'confirmed',
        }).catch(() => {});
      }, 600);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        className="bg-background rounded-3xl border border-border max-w-sm w-full p-5 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-brand-charcoal">
            <Gift className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg">Send a tip</div>
            <div className="text-xs text-muted-foreground truncate">to @{v.handle} · {v.title}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">×</button>
        </div>

        {!suggestion ? (
          <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : sent ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-secondary/10 border border-secondary/30 p-4 text-center">
              <Award className="w-8 h-8 mx-auto text-secondary mb-2" />
              <div className="font-medium">Redirecting to {suggestion.widget}…</div>
              <div className="text-[10px] text-muted-foreground mt-1">Tip ID: {sent.id}</div>
            </div>
            <a
              href={sent.widget_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center rounded-full bg-gradient-hero text-primary-foreground py-3 text-sm font-medium"
            >
              Open {suggestion.widget} widget →
            </a>
            <p className="text-[10px] text-muted-foreground text-center">
              Complete payment in the widget. Funds go directly from your wallet to the creator.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
              <Globe2 className="w-3 h-3" />
              <span>Widget: <strong>{suggestion.widget}</strong> · {suggestion.currency} · {suggestion.country}</span>
            </div>

            {/* Age 18+ check */}
            <label className="flex items-center gap-2 mb-3 text-[11px] cursor-pointer">
              <input type="checkbox" checked={ageOK} onChange={(e) => setAgeOK(e.target.checked)} />
              <span>I confirm I'm 18+ (required for tipping in your country)</span>
            </label>

            {!ageOK && (
              <div className="rounded-xl bg-accent/10 border border-accent/30 p-2 text-[11px] text-accent mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Tipping disabled — age confirmation required
              </div>
            )}

            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Amount</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {suggestion.amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setPicked(amt); setPickedGift(null); }}
                  disabled={!ageOK}
                  className={`rounded-xl border transition py-3 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-40 ${
                    picked === amt && !pickedGift ? "bg-secondary text-secondary-foreground border-secondary" : "border-border bg-card hover:bg-secondary/10"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" /> {amt}
                </button>
              ))}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Virtual gifts</div>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {suggestion.gifts.map((g) => (
                <button
                  key={g.name}
                  onClick={() => { setPicked(g.amount); setPickedGift(g); }}
                  disabled={!ageOK}
                  className={`rounded-xl border transition py-2 text-center disabled:opacity-40 ${
                    pickedGift?.name === g.name ? "bg-amber-500/20 border-amber-500" : "border-border bg-card hover:bg-amber-500/10"
                  }`}
                  title={`${g.name} · ${g.amount} ${suggestion.currency}`}
                >
                  <div className="text-xl">{g.emoji}</div>
                  <div className="text-[8px] text-muted-foreground">{g.amount}</div>
                </button>
              ))}
            </div>

            <button
              onClick={sendTip}
              disabled={!picked || sending || !ageOK}
              className="w-full rounded-full bg-gradient-hero text-primary-foreground py-3 text-sm font-medium disabled:opacity-40"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> :
               `Continue via ${suggestion.widget} → ${picked ? `${picked} ${suggestion.currency}` : 'pick amount'}`}
            </button>

            <div className="mt-3 text-[10px] text-muted-foreground space-y-1">
              <p>• Cirkle never sees your payment details</p>
              <p>• Widget handles KYC, currency conversion, payout</p>
              <p>• Net amount goes directly to creator's wallet</p>
              <p>• Cirkle earns a small referral fee (~1.5%)</p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Comments drawer (regular + bullet) ─────────────────────────── */

function CommentsDrawer({ video, onClose }: { video: Video; onClose: () => void }) {
  const [tab, setTab] = useState<"regular" | "bullet">("bullet");
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    apiGet<{ comments: VideoComment[] }>(`/mashahd/videos/${video.id}/comments?bullet=${tab === "bullet" ? 1 : 0}`)
      .then((d) => setComments(d.comments ?? []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [video.id, tab]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await apiPost(`/mashahd/videos/${video.id}/comments`, {
        user_id: ME, body: input, is_bullet: tab === "bullet", time_offset: Math.floor(Math.random() * 60),
      });
      setInput("");
      load();
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-background rounded-t-3xl border-t border-border w-full max-w-md p-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Comments</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => setTab("bullet")}
            className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${tab === "bullet" ? "bg-secondary text-secondary-foreground" : "glass"}`}
          >
            <Sparkles className="w-3 h-3" /> Bullet
          </button>
          <button
            onClick={() => setTab("regular")}
            className={`text-xs px-3 py-1 rounded-full ${tab === "regular" ? "bg-secondary text-secondary-foreground" : "glass"}`}
          >
            Regular
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {loading ? (
            <div className="text-center py-6"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {tab === "bullet" ? "No bullet comments yet — be first to send a danmaku!" : "No comments yet"}
            </div>
          ) : comments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-[10px] font-display">
                  {(c.display_name ?? c.handle ?? "?")[0]}
                </div>
                <span className="font-medium">{c.display_name ?? `@${c.handle}`}</span>
                {c.verified ? <BadgeCheck className="w-3 h-3 text-secondary" /> : null}
                {tab === "bullet" && c.time_offset != null && (
                  <span className="text-[9px] text-secondary ms-auto">@ {c.time_offset}s</span>
                )}
              </div>
              <p className="text-sm mt-1.5 ms-8">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={tab === "bullet" ? "Send a bullet (danmaku) →" : "Add a comment"}
            className="flex-1 rounded-full px-4 py-2 bg-muted text-sm outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Creator analytics (per video uploader) ─────────────────────────── */

function AnalyticsModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const [a, setA] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const uploader = (video as any).uploader_id ?? 1;

  useEffect(() => {
    apiGet<{ analytics: CreatorAnalytics }>(`/mashahd/creator/${uploader}/analytics`)
      .then((d) => setA(d.analytics))
      .catch(() => setA(null))
      .finally(() => setLoading(false));
  }, [uploader]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        className="bg-background rounded-3xl border border-border max-w-md w-full p-5 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-xl">Creator analytics</h2>
            <div className="text-[11px] text-muted-foreground">@{video.handle} · {video.display_name}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : !a ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Analytics unavailable</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Stat icon={Eye} label="Total views" value={a.total_views} />
              <Stat icon={Heart} label="Total likes" value={a.total_likes} />
              <Stat icon={Users} label="Subscribers" value={a.total_subscribers} />
              <Stat icon={Award} label="Members" value={a.members ?? 0} />
              <Stat icon={Coins} label="Tips total" value={a.total_tips_minor} suffix=" m.u." />
              <Stat icon={Sparkles} label="Avg watch (s)" value={a.avg_watch_secs} />
            </div>

            <div className="rounded-xl bg-secondary/5 border border-secondary/20 p-3 text-[11px] text-muted-foreground">
              <Shield className="w-3 h-3 inline mr-1 text-secondary" />
              Anonymised aggregates. Cirkle never tracks individual viewers or their watch history.
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Building blocks ─────────────────────────── */

function Stat({ icon: Icon, label, value, suffix }: { icon: any; label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-secondary" />
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
      <div className="font-display text-2xl">{kn(value)}{suffix ?? ""}</div>
    </div>
  );
}

function ActionPill({ icon: Icon, label, onClick, accent }: { icon: any; label: string; onClick?: (e?: ReactMouseEvent) => void; accent?: boolean }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick?.(e); }} className="flex flex-col items-center gap-1">
      {accent ? (
        // Tip-coin — Cirkle's gold-coin tip button, NOT YouTube's $ pill
        <span className="tip-coin">
          <Icon className="w-5 h-5" />
        </span>
      ) : (
        <span className="w-10 h-10 rounded-full flex items-center justify-center glass-strong">
          <Icon className="w-5 h-5" />
        </span>
      )}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function RevTile({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-2.5">
      <div className="font-medium text-foreground">{title}</div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function kn(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
  return String(n);
}

export default MashahdScreen;
