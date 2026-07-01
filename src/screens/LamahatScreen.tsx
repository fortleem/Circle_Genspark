// — Lamahat (Photos). Prototype masonry grid preserved; wired to /api/lamahat/photos.
// Adds feed tabs, nearby precision selector, visual search hint,
// stories/memories, privacy, NSFW handling, summary.
import { useEffect, useState, useMemo } from "react";
import {
  Sparkles, Layers, Heart, MapPin, Search, Shield, Camera, Eye, EyeOff,
  Clock, ImagePlus, Hash, BadgeCheck, Share2, X, ChevronLeft, ChevronRight,
  Download, Maximize2, MessageCircle, Bot, Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost } from "@/lib/api";
import type { Photo } from "@/lib/api";
import { fireShare } from "@/components/shell/ShareSheet";
import StoryCraftStudio from "@/components/futuristic/StoryCraftStudio";

type Tab = "Following" | "Nearby" | "Trending" | "Memories";

export function LamahatScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Following");
  const [precision, setPrecision] = useState<"none" | "city" | "hood" | "precise">("hood");
  const [visualSearch, setVisualSearch] = useState(false);
  const [studio, setStudio] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null); // index of photo in fullscreen
  const [aiCaption, setAiCaption] = useState<string | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGet<{ photos: Photo[] }>("/lamahat/photos")
      .then((d) => setPhotos(d.photos ?? []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, []);

  async function like(p: Photo) {
    try {
      await apiPost(`/lamahat/photos/${p.id}/like`, {});
      setPhotos((all) => all.map((x) => (x.id === p.id ? { ...x, likes: x.likes + 1 } : x)));
    } catch { /* silent */ }
  }

  // Synthetic ratio based on id for visually pleasant masonry
  const items = useMemo(
    () =>
      photos.map((p, i) => ({
        ...p,
        ratio: (["square", "tall", "wide"] as const)[i % 3],
        hue: (i * 47) % 360,
      })),
    [photos]
  );

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">
            Lamahat <span className="text-base text-muted-foreground tracking-widest uppercase">لمحات</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            · IPFS · On-device AI
          </p>
        </div>
        <button
          onClick={() => setStudio(true)}
          className="text-xs px-3 py-1.5 rounded-full bg-gradient-gold text-brand-charcoal font-medium flex items-center gap-1 hover:scale-105 transition"
        >
          <ImagePlus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {/* Feed tabs */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {(["Following", "Nearby", "Trending", "Memories"] as Tab[]).map((f) => (
          <button
            key={f}
            onClick={() => setTab(f)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              tab === f ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Nearby precision selector (only shown when on Nearby tab) */}
      {tab === "Nearby" && (
        <div className="mx-5 mt-4 rounded-2xl border border-secondary/30 bg-secondary/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              Location precision · default Neighbourhood
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(
              [
                { k: "none", l: "None", h: "no location" },
                { k: "city", l: "City", h: "Cairo only" },
                { k: "hood", l: "Hood", h: "~1.2 km" },
                { k: "precise", l: "Precise", h: "~19 m · ⚠️" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.k}
                onClick={() => setPrecision(opt.k as any)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                  precision === opt.k
                    ? "border-secondary/60 bg-secondary/15 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary/10"
                }`}
                title={opt.h}
              >
                {opt.l}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Server stores only your chosen geohash level — never precise coordinates.
          </p>
        </div>
      )}

      {/* Visual search toggle */}
      <div className="px-5 mt-4">
        <button
          onClick={() => setVisualSearch((v) => !v)}
          className={`w-full glass rounded-full px-4 py-2.5 flex items-center gap-3 hover:bg-secondary/10 transition ${
            visualSearch ? "border border-secondary/40" : ""
          }`}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-start text-sm text-muted-foreground">
            {visualSearch ? "Drop or capture an image — CLIP runs locally" : "Search by photo (on-device CLIP )"}
          </span>
          <Camera className="w-4 h-4 text-secondary" />
        </button>
      </div>

      {/* Stories — */}
      <div className="mt-5">
        <div className="px-5 mb-1.5 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-secondary">Stories · 24h</span>
          <span className="text-[10px] text-muted-foreground">Highlights save permanently</span>
        </div>
        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide">
          {["Memories", "Travel", "Food", "Friends", "Sunsets", "Studio"].map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-mesh">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(from ${i * 60}deg, hsl(var(--gold)), hsl(var(--rose)), hsl(var(--teal)))`,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Memories banner — on this day */}
      <div className="mx-5 mt-5 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 to-transparent p-4 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-8 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-brand-charcoal" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-secondary">On this day</div>
          <div className="font-display text-lg">A year in golden hour</div>
          <div className="text-xs text-muted-foreground">42 photos · 8 places · generated locally · no cloud</div>
        </div>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Circle hex-mosaic — NOT an Instagram square grid.
          Honeycomb cells with gold strokes; alternating rows offset to interlock. */}
      {loading ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">Loading photos…</div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">No photos yet</div>
      ) : (
        <div className="px-3 mt-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-1 gap-y-3">
            {items.map((p, idx) => {
              const isAnon = (p as any).is_anonymous === 1 || (p as any).is_anonymous === true;
              // Offset every other column by half-row to create the honeycomb interlock
              const offset = idx % 2 === 1 ? "translate-y-5" : "";
              return (
                <div
                  key={p.id}
                  className={`relative group cursor-pointer ${offset}`}
                  onClick={() => setViewer(idx)}
                >
                  <div
                    className="hex-tile hex-tile-stroke"
                    style={{
                      background: `linear-gradient(135deg, hsl(${p.hue} 60% 55%), hsl(${(p.hue + 60) % 360} 50% 35%))`,
                    }}
                  >
                    {/* Caption overlay — fades in on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                      <p className="text-[9px] text-white/95 line-clamp-2 leading-tight">
                        {p.caption ?? ""}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[8.5px] text-white/80">
                        <span>{isAnon ? "anon" : `@${p.handle}`}</span>
                        <span className="ms-auto flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5" /> {p.likes}
                        </span>
                      </div>
                    </div>
                    {/* Anonymous frost veil — distinctive to Circle */}
                    {isAnon && <div className="anon-veil absolute inset-0" />}
                  </div>

                  {/* Floating action chips — like = gold heart, share = cross-pillar */}
                  <button
                    onClick={() => like(p)}
                    className="absolute -bottom-1 right-1 w-7 h-7 tip-coin opacity-0 group-hover:opacity-100 transition"
                    title="Like"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => fireShare({ pillar: 'lamahat', id: String(p.id), title: p.caption ?? p.city ?? 'Photo' })}
                    className="absolute -bottom-1 right-9 w-7 h-7 rounded-full bg-card/80 backdrop-blur grid place-items-center gold-stroke opacity-0 group-hover:opacity-100 transition"
                    title="Share across Circle"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Visible city signature row — show city pulse for any photos with location */}
          <div className="flex items-center justify-between mt-6 px-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="city-pulse" style={{ width: 22, height: 22 }}>
                <span className="core" style={{ width: 6, height: 6 }} />
                <span className="ring" />
                <span className="ring" />
              </span>
              {items.filter(p => p.city).length} geotagged · neighbourhood-level only
            </div>
            <span className="gold-stroke text-[9px] uppercase">
              <Hash className="w-2.5 h-2.5" /> {items.length} stored on IPFS
            </span>
          </div>
        </div>
      )}

      {/* + Privacy & NSFW notice */}
      <div className="mx-5 mt-6 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-secondary" />
          <h3 className="font-display text-sm">Privacy · NSFW handling</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <PolicyChip icon={EyeOff} label="Screenshot block" desc="Inherited " />
          <PolicyChip icon={Eye} label="Forwarding consent" desc="One-time per share" />
          <PolicyChip icon={Hash} label="Per-post audience" desc="Followers / Circle / Public" />
          <PolicyChip icon={BadgeCheck} label="On-device NSFW" desc="Falconsai · score >0.7 blur" />
        </div>
      </div>

      {/* summary footer */}
      <div className="mx-5 mt-4 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              Summary · Zero-cost
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            IPFS storage · on-device CLIP visual search · on-device NSFW (Falconsai) · ephemeral Stories ·
            Moments + Memories generated locally · no premium filters · no paid boosts.
          </p>
        </div>
      </div>

      {/* Story-Craft Studio modal */}
      <AnimatePresence>
        {studio && <StoryCraftStudio onClose={() => setStudio(false)} />}
      </AnimatePresence>

      {/* Fullscreen Photo Viewer */}
      <AnimatePresence>
        {viewer !== null && items[viewer] && (
          <PhotoViewer
            photo={items[viewer]}
            index={viewer}
            total={items.length}
            onClose={() => { setViewer(null); setAiCaption(null); }}
            onPrev={() => setViewer(Math.max(0, viewer - 1))}
            onNext={() => setViewer(Math.min(items.length - 1, viewer + 1))}
            onLike={() => like(items[viewer])}
            aiCaption={aiCaption}
            captionLoading={captionLoading}
            onGenerateCaption={async () => {
              setCaptionLoading(true);
              try {
                const res = await apiPost<{ caption: string; hashtags: string[] }>('/sage/caption', {
                  context: items[viewer].caption ?? 'photo',
                });
                setAiCaption(`${res.caption} ${res.hashtags?.join(' ') ?? ''}`);
              } catch {
                setAiCaption('A moment worth capturing.');
              } finally {
                setCaptionLoading(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PolicyChip({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-secondary" />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

/* ─────────────────────────── Fullscreen Photo Viewer ─────────────────────────── */

function PhotoViewer({
  photo, index, total, onClose, onPrev, onNext, onLike, aiCaption, captionLoading, onGenerateCaption,
}: {
  photo: any;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLike: () => void;
  aiCaption: string | null;
  captionLoading: boolean;
  onGenerateCaption: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comment, setComment] = useState("");

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch { /* ignore */ }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 text-white relative z-10">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
          <X className="w-5 h-5" />
        </button>
        <div className="text-sm font-medium">{index + 1} / {total}</div>
        <div className="flex items-center gap-2">
          <button onClick={toggleFullscreen} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo area */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        {/* Navigation arrows */}
        {index > 0 && (
          <button onClick={onPrev} className="absolute left-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition z-10">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {index < total - 1 && (
          <button onClick={onNext} className="absolute right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition z-10">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Photo display */}
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg aspect-square rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${photo.hue} 60% 55%), hsl(${(photo.hue + 60) % 360} 50% 35%))`,
          }}
        />
      </div>

      {/* Bottom info */}
      <div className="p-4 text-white relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-display">
            {(photo.handle ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium">@{photo.handle}</div>
            <div className="text-xs text-white/70">{photo.city ?? "Cairo"} · {new Date(photo.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        {photo.caption && <p className="text-sm mb-3 text-white/90">{photo.caption}</p>}

        {/* AI Caption */}
        {aiCaption ? (
          <div className="rounded-xl bg-white/10 p-3 mb-3 flex items-start gap-2">
            <Bot className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
            <p className="text-sm text-white/90">{aiCaption}</p>
          </div>
        ) : (
          <button
            onClick={onGenerateCaption}
            disabled={captionLoading}
            className="rounded-xl bg-white/10 px-3 py-2 mb-3 flex items-center gap-2 text-xs text-white/80 hover:bg-white/20 transition disabled:opacity-50"
          >
            {captionLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            {captionLoading ? "Sage AI generating..." : "Generate AI caption"}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={onLike} className="flex items-center gap-1.5 text-white/80 hover:text-red-400 transition">
            <Heart className="w-5 h-5" />
            <span className="text-sm">{photo.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-white/80 hover:text-white transition">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">Comment</span>
          </button>
          <button
            onClick={() => fireShare({ pillar: 'lamahat', id: String(photo.id), title: photo.caption ?? 'Photo' })}
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
          <button className="flex items-center gap-1.5 text-white/80 hover:text-white transition ms-auto">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default LamahatScreen;
