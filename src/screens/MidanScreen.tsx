import { posts, trending } from "@/lib/mock";
import { Heart, MessageCircle, Repeat2, Share2, ShieldCheck, Mic, BadgeCheck, BarChart3, Radio } from "lucide-react";
import { motion } from "framer-motion";

export function MidanScreen() {
  return (
    <div className="pb-32">
      <div className="px-5 pt-2 flex items-center justify-between">
        <h1 className="font-display text-4xl">Midan</h1>
        <button className="text-xs px-3 py-1.5 rounded-full glass flex items-center gap-1.5"><Radio className="w-3 h-3 text-accent" /> Spaces · 14 live</button>
      </div>

      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {["For you", "Following", "Saudi", "Tech", "Sports", "Culture"].map((f, i) => (
          <button key={f} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${i === 0 ? "bg-primary text-primary-foreground" : "glass"}`}>{f}</button>
        ))}
      </div>

      {/* Composer */}
      <div className="mx-5 mt-4 glass rounded-2xl p-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display">Y</div>
        <input className="bg-transparent flex-1 outline-none text-sm py-2" placeholder="Share to the public square" />
        <button className="w-9 h-9 rounded-full bg-secondary/20 text-secondary flex items-center justify-center"><Mic className="w-4 h-4" /></button>
      </div>

      {/* Trending strip */}
      <div className="mt-4 px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Trending</div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {trending.map(t => (
            <span key={t.id} className="text-xs px-3 py-1.5 rounded-full bg-muted whitespace-nowrap">{t.tag} · <span className="text-muted-foreground">{t.count}</span></span>
          ))}
        </div>
      </div>

      {/* Feed */}
      <ul className="mt-5">
        {posts.map((p, i) => (
          <motion.li key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="px-5 py-4 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-mesh shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{p.user}</span>
                  {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-secondary" />}
                  <span className="text-xs text-muted-foreground">{p.handle} · {p.time}</span>
                </div>
                <p className="mt-1.5 text-[15px] leading-relaxed">{p.body}</p>

                {p.image && (
                  <div className="mt-3 rounded-2xl aspect-video bg-gradient-hero relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-aurora opacity-70" />
                  </div>
                )}

                {/* AI moderation badge */}
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-secondary"><ShieldCheck className="w-3 h-3" /> AI verified · No misinformation</div>

                <div className="mt-3 flex items-center gap-6 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-accent"><Heart className="w-4 h-4" />{p.likes}</button>
                  <button className="flex items-center gap-1.5 hover:text-secondary"><MessageCircle className="w-4 h-4" />{p.comments}</button>
                  <button className="flex items-center gap-1.5 hover:text-primary"><Repeat2 className="w-4 h-4" />{p.reposts}</button>
                  <button className="flex items-center gap-1.5 hover:text-foreground"><Share2 className="w-4 h-4" /></button>
                  <button className="flex items-center gap-1.5 hover:text-foreground ms-auto"><BarChart3 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
