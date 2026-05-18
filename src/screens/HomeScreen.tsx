// §5 — Home Dashboard. Pulls real /api data (events, midan trending, channels)
import { motion } from "framer-motion";
import { Sparkles, MapPin, TrendingUp, Briefcase, Zap, Plus, Mic, Camera, ScanLine, Heart, Repeat2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { ui } from "@/lib/uiStrings";
import { useApi } from "@/hooks/useApi";
import type { CityEvent, MidanPost, Channel } from "@/lib/api";

export function HomeScreen() {
  const { locale, names, country } = useApp();
  const t = ui(locale).home;
  const navigate = useNavigate();

  const { data: evData }     = useApi<{ events: CityEvent[] }>("/events");
  const { data: trendData }  = useApi<{ posts: MidanPost[] }>("/midan/trending?limit=5");
  const { data: chanData }   = useApi<{ channels: Channel[] }>("/channels");

  const events = (evData?.events ?? []).slice(0, 6);
  const trending = trendData?.posts ?? [];
  const channels = (chanData?.channels ?? []).slice(0, 3);

  return (
    <div className="space-y-8 pb-32">
      {/* Greeting */}
      <section className="px-5 pt-2">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl leading-tight">
          {t.hello}, <span className="gradient-text-gold">Yousef</span>
        </motion.h1>
        <p className="text-muted-foreground text-sm mt-1">{country} · {names.tagline}</p>
      </section>

      {/* AI Ask bar */}
      <section className="px-5">
        <div className="glass rounded-full px-4 py-3 flex items-center gap-3 shadow-soft">
          <Sparkles className="w-4 h-4 text-secondary" />
          <input
            className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground"
            placeholder={t.ask}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.toLowerCase();
                if (q.includes("wasl") || q.includes("chat") || q.includes("message")) navigate("/wasl");
                else if (q.includes("video") || q.includes("mashahd")) navigate("/mashahd");
                else if (q.includes("travel") || q.includes("rihla")) navigate("/rihla");
                else if (q.includes("pay") || q.includes("wallet")) navigate("/pay");
                else if (q.includes("translate")) navigate("/translate");
              }
            }}
          />
          <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Mic className="w-4 h-4" /></button>
        </div>
      </section>

      {/* Featured (real events) */}
      <section>
        <SectionHeader icon={Zap} title={t.featured} />
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2 snap-x snap-mandatory">
          {events.length === 0 ? (
            <SkeletonCard />
          ) : events.map((f, i) => (
            <motion.article
              key={f.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="snap-start shrink-0 w-[78%] sm:w-[60%] md:w-[40%] aspect-[4/5] rounded-2xl border bg-gradient-to-br from-secondary/30 to-secondary/5 border-secondary/40 p-5 relative overflow-hidden glass"
              style={f.cover_color ? { background: `linear-gradient(135deg, ${f.cover_color}25 0%, transparent 100%)` } : undefined}
            >
              <div className="absolute inset-0 aurora-bg opacity-60" />
              <div className="relative h-full flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{f.category}</span>
                <div>
                  <h3 className="font-display text-2xl leading-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{f.venue}, {f.city} · {new Date(f.start_time).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.interested.toLocaleString()} interested</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-5">
        <h2 className="font-display text-base mb-3 text-muted-foreground">{t.quickActions}</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: ScanLine, label: "Scan & Pay",  to: "/pay" },
            { icon: Camera,   label: "Story",       to: "/lamahat" },
            { icon: Plus,     label: "Post",        to: "/midan" },
            { icon: Sparkles, label: "Ask AI",      to: "/translate" },
          ].map((q, i) => (
            <Link key={i} to={q.to} className="glass rounded-2xl py-3 flex flex-col items-center gap-2 hover:scale-[1.03] transition shadow-soft">
              <q.icon className="w-5 h-5 text-secondary" />
              <span className="text-[11px] text-foreground/80">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Nearby (events) */}
      <section>
        <SectionHeader icon={MapPin} title={t.nearby} />
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2">
          {events.length === 0 ? <SkeletonCard /> : events.map(n => (
            <div key={n.id} className="shrink-0 w-56 rounded-2xl bg-gradient-card border border-border p-4 shadow-soft">
              <div className="aspect-video rounded-xl bg-gradient-mesh opacity-90 mb-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 glass text-[10px] px-2 py-0.5 rounded-full">{n.category}</div>
              </div>
              <div className="font-medium truncate">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{n.venue} · {n.city}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For you AI */}
      <section className="px-5">
        <SectionHeader icon={Sparkles} title="For you" inline />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {[
            { t: "A 3-day getaway to AlUla", s: "Based on your wishlist · Rihla AI" , to: "/rihla" },
            { t: "Weekly read: Calm tech", s: "12-min curated by Circle AI", to: "/mashahd" },
          ].map((c, i) => (
            <Link key={i} to={c.to} className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden block">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
              <span className="text-[10px] uppercase tracking-widest text-secondary">AI Recommendation</span>
              <h4 className="font-display text-xl mt-1">{c.t}</h4>
              <p className="text-sm text-muted-foreground mt-1">{c.s}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Midan trending */}
      <section className="px-5">
        <SectionHeader icon={TrendingUp} title={t.trending} inline />
        <div className="mt-3 glass rounded-2xl divide-y divide-border/60 overflow-hidden">
          {trending.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">No trending posts yet</div>
          ) : trending.map((p) => (
            <Link key={p.id} to="/midan" className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/30 transition">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{p.display_name}</span>
                <span>·</span>
                <span>@{p.handle}</span>
                {p.city && (<><span>·</span><span>{p.city}</span></>)}
              </div>
              <p className="text-sm line-clamp-2">{p.content}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.likes}</span>
                <span className="flex items-center gap-1"><Repeat2 className="w-3 h-3" /> {p.reposts}</span>
                <span>· {p.replies_count} replies</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Channels shortcut */}
      <section className="px-5">
        <SectionHeader icon={Briefcase} title="Follow verified channels" inline />
        <div className="mt-3 space-y-2">
          {channels.length === 0 ? (
            <div className="glass rounded-2xl p-4 text-sm text-muted-foreground">Loading channels…</div>
          ) : channels.map((ch) => (
            <Link key={ch.id} to="/channels" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft hover:bg-muted/30 transition">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display">
                {ch.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{ch.name}</div>
                <div className="text-xs text-muted-foreground truncate">{ch.subscriber_count.toLocaleString()} subscribers · {ch.category ?? "general"}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">{ch.channel_type}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, inline }: { icon: any; title: string; inline?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-5 ${inline ? "" : "mb-3"}`}>
      <Icon className="w-4 h-4 text-secondary" />
      <h2 className="font-display text-xl">{title}</h2>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-[78%] sm:w-[60%] md:w-[40%] aspect-[4/5] rounded-2xl glass animate-pulse" />
  );
}
