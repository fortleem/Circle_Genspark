import { reels } from "@/lib/mock";
import { Heart, MessageCircle, Share2, Music, Sparkles, Radio } from "lucide-react";
import { motion } from "framer-motion";

export function MashahdScreen() {
  return (
    <div className="pb-24">
      <div className="px-5 pt-2 flex items-center justify-between">
        <h1 className="font-display text-4xl">Mashahd</h1>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> 8 live now
        </div>
      </div>

      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {["For you", "Following", "Live", "Cinematic", "Channels", "Music", "Local"].map((f, i) => (
          <button key={f} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${i === 0 ? "bg-primary text-primary-foreground" : "glass"}`}>{f}</button>
        ))}
      </div>

      {/* Reels stack */}
      <div className="px-3 mt-5 space-y-4">
        {reels.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className="relative rounded-3xl overflow-hidden aspect-[9/14] sm:aspect-[16/9] shadow-float">
            <div className="absolute inset-0 bg-gradient-mesh" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent" style={{ ['--tw-gradient-from' as any]: 'hsl(var(--charcoal) / 0.85)' }} />
            <div className="absolute top-3 left-3 glass text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-secondary" /> AI captions on
            </div>
            <div className="absolute top-3 right-3 glass text-[10px] px-2 py-1 rounded-full">P2P · 4K</div>
            <div className="absolute bottom-4 left-4 right-16 text-primary-foreground" style={{ color: 'hsl(var(--cream))' }}>
              <div className="text-sm font-medium">{r.creator}</div>
              <div className="text-xs opacity-90 mt-1 line-clamp-2">{r.caption}</div>
              <div className="flex items-center gap-1 text-[11px] mt-2 opacity-80">
                <Music className="w-3 h-3" /> {r.music}
              </div>
            </div>
            <div className="absolute bottom-4 right-3 flex flex-col items-center gap-3" style={{ color: 'hsl(var(--cream))' }}>
              <ActionPill icon={Heart} label={r.likes} />
              <ActionPill icon={MessageCircle} label="2.1K" />
              <ActionPill icon={Share2} label="Share" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ActionPill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1">
      <span className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"><Icon className="w-5 h-5" /></span>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
