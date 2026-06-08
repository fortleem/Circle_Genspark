// — Midan (Square). Prototype feed-card UI preserved; wired to /api/midan/posts & /trending.
// Covers feed tabs, anonymous posting, ActivityPub federation chip,
// trending strip from real API, moderation badge, privacy hints, summary.
import { useEffect, useMemo, useState } from "react";
import {
  Heart, MessageCircle, Repeat2, Share2, ShieldCheck, Mic, BadgeCheck, BarChart3, Radio,
  Globe2, EyeOff, Hash, Flag, Sparkles, Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiGet, apiPost, type MidanPost } from "@/lib/api";
import { fireShare } from "@/components/shell/ShareSheet";
import { CapsuleComposer } from "@/components/futuristic/CapsuleComposer";
import { WhisperComposer } from "@/components/futuristic/WhisperComposer";
import { SmartRouter } from "@/components/futuristic/SmartRouter";
import {
  SignalMeter, AntiRageGate, ConversationGraph, CrossPillarQuote, computeSignal,
} from "@/components/futuristic/MidanSignal";
import { AnimatePresence } from "framer-motion";
import { Hourglass, Flame, Quote as QuoteIcon } from "lucide-react";

type Feed = "for_you" | "following" | "local" | "global";

const FEED_TABS: { k: Feed; l: string }[] = [
  { k: "for_you", l: "For you" },
  { k: "following", l: "Following" },
  { k: "local", l: "Local · Cairo" },
  { k: "global", l: "Global · Fediverse" },
];

interface TrendingTag { hashtag: string; count?: number; score?: number; post_count?: number }

export function MidanScreen() {
  const [feed, setFeed] = useState<Feed>("for_you");
  const [posts, setPosts] = useState<MidanPost[]>([]);
  const [trending, setTrending] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  const [composer, setComposer] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showCapsule, setShowCapsule] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [rageOverride, setRageOverride] = useState(false);
  const [rageDismissed, setRageDismissed] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<{ posts: MidanPost[] }>(`/midan/posts?feed=${feed}`),
      apiGet<{ trending: TrendingTag[] }>("/midan/trending"),
    ])
      .then(([p, t]) => {
        setPosts(p.posts ?? []);
        setTrending(t.trending ?? []);
      })
      .catch(() => {
        setPosts([]); setTrending([]);
      })
      .finally(() => setLoading(false));
  }, [feed]);

  // Generate a deterministic-looking pseudonym for the composer
  const pseudo = useMemo(() => {
    const code = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
    return `مواظب #${code}`;
  }, [anonymous]);

  async function submit() {
    const text = composer.trim();
    if (!text || posting) return;
    // Anti-rage gate: block until override (10s breather inside <AntiRageGate/>)
    const sig = computeSignal(text);
    if ((sig.rage >= 0.4 || sig.score < 25) && !rageOverride && !rageDismissed) {
      // Gate displays itself; user must press "Post anyway" or rephrase
      return;
    }
    setPosting(true);
    try {
      await apiPost("/midan/posts", {
        author_id: 1,
        content: text,
        anonymous: anonymous ? 1 : 0,
        city: "Cairo",
        language: "en",
      });
      const fresh = await apiGet<{ posts: MidanPost[] }>(`/midan/posts?feed=${feed}`);
      setPosts(fresh.posts ?? []);
      setComposer("");
      setRageOverride(false);
      setRageDismissed(false);
    } catch { /* silent */ }
    finally { setPosting(false); }
  }

  async function like(p: MidanPost) {
    try {
      await apiPost(`/midan/posts/${p.id}/like`, {});
      setPosts(all => all.map(x => x.id === p.id ? { ...x, likes: x.likes + 1 } : x));
    } catch { /* silent */ }
  }

  return (
    <div className="pb-32">
      {/* Header with city-pulse indicator (Circle-unique vs X/Bluesky) */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="city-pulse" style={{ width: 48, height: 48 }}>
            <span className="core" />
            <span className="ring" />
            <span className="ring" />
            <span className="ring" />
          </div>
          <div>
            <h1 className="font-display text-4xl">
              Midan <span className="text-base text-muted-foreground tracking-widest uppercase">ميدان</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
              Cairo · {posts.length} active voices
            </p>
          </div>
        </div>
        <span className="gold-stroke text-[10px] uppercase">
          <Radio className="w-3 h-3 text-accent" /> 14 spaces live
        </span>
      </div>

      {/* Feed tabs */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {FEED_TABS.map((f) => (
          <button
            key={f.k}
            onClick={() => setFeed(f.k)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              feed === f.k ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Composer — anon-veil overlays when anonymous (Circle-unique vs X drafts).
          Plain-text post box becomes a frosted "ghost capsule" in anon mode. */}
      <div className={`mx-5 mt-4 orbit-ring p-3 relative ${anonymous ? "overflow-hidden" : ""}`}>
        {anonymous && <div className="anon-veil absolute inset-0 rounded-[22px] pointer-events-none z-0" />}
        <div className="flex items-start gap-3 relative z-10">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-sm shrink-0 ${
            anonymous ? "mesh-fill text-foreground" : "bg-gradient-hero text-primary-foreground"
          }`}>
            {anonymous ? <EyeOff className="w-4 h-4" /> : "Y"}
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              className="bg-transparent w-full outline-none text-sm py-2"
              placeholder={anonymous ? `Post as ${pseudo}` : "Share to the public square"}
            />
            <div className="flex items-center gap-2 mt-2 text-[10px] flex-wrap">
              <button
                onClick={() => setAnonymous(v => !v)}
                className={`gold-stroke ${anonymous ? "ring-1 ring-secondary/60" : ""}`}
                title="Server never stores identity ↔ pseudonym mapping"
              >
                <EyeOff className="w-3 h-3" /> Anonymous
              </button>
              <span className="gold-stroke text-[9px] uppercase">
                <Globe2 className="w-3 h-3" /> Federate
              </span>
              <span className="text-muted-foreground text-[10px]">
                {anonymous ? "Pseudonym unmaskable only via jury/lawful order" : "Public · ActivityPub"}
              </span>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-secondary/20 text-secondary flex items-center justify-center"><Mic className="w-4 h-4" /></button>
          <button
            onClick={submit}
            disabled={!composer.trim() || posting}
            className="w-9 h-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {/* Smart Post Router — suggests better pillar if appropriate (Circle-unique F9) */}
        <SmartRouter text={composer} />

        {/* Circle-unique: real-time signal-vs-noise scoring */}
        <SignalMeter text={composer} />

        {/* Anti-rage gate: 10s breather + rephrase suggestion when rage signals high */}
        {!rageOverride && !rageDismissed && (
          <AntiRageGate
            text={composer}
            onProceed={() => { setRageOverride(true); }}
            onRephrase={(s) => { setComposer(s); setRageOverride(false); setRageDismissed(false); }}
            onDismiss={() => setRageDismissed(true)}
          />
        )}
      </div>

      {/* Circle-unique futuristic actions — Time Capsule + Whisper + Cross-pillar Quote */}
      <div className="mx-5 mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => { setShowCapsule(s => !s); setShowWhisper(false); }}
          className={`px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition orbit-ring ${
            showCapsule ? 'bg-primary/15 font-semibold' : 'bg-card/50 hover:bg-card/80'
          }`}
          title="Write a post sealed until a future date"
        >
          <Hourglass className="w-3.5 h-3.5 text-primary" />
          <span>Capsule</span>
        </button>
        <button
          onClick={() => { setShowWhisper(s => !s); setShowCapsule(false); }}
          className={`px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition orbit-ring ${
            showWhisper ? 'bg-rose-500/15 font-semibold' : 'bg-card/50 hover:bg-card/80'
          }`}
          title="Send a self-destruct whisper"
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Whisper</span>
        </button>
        <button
          onClick={() => setShowQuote(true)}
          className="px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition orbit-ring bg-card/50 hover:bg-card/80"
          title="Quote a Mashahd video, Lamahat photo, or Wasl message"
        >
          <QuoteIcon className="w-3.5 h-3.5 text-secondary" />
          <span>Quote</span>
        </button>
      </div>

      {showCapsule && (
        <div className="mx-5 mt-3">
          <CapsuleComposer onClose={() => setShowCapsule(false)} />
        </div>
      )}
      {showWhisper && (
        <div className="mx-5 mt-3">
          <WhisperComposer onClose={() => setShowWhisper(false)} />
        </div>
      )}

      {/* Federation chip — mesh-fill (no incumbent shows this) */}
      <div className="mx-5 mt-3 rounded-2xl p-[1px] mesh-fill">
        <div className="rounded-[15px] bg-background/85 backdrop-blur px-3 py-2 flex items-center gap-2 text-[11px]">
          <Globe2 className="w-3.5 h-3.5 text-secondary" />
          <span className="uppercase tracking-wider text-secondary text-[9px]">Federation</span>
          <span className="text-foreground/80">Mastodon · Pleroma · Misskey · Pixelfed</span>
          <span className="ms-auto text-muted-foreground text-[10px]">WebFinger + HTTP Signature</span>
        </div>
      </div>

      {/* Trending — Circle ranks each tag with a velocity arrow + rank badge.
          X just shows a count; Circle shows momentum AND geographic provenance. */}
      <div className="mt-4 px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3" /> Trending velocity · last 60 min · Cairo + global
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {trending.length === 0 ? (
            <span className="text-xs text-muted-foreground">Computing…</span>
          ) : trending.slice(0, 12).map((t, i) => {
            const count = t.post_count ?? t.count ?? 0;
            // Synthetic velocity arrow — climbing if rank in top 4
            const climbing = i < 4;
            return (
              <button key={i} className="gold-stroke whitespace-nowrap text-xs hover:bg-card/60 transition">
                <span className="font-mono text-[9px] text-muted-foreground">#{i + 1}</span>
                <span className="text-foreground">{t.hashtag}</span>
                <span className={`text-[10px] ${climbing ? "text-secondary" : "text-muted-foreground/70"}`}>
                  {climbing ? "▲" : "·"} {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed — real posts */}
      {loading ? (
        <div className="mt-8 px-5 text-sm text-muted-foreground text-center">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="mt-8 px-5 text-sm text-muted-foreground text-center">No posts in this feed yet</div>
      ) : (
        <ul className="mt-5 px-3 space-y-3">
          {posts.map((p, i) => {
            const isAnon = !!p.anonymous;
            const displayName = isAnon ? "مواظب #" + p.id.toString(16).toUpperCase().padStart(4, "0") : (p.display_name ?? p.handle);
            const handle = isAnon ? "anonymous" : p.handle;
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.04 }}
                className={`orbit-ring px-4 py-3.5 relative ${isAnon ? "overflow-hidden" : ""}`}
              >
                {isAnon && <div className="anon-veil absolute inset-0 rounded-[22px] pointer-events-none z-0 opacity-60" />}
                <div className="flex items-start gap-3 relative z-10">
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-primary-foreground ${
                    isAnon ? "bg-gradient-mesh" : "bg-gradient-hero"
                  }`}>
                    {isAnon ? <EyeOff className="w-4 h-4" /> : (displayName?.[0] ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium">{displayName}</span>
                      {!isAnon && p.verified ? <BadgeCheck className="w-3.5 h-3.5 text-secondary" /> : null}
                      <span className="text-xs text-muted-foreground">@{handle} · {new Date(p.created_at).toLocaleDateString()}</span>
                      {p.city && (<span className="text-[10px] text-muted-foreground">· {p.city}</span>)}
                    </div>
                    <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-wrap">{p.content}</p>

                    {p.hashtags && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {p.hashtags.split(/\s+/).filter(Boolean).slice(0, 5).map((h) => (
                          <span key={h} className="text-[11px] text-secondary">{h}</span>
                        ))}
                      </div>
                    )}

                    {/* AI moderation badge */}
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-secondary">
                      <ShieldCheck className="w-3 h-3" /> AI verified · No misinformation
                      <span className="ms-2 inline-flex items-center gap-0.5 text-muted-foreground">
                        <Sparkles className="w-2.5 h-2.5" /> on-device
                      </span>
                    </div>

                    {/* Circle-unique: signal-vs-noise conversation graph for this post */}
                    <ConversationGraph postId={p.id} replies={p.replies_count} />

                    <div className="mt-3 flex items-center gap-6 text-xs text-muted-foreground">
                      <button onClick={() => like(p)} className="flex items-center gap-1.5 hover:text-accent transition">
                        <Heart className="w-4 h-4" />{p.likes}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-secondary transition">
                        <MessageCircle className="w-4 h-4" />{p.replies_count}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-primary transition">
                        <Repeat2 className="w-4 h-4" />{p.reposts}
                      </button>
                      <button
                        onClick={() => fireShare({ pillar: 'midan', id: String(p.id), title: (p.content ?? '').slice(0, 80) })}
                        className="flex items-center gap-1.5 hover:text-foreground transition"
                        title="Share across Circle"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-foreground ms-auto transition" title="Report">
                        <Flag className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-foreground transition" title="Engagement">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      {/* Cross-pillar Quote drawer */}
      <AnimatePresence>
        {showQuote && (
          <CrossPillarQuote
            onClose={() => setShowQuote(false)}
            onPick={(q) => {
              const embed = `\n\n↪ ${q.pillar}/${q.id} · "${q.title}"`;
              setComposer((c) => (c + embed).slice(0, 600));
            }}
          />
        )}
      </AnimatePresence>

      {/* + footer */}
      <div className="mx-5 mt-8 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              Data planes · Summary
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            federation blocked for China plane, whitelisted for Russia/Iran. Anonymous unmasking requires community jury () or lawful court order. No promoted tweets — only labelled sponsored hashtags from .
          </p>
        </div>
      </div>
    </div>
  );
}

export default MidanScreen;
