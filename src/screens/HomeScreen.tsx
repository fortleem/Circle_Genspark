// — Home Dashboard. Pulls real /api data with EXPLICIT -sub-section breakdown
// per blueprint walkthrough order.
import { motion } from "framer-motion";
import {
  Sparkles, MapPin, TrendingUp, Briefcase, Zap, Plus, Mic, Camera, ScanLine,
  Heart, Repeat2, Megaphone, Users, Building2, Calendar, AlertTriangle,
  BellRing, Radio, Shield, Hash, ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { ui } from "@/lib/uiStrings";
import { useApi } from "@/hooks/useApi";
import { findNavMatch } from "@/lib/tabs";
import type { CityEvent, MidanPost, Channel } from "@/lib/api";

export function HomeScreen() {
  const { locale, names, country } = useApp();
  const t = ui(locale).home;
  const navigate = useNavigate();

  const { data: evData } = useApi<{ events: CityEvent[] }>("/events");
  const { data: trendData } = useApi<{ posts: MidanPost[] }>("/midan/trending?limit=5");
  const { data: chanData } = useApi<{ channels: Channel[] }>("/channels");

  const events = evData?.events ?? [];
  const carousel = events.slice(0, 5); // Top Carousel — 3-5 items
  const nearby = events.slice(0, 6); // Happening Nearby
  const upcoming = events.slice(0, 3); // Upcoming in Your Circles
  const trending = trendData?.posts ?? []; // Trending
  const channels = (chanData?.channels ?? []).slice(0, 3); // Official Updates

  return (
    <div className="space-y-10 pb-32">
      {/* Greeting */}
      <section className="px-5 pt-2">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl leading-tight">
          {t.hello}, <span className="gradient-text-gold">Yousef</span>
        </motion.h1>
        <p className="text-muted-foreground text-sm mt-1">
          {country} · {names.tagline} · <span className="text-secondary">Home Dashboard</span>
        </p>
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
                const q = (e.target as HTMLInputElement).value;
                const match = findNavMatch(q, (item) => item.label(names));
                if (match) navigate(match.path);
              }
            }}
          />
          <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Mic className="w-4 h-4" /></button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 px-2">On-device inference · No data leaves your device</p>
      </section>

      {/* ─────────────── Top Carousel ─────────────── */}
      <BlueprintSection num="" title={t.featured} hint="Emergency · PSAs · Featured events (priority-ordered)">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2 snap-x snap-mandatory">
          {carousel.length === 0 ? (
            <SkeletonCard />
          ) : carousel.map((f, i) => {
            const isAlert = f.priority >= 90;
            return (
              <motion.article
                key={f.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`snap-start shrink-0 w-[78%] sm:w-[60%] md:w-[40%] aspect-[4/5] rounded-2xl border p-5 relative overflow-hidden glass ${
                  isAlert
                    ? "border-red-500/50 bg-gradient-to-br from-red-500/20 to-transparent"
                    : "border-secondary/40 bg-gradient-to-br from-secondary/30 to-secondary/5"
                }`}
                style={!isAlert && f.cover_color ? { background: `linear-gradient(135deg, ${f.cover_color}25 0%, transparent 100%)` } : undefined}
              >
                <div className="absolute inset-0 aurora-bg opacity-60" />
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {isAlert ? "EMERGENCY" : f.category}
                    </span>
                    {isAlert && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl leading-tight">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{f.venue}, {f.city} · {new Date(f.start_time).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.interested.toLocaleString()} interested</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </BlueprintSection>

      {/* ─────────────── Quick Actions ─────────────── */}
      <BlueprintSection num="" title={t.quickActions} hint="4 fixed actions · user-customizable (8 available)">
        <div className="px-5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: ScanLine, label: "Scan & Pay", to: "/pay" },
              { icon: Plus, label: "New Post", to: "/midan" },
              { icon: Camera, label: "Go Live", to: "/mashahd" },
              { icon: Users, label: "New Circle", to: "/circles" },
            ].map((q, i) => (
              <Link key={i} to={q.to} className="glass rounded-2xl py-3 flex flex-col items-center gap-2 hover:scale-[1.03] transition shadow-soft">
                <q.icon className="w-5 h-5 text-secondary" />
                <span className="text-[11px] text-foreground/80">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </BlueprintSection>

      {/* ─────────────── Happening Nearby ─────────────── */}
      <BlueprintSection num="" title={t.nearby} hint="City-level precision (geohash-5, ~4.9 km) · No precise location sent">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2">
          {nearby.length === 0 ? <SkeletonCard /> : nearby.map(n => (
            <div key={n.id} className="shrink-0 w-56 rounded-2xl bg-gradient-card border border-border p-4 shadow-soft">
              <div className="aspect-video rounded-xl bg-gradient-mesh opacity-90 mb-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 glass text-[10px] px-2 py-0.5 rounded-full">{n.category}</div>
                <div className="absolute bottom-2 left-2 glass text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />{n.city}
                </div>
              </div>
              <div className="font-medium truncate">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{n.venue} · {new Date(n.start_time).toLocaleDateString()}</div>
              <button className="mt-2 text-[11px] text-secondary hover:underline">Interested</button>
            </div>
          ))}
        </div>
      </BlueprintSection>

      {/* ─────────────── For You (On-Device Personalization) ─────────────── */}
      <BlueprintSection num="" title="For you" hint="On-device matrix factorization (64-dim vector) · Trained while charging">
        <div className="px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { t: "A 3-day getaway to AlUla", s: "Based on your wishlist · Rihla AI" , to: "/rihla", icon: Calendar },
              { t: "Weekly read: Calm tech", s: "12-min curated by Circle AI", to: "/mashahd", icon: Sparkles },
            ].map((c, i) => (
              <Link key={i} to={c.to} className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden block">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
                <span className="text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1">
                  <c.icon className="w-3 h-3" /> AI Recommendation
                </span>
                <h4 className="font-display text-xl mt-1">{c.t}</h4>
                <p className="text-sm text-muted-foreground mt-1">{c.s}</p>
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground px-1">
            <Shield className="w-3 h-3 text-secondary" />
            User vector never leaves the device. Item embeddings public via CDN.
          </div>
        </div>
      </BlueprintSection>

      {/* ─────────────── Trending in [City] ─────────────── */}
      <BlueprintSection num="" title={`${t.trending} in ${country}`} hint="Aggregated from public Midan posts · No per-user tracking">
        <div className="px-5">
          <div className="glass rounded-2xl divide-y divide-border/60 overflow-hidden">
            {trending.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">No trending posts yet</div>
            ) : trending.map((p) => (
              <Link key={p.id} to="/midan" className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/30 transition">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="w-3 h-3 text-secondary" />
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
        </div>
      </BlueprintSection>

      {/* ─────────────── Official Updates ─────────────── */}
      <BlueprintSection num="" title="Official updates" hint="Latest message from each followed Official Channel">
        <div className="px-5 space-y-2">
          {channels.length === 0 ? (
            <div className="glass rounded-2xl p-4 text-sm text-muted-foreground">Loading channels…</div>
          ) : channels.map((ch) => (
            <Link key={ch.id} to="/channels" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft hover:bg-muted/30 transition">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display">
                {ch.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{ch.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {ch.subscriber_count.toLocaleString()} subscribers · {ch.category ?? "general"}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary uppercase">
                {ch.channel_type}
              </span>
            </Link>
          ))}
        </div>
      </BlueprintSection>

      {/* ─────────────── Your Workspaces ─────────────── */}
      <BlueprintSection num="" title="Your workspaces" hint="Maktab rooms marked dashboard-visible">
        <div className="px-5">
          <Link to="/maktab" className="block glass rounded-2xl p-4 hover:bg-muted/20 transition">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-secondary" />
              <div className="flex-1">
                <div className="font-medium">Jozour Egypt · Engineering</div>
                <div className="text-xs text-muted-foreground">#announcements · 14 members · Last activity 2h ago</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </BlueprintSection>

      {/* ─────────────── Sponsored Banner ─────────────── */}
      <BlueprintSection num="" title="Sponsored" hint="City-level targeting only · 1 per session · Max 3/day">
        <div className="px-5">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-4 flex items-center gap-4">
            <Radio className="w-8 h-8 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-amber-600">Sponsored · Cairo</div>
              <div className="font-medium">El Sawy Cultural Centre — Friday Poetry Night</div>
              <div className="text-xs text-muted-foreground">No retargeting · No tracking · CPM $0.50</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 transition">
              Learn More
            </button>
          </div>
        </div>
      </BlueprintSection>

      {/* ─────────────── Upcoming in Your Circles ─────────────── */}
      <BlueprintSection num="" title="Upcoming in your circles" hint="Next 3 events from joined Circles (private + public)">
        <div className="px-5 space-y-2">
          {upcoming.map((e) => (
            <Link key={e.id} to="/circles" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:bg-muted/30 transition">
              <Calendar className="w-5 h-5 text-secondary" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{e.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {new Date(e.start_time).toLocaleString()} · {e.venue}
                </div>
              </div>
              <button className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">RSVP</button>
            </Link>
          ))}
        </div>
      </BlueprintSection>

      {/* Mini journey hint */}
      <section className="px-5">
        <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-4 h-4 text-secondary" />
            <span className="text-xs uppercase tracking-widest text-secondary">Journey · Offline-first</span>
          </div>
          <p className="text-sm text-foreground/90">
            All 9 sections cache locally. Reorder or hide them under Settings → Dashboard Layout. Your dashboard works offline; an indicator shows when data is stale.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────── Helpers ─────────────────────────── */

function BlueprintSection({
  num, title, hint, children,
}: { num: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="px-5 mb-3 flex items-baseline gap-2">
        <span className="text-[10px] uppercase tracking-widest text-secondary font-mono">{num}</span>
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      {hint && <p className="px-5 -mt-2 mb-3 text-[11px] text-muted-foreground">{hint}</p>}
      {children}
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-[78%] sm:w-[60%] md:w-[40%] aspect-[4/5] rounded-2xl glass animate-pulse" />
  );
}

export default HomeScreen;
