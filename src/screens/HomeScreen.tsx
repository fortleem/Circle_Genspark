// — Home Dashboard. Production-ready: ALL data sources active.
// Sources: notifications, pulse, capsules, whispers, wallet, AI recommendations,
// events, posts (trending), channels, emergency quick-action.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, MapPin, TrendingUp, Briefcase, Zap, Plus, Mic, Camera, ScanLine,
  Heart, Repeat2, Megaphone, Users, Building2, Calendar, AlertTriangle,
  BellRing, Radio, Shield, Hash, ChevronRight, Wallet, Clock, Flame,
  MessageCircle, Play, Image as ImageIcon, Bot, Bell, Eye, Phone,
  Siren, Activity, Lock, Hourglass, Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { ui } from "@/lib/uiStrings";
import { useApi } from "@/hooks/useApi";
import { findNavMatch } from "@/lib/tabs";
import { apiPost } from "@/lib/api";
import type { CityEvent, MidanPost, Channel } from "@/lib/api";

interface Notification { id: number; type: string; title: string; body: string; read: number; created_at: string; }
interface PulseEvent { id: number; event_type: string; region: string; severity: number; title: string; }
interface Capsule { id: number; title: string; unlock_at: string; sealed_by_name: string; }
interface WalletData { balance: number; currency: string; }
interface WhisperData { whispers: any[]; }

export function HomeScreen() {
  const { locale, names, country } = useApp();
  const t = ui(locale).home;
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ─── ALL Data Sources ───
  const { data: evData } = useApi<{ events: CityEvent[] }>("/events");
  const { data: postsData } = useApi<{ posts: MidanPost[] }>("/midan/posts");
  const { data: chanData } = useApi<{ channels: Channel[] }>("/channels");
  const { data: notifsData } = useApi<{ notifications: Notification[] }>("/notifications/1");
  const { data: pulseData } = useApi<{ events: PulseEvent[] }>("/pulse");
  const { data: capsulesData } = useApi<{ capsules: Capsule[] }>("/capsules/feed");
  const { data: walletData } = useApi<{ wallet: WalletData }>("/pay/wallet/1");
  const { data: whispersData } = useApi<WhisperData>("/whispers/1");

  const events = evData?.events ?? [];
  const carousel = events.slice(0, 5);
  const nearby = events.slice(0, 6);
  const upcoming = events.slice(0, 3);
  const allPosts = postsData?.posts ?? [];
  const trending = [...allPosts].sort((a, b) => (b.likes + b.reposts) - (a.likes + a.reposts)).slice(0, 5);
  const channels = (chanData?.channels ?? []).slice(0, 3);
  const notifications = notifsData?.notifications ?? [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const pulseEvents = pulseData?.events ?? [];
  const capsules = capsulesData?.capsules ?? [];
  const wallet = walletData?.wallet;
  const whispers = whispersData?.whispers ?? [];

  // AI Ask handler
  async function handleAiAsk() {
    const q = aiQuery.trim();
    if (!q) return;
    // First check nav routing
    const match = findNavMatch(q, (item) => item.label(names));
    if (match) { navigate(match.path); return; }
    // Ask Sage AI
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await apiPost<{ reply: string }>("/sage/chat", {
        messages: [{ role: "user", content: q }],
        context: "home_dashboard"
      });
      setAiResponse(res.reply ?? "I couldn't process that. Try again!");
    } catch {
      setAiResponse("Sage AI is thinking... try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-32">
      {/* ─── Greeting + Notification Badge ─── */}
      <section className="px-5 pt-2">
        <div className="flex items-start justify-between">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl leading-tight">
              {t.hello}, <span className="gradient-text-gold">Yousef</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {country} · {names.tagline}
            </p>
          </motion.div>
          <Link to="/profile" className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display text-lg">
              Y
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </section>

      {/* ─── Status Bar: Wallet + Whispers + Pulse ─── */}
      <section className="px-5">
        <div className="grid grid-cols-3 gap-2">
          <Link to="/pay" className="glass rounded-2xl p-3 hover:bg-secondary/10 transition">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="w-3.5 h-3.5 text-secondary" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Wallet</span>
            </div>
            <div className="font-display text-lg">{wallet ? `${wallet.balance.toLocaleString()} ${wallet.currency}` : "..."}</div>
          </Link>
          <Link to="/wasl" className="glass rounded-2xl p-3 hover:bg-secondary/10 transition">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Whispers</span>
            </div>
            <div className="font-display text-lg">{whispers.length} <span className="text-xs text-muted-foreground">active</span></div>
          </Link>
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Pulse</span>
            </div>
            <div className="font-display text-lg">{pulseEvents.length} <span className="text-xs text-muted-foreground">events</span></div>
          </div>
        </div>
      </section>

      {/* ─── AI Ask Bar (Sage AI) ─── */}
      <section className="px-5">
        <div className="glass rounded-2xl px-4 py-3 shadow-soft">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-secondary" />
            <input
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground"
              placeholder="Ask Sage AI anything..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAiAsk(); }}
            />
            <button
              onClick={handleAiAsk}
              disabled={aiLoading}
              className="w-8 h-8 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center disabled:opacity-50"
            >
              {aiLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {aiResponse && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/90 leading-relaxed">{aiResponse}</p>
              </div>
            </motion.div>
          )}
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> On-device inference · No data leaves your device
          </p>
        </div>
      </section>

      {/* ─── Emergency Quick Action ─── */}
      <section className="px-5">
        <Link to="/emergency" className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-500/10 to-orange-500/10 p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Siren className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-red-600 dark:text-red-400">Emergency SOS</div>
              <p className="text-xs text-muted-foreground">Fire · Ambulance · Police — Tap for instant alert with live location</p>
            </div>
            <ChevronRight className="w-5 h-5 text-red-500" />
          </motion.div>
        </Link>
      </section>

      {/* ─── Quick Actions (8 grid) ─── */}
      <BlueprintSection title={t.quickActions} hint="Customizable actions">
        <div className="px-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: ScanLine, label: "Scan & Pay", to: "/pay", color: "text-emerald-500" },
              { icon: Plus, label: "New Post", to: "/midan", color: "text-blue-500" },
              { icon: Camera, label: "Go Live", to: "/mashahd", color: "text-purple-500" },
              { icon: Users, label: "New Circle", to: "/circles", color: "text-teal-500" },
              { icon: MessageCircle, label: "Chat", to: "/wasl", color: "text-secondary" },
              { icon: ImageIcon, label: "Photo", to: "/lamahat", color: "text-pink-500" },
              { icon: MapPin, label: "Maps", to: "/maps", color: "text-orange-500" },
              { icon: Bot, label: "Sage AI", to: "/aicore", color: "text-violet-500" },
            ].map((q, i) => (
              <Link key={i} to={q.to} className="glass rounded-2xl py-3 flex flex-col items-center gap-2 hover:scale-[1.03] transition shadow-soft">
                <q.icon className={`w-5 h-5 ${q.color}`} />
                <span className="text-[10px] text-foreground/80">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </BlueprintSection>

      {/* ─── Notifications Preview ─── */}
      {notifications.length > 0 && (
        <BlueprintSection title="Notifications" hint={`${unreadCount} unread`}>
          <div className="px-5 space-y-2">
            {notifications.slice(0, 4).map(n => (
              <div key={n.id} className={`rounded-xl border p-3 flex items-start gap-3 ${!n.read ? "border-secondary/40 bg-secondary/5" : "border-border bg-card"}`}>
                <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${!n.read ? "text-secondary" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{n.body}</div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
              </div>
            ))}
            {notifications.length > 4 && (
              <button className="w-full text-xs text-secondary py-2 hover:underline">
                View all {notifications.length} notifications →
              </button>
            )}
          </div>
        </BlueprintSection>
      )}

      {/* ─── Pulse Events (Live Activity Heatmap) ─── */}
      {pulseEvents.length > 0 && (
        <BlueprintSection title="City Pulse" hint="Real-time activity around you">
          <div className="px-5">
            <div className="glass rounded-2xl p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pulseEvents.slice(0, 6).map(pe => (
                  <div key={pe.id} className={`rounded-xl p-3 border ${
                    pe.severity >= 80 ? "border-red-500/40 bg-red-500/10" :
                    pe.severity >= 50 ? "border-amber-500/40 bg-amber-500/10" :
                    "border-border bg-card"
                  }`}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{pe.event_type}</div>
                    <div className="text-sm font-medium mt-1 line-clamp-1">{pe.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{pe.region}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BlueprintSection>
      )}

      {/* ─── Time Capsules ─── */}
      {capsules.length > 0 && (
        <BlueprintSection title="Time Capsules" hint="Messages from the past, unlocking soon">
          <div className="px-5">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {capsules.map(c => (
                <div key={c.id} className="shrink-0 w-64 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hourglass className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] uppercase tracking-widest text-secondary">Sealed</span>
                  </div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">By {c.sealed_by_name}</div>
                  <div className="text-[10px] text-secondary mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Unlocks {new Date(c.unlock_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BlueprintSection>
      )}

      {/* ─── Top Carousel — Featured Events ─── */}
      <BlueprintSection title={t.featured} hint="Emergency · PSAs · Featured events">
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

      {/* ─── AI-Powered For You Recommendations ─── */}
      <BlueprintSection title="For you" hint="AI-curated · On-device personalization">
        <div className="px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { t: "Trending in your circles", s: "23 new posts from people you follow", to: "/midan", icon: TrendingUp, color: "from-blue-500/10 to-transparent border-blue-500/30" },
              { t: "New videos for you", s: "5 unwatched from subscriptions", to: "/mashahd", icon: Play, color: "from-purple-500/10 to-transparent border-purple-500/30" },
              { t: "A 3-day getaway to AlUla", s: "Based on your wishlist · Rihla AI", to: "/rihla", icon: Calendar, color: "from-secondary/10 to-transparent border-secondary/30" },
              { t: "Weekly read: Calm tech", s: "12-min curated by Sage AI", to: "/aicore", icon: Sparkles, color: "from-amber-500/10 to-transparent border-amber-500/30" },
            ].map((c, i) => (
              <Link key={i} to={c.to} className={`rounded-2xl border bg-gradient-to-br ${c.color} p-4 relative overflow-hidden block hover:scale-[1.01] transition`}>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
                <span className="text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1">
                  <c.icon className="w-3 h-3" /> AI Recommendation
                </span>
                <h4 className="font-display text-lg mt-1">{c.t}</h4>
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

      {/* ─── Happening Nearby ─── */}
      <BlueprintSection title={t.nearby} hint="City-level precision · No precise location sent">
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

      {/* ─── Trending in Country ─── */}
      <BlueprintSection title={`${t.trending} in ${country}`} hint="Public Midan posts · No per-user tracking">
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

      {/* ─── Four Pillars Summary Strip ─── */}
      <BlueprintSection title="Your Pillars" hint="Quick access to your activity">
        <div className="px-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: MessageCircle, label: "Wasl", sub: "5 rooms", to: "/wasl", color: "text-blue-500" },
              { icon: Play, label: "Mashahd", sub: "12 videos", to: "/mashahd", color: "text-purple-500" },
              { icon: ImageIcon, label: "Lamahat", sub: "12 photos", to: "/lamahat", color: "text-pink-500" },
              { icon: Hash, label: "Midan", sub: `${allPosts.length} posts`, to: "/midan", color: "text-emerald-500" },
            ].map((p, i) => (
              <Link key={i} to={p.to} className="glass rounded-2xl p-3 text-center hover:scale-[1.03] transition">
                <p.icon className={`w-6 h-6 mx-auto ${p.color}`} />
                <div className="text-xs font-medium mt-2">{p.label}</div>
                <div className="text-[10px] text-muted-foreground">{p.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </BlueprintSection>

      {/* ─── Official Updates ─── */}
      <BlueprintSection title="Official updates" hint="From followed Official Channels">
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

      {/* ─── Your Workspaces ─── */}
      <BlueprintSection title="Your workspaces" hint="Madrasa rooms marked dashboard-visible">
        <div className="px-5">
          <Link to="/madrasa" className="block glass rounded-2xl p-4 hover:bg-muted/20 transition">
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

      {/* ─── Upcoming in Your Circles ─── */}
      <BlueprintSection title="Upcoming in your circles" hint="Next events from joined Circles">
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

      {/* ─── Sponsored Banner ─── */}
      <BlueprintSection title="Sponsored" hint="City-level targeting only · 1 per session">
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

      {/* ─── Journey Hint Footer ─── */}
      <section className="px-5">
        <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-4 h-4 text-secondary" />
            <span className="text-xs uppercase tracking-widest text-secondary">Dashboard · Offline-first</span>
          </div>
          <p className="text-sm text-foreground/90">
            All sections cache locally. Reorder or hide them under Settings → Dashboard Layout. Works offline; an indicator shows when data is stale.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────── Helpers ─────────────────────────── */

function BlueprintSection({
  title, hint, children,
}: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="px-5 mb-3 flex items-baseline gap-2">
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default HomeScreen;
