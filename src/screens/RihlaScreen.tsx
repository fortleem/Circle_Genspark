import { trips } from "@/lib/mock";
import { MapPin, Plane, Hotel, Languages, DollarSign, Sparkles, Calendar } from "lucide-react";

const cover: Record<string, string> = {
  teal: "from-primary to-brand-steel",
  rose: "from-accent to-brand-rose",
  gold: "from-brand-gold to-brand-rose",
};

export function RihlaScreen() {
  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-4xl">Rihla</h1>
        <p className="text-sm text-muted-foreground mt-1">Three trips planned · 1 active</p>
      </div>

      {/* Map dashboard */}
      <div className="mx-5 mt-5 rounded-3xl overflow-hidden aspect-[16/10] relative shadow-float">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, hsl(var(--gold)/0.6), transparent 30%), radial-gradient(circle at 70% 60%, hsl(var(--rose)/0.6), transparent 35%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(hsl(var(--cream)/0.07) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--cream)/0.07) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {[
          { x: "30%", y: "40%", label: "AlUla" },
          { x: "65%", y: "30%", label: "Istanbul" },
          { x: "78%", y: "65%", label: "Tokyo" },
        ].map((p, i) => (
          <div key={i} className="absolute" style={{ left: p.x, top: p.y }}>
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inset-0 -m-2 rounded-full bg-secondary/40 animate-pulse-glow" />
              <span className="relative block w-3 h-3 rounded-full bg-secondary border-2 border-background" />
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] glass px-2 py-0.5 rounded-full whitespace-nowrap">{p.label}</span>
            </div>
          </div>
        ))}
        <div className="absolute bottom-3 left-3 glass rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Global view</div>
      </div>

      {/* Quick tools */}
      <div className="grid grid-cols-4 gap-3 px-5 mt-5">
        {[
          { icon: Plane, label: "Flights" },
          { icon: Hotel, label: "Stays" },
          { icon: Languages, label: "Translate" },
          { icon: DollarSign, label: "Currency" },
        ].map((t, i) => (
          <button key={i} className="glass rounded-2xl py-3 flex flex-col items-center gap-2 shadow-soft">
            <t.icon className="w-5 h-5 text-secondary" />
            <span className="text-[11px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* AI itinerary */}
      <div className="mx-5 mt-5 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/30 rounded-full blur-3xl" />
        <div className="text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Itinerary</div>
        <h3 className="font-display text-2xl mt-1">5 days in Istanbul</h3>
        <p className="text-sm text-muted-foreground mt-1">Tailored to your love of architecture and food markets.</p>
        <button className="mt-3 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs">Build with AI</button>
      </div>

      {/* Trips */}
      <div className="px-5 mt-6">
        <h2 className="font-display text-xl mb-3">Your trips</h2>
        <div className="space-y-3">
          {trips.map(t => (
            <div key={t.id} className={`rounded-2xl bg-gradient-to-br ${cover[t.cover]} p-5 relative overflow-hidden`} style={{ color: 'hsl(var(--cream))' }}>
              <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
              <div className="relative flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-80 flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.dates}</div>
                  <div className="font-display text-3xl mt-1">{t.city}</div>
                  <div className="text-xs opacity-80 mt-1">{t.days} days · 4 collaborators</div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-full glass">Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
