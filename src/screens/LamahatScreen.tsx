// §8 — Lamahat (Photos). Prototype masonry grid preserved; wired to /api/lamahat/photos.
// Adds §8.2 feed tabs, §8.4 nearby precision selector, §8.5 visual search hint,
// §8.6 stories/memories, §8.7 privacy, §8.8 NSFW handling, §8.13 summary.
import { useEffect, useState, useMemo } from "react";
import {
  Sparkles, Layers, Heart, MapPin, Search, Shield, Camera, Eye, EyeOff,
  Clock, ImagePlus, Hash, BadgeCheck
} from "lucide-react";
import { apiGet, apiPost, type Photo } from "@/lib/api";

type Tab = "Following" | "Nearby" | "Trending" | "Memories";

export function LamahatScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Following");
  const [precision, setPrecision] = useState<"none" | "city" | "hood" | "precise">("hood");
  const [visualSearch, setVisualSearch] = useState(false);

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
            §8 · IPFS · On-device AI
          </p>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-full bg-gradient-gold text-brand-charcoal font-medium flex items-center gap-1">
          <ImagePlus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {/* §8.2 Feed tabs */}
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

      {/* §8.4 Nearby precision selector (only shown when on Nearby tab) */}
      {tab === "Nearby" && (
        <div className="mx-5 mt-4 rounded-2xl border border-secondary/30 bg-secondary/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              §8.4 Location precision · default Neighbourhood
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

      {/* §8.5 Visual search toggle */}
      <div className="px-5 mt-4">
        <button
          onClick={() => setVisualSearch((v) => !v)}
          className={`w-full glass rounded-full px-4 py-2.5 flex items-center gap-3 hover:bg-secondary/10 transition ${
            visualSearch ? "border border-secondary/40" : ""
          }`}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-start text-sm text-muted-foreground">
            {visualSearch ? "Drop or capture an image — CLIP runs locally" : "Search by photo (on-device CLIP §8.5)"}
          </span>
          <Camera className="w-4 h-4 text-secondary" />
        </button>
      </div>

      {/* Stories — §8.6.1 */}
      <div className="mt-5">
        <div className="px-5 mb-1.5 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-secondary">§8.6.1 Stories · 24h</span>
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

      {/* §8.6.2 Memories banner — on this day */}
      <div className="mx-5 mt-5 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 to-transparent p-4 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-8 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-brand-charcoal" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-secondary">§8.6.2 On this day</div>
          <div className="font-display text-lg">A year in golden hour</div>
          <div className="text-xs text-muted-foreground">42 photos · 8 places · generated locally · no cloud</div>
        </div>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Pinterest-style grid — real photos */}
      {loading ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">Loading photos…</div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">No photos yet</div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-2 px-2 mt-5">
          {items.map((p) => (
            <div
              key={p.id}
              className={`mb-2 break-inside-avoid rounded-xl relative overflow-hidden group ${
                p.ratio === "tall" ? "aspect-[3/4]" : p.ratio === "wide" ? "aspect-[4/3]" : "aspect-square"
              }`}
              style={{
                background: `linear-gradient(135deg, hsl(${p.hue} 60% 55%), hsl(${(p.hue + 60) % 360} 50% 35%))`,
              }}
            >
              {/* Caption overlay (always visible on mobile) */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2">
                <p className="text-[10px] text-white/95 line-clamp-2 leading-tight">{p.caption ?? ""}</p>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-white/70">
                  <span>@{p.handle}</span>
                  {p.city && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {p.city}
                    </span>
                  )}
                  <span className="ms-auto flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5" /> {p.likes}
                  </span>
                </div>
              </div>

              <button
                onClick={() => like(p)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
              <button className="absolute top-2 left-2 w-7 h-7 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* §8.7 + §8.8 Privacy & NSFW notice */}
      <div className="mx-5 mt-6 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-secondary" />
          <h3 className="font-display text-sm">§8.7 Privacy · §8.8 NSFW handling</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <PolicyChip icon={EyeOff} label="Screenshot block" desc="Inherited §6.3" />
          <PolicyChip icon={Eye} label="Forwarding consent" desc="One-time per share" />
          <PolicyChip icon={Hash} label="Per-post audience" desc="Followers / Circle / Public" />
          <PolicyChip icon={BadgeCheck} label="On-device NSFW" desc="Falconsai · score >0.7 blur" />
        </div>
      </div>

      {/* §8.13 summary footer */}
      <div className="mx-5 mt-4 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              §8.13 Summary · §8.10 Zero-cost
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            IPFS storage · on-device CLIP visual search · on-device NSFW (Falconsai) · ephemeral Stories ·
            Moments + Memories generated locally · no premium filters · no paid boosts.
          </p>
        </div>
      </div>
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

export default LamahatScreen;
