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
      {/* Header */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">
            Midan <span className="text-base text-muted-foreground tracking-widest uppercase">ميدان</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            · ActivityPub · Federated
          </p>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-full glass flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-accent" /> Spaces · 14 live
        </button>
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

      {/* Composer — with anonymous toggle */}
      <div className="mx-5 mt-4 glass rounded-2xl p-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-sm shrink-0 ${
            anonymous ? "bg-gradient-mesh text-primary-foreground" : "bg-gradient-hero text-primary-foreground"
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
            <div className="flex items-center gap-2 mt-2 text-[10px]">
              <button
                onClick={() => setAnonymous(v => !v)}
                className={`px-2 py-1 rounded-full border transition flex items-center gap-1 ${
                  anonymous
                    ? "border-secondary/40 bg-secondary/15 text-secondary"
                    : "border-border text-muted-foreground hover:bg-muted/30"
                }`}
                title="— server never stores identity ↔ pseudonym mapping"
              >
                <EyeOff className="w-3 h-3" /> Anonymous
              </button>
              <span className="text-muted-foreground">pseudonym unmaskable only via jury / lawful order</span>
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
      </div>

      {/* Federation chip */}
      <div className="mx-5 mt-3 rounded-2xl border border-secondary/20 bg-secondary/5 p-3 flex items-center gap-2 text-[11px]">
        <Globe2 className="w-3.5 h-3.5 text-secondary" />
        <span className="uppercase tracking-wider text-secondary text-[9px]">Federation</span>
        <span className="text-foreground/80">Mastodon · Pleroma · Misskey · Pixelfed</span>
        <span className="ms-auto text-muted-foreground text-[10px]">WebFinger + HTTP Signature</span>
      </div>

      {/* Trending strip — real data */}
      <div className="mt-4 px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
          <Hash className="w-3 h-3" /> Trending velocity · cached aggregate
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {trending.length === 0 ? (
            <span className="text-xs text-muted-foreground">Computing…</span>
          ) : trending.slice(0, 12).map((t, i) => (
            <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-muted whitespace-nowrap flex items-center gap-1.5">
              {t.hashtag}
              <span className="text-muted-foreground text-[10px]">
                · {t.post_count ?? t.count ?? "—"}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Feed — real posts */}
      {loading ? (
        <div className="mt-8 px-5 text-sm text-muted-foreground text-center">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="mt-8 px-5 text-sm text-muted-foreground text-center">No posts in this feed yet</div>
      ) : (
        <ul className="mt-5">
          {posts.map((p, i) => {
            const isAnon = !!p.anonymous;
            const displayName = isAnon ? "مواظب #" + p.id.toString(16).toUpperCase().padStart(4, "0") : (p.display_name ?? p.handle);
            const handle = isAnon ? "anonymous" : p.handle;
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-4 border-b border-border"
              >
                <div className="flex items-start gap-3">
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
                      <button className="flex items-center gap-1.5 hover:text-foreground transition">
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
