import { photos } from "@/lib/mock";
import { Sparkles, Layers, Heart } from "lucide-react";

export function LamahatScreen() {
  return (
    <div className="pb-32">
      <div className="px-5 pt-2 flex items-center justify-between">
        <h1 className="font-display text-4xl">Lamahat</h1>
        <button className="text-xs px-3 py-1.5 rounded-full bg-gradient-gold text-brand-charcoal font-medium">New collection</button>
      </div>

      {/* Stories */}
      <div className="flex gap-3 px-5 mt-5 overflow-x-auto scrollbar-hide">
        {["Memories", "Travel", "Food", "Friends", "Sunsets", "Studio"].map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-mesh">
              <div className={`w-full h-full rounded-full`} style={{ background: `conic-gradient(from ${i * 60}deg, hsl(var(--gold)), hsl(var(--rose)), hsl(var(--teal)))` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>

      {/* AI memories banner */}
      <div className="mx-5 mt-5 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 to-transparent p-4 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-8 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center"><Sparkles className="w-5 h-5 text-brand-charcoal" /></div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-secondary">AI Memories</div>
          <div className="font-display text-lg">A year in golden hour</div>
          <div className="text-xs text-muted-foreground">42 photos · 8 places</div>
        </div>
      </div>

      {/* Pinterest-style grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 gap-2 px-2 mt-5">
        {photos.map(p => (
          <div key={p.id}
            className={`mb-2 break-inside-avoid rounded-xl relative overflow-hidden group ${
              p.ratio === "tall" ? "aspect-[3/4]" : p.ratio === "wide" ? "aspect-[4/3]" : "aspect-square"
            }`}
            style={{ background: `linear-gradient(135deg, hsl(${p.hue} 60% 55%), hsl(${(p.hue + 60) % 360} 50% 35%))` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <button className="absolute top-2 right-2 w-7 h-7 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Heart className="w-3.5 h-3.5" />
            </button>
            <button className="absolute bottom-2 left-2 w-7 h-7 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
