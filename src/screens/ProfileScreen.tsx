// — Profile: Full user identity, achievements, data sovereignty dashboard, activity heatmap
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck, ShieldCheck, Sparkles, Languages, Palette, Lock, Database, Globe,
  ChevronRight, Trophy, Flame, Eye, Download, Trash2, Shield, Key, Wifi, WifiOff,
  Bell, Moon, Sun, Activity, Heart, MessageCircle, Play, Image as ImageIcon, Wallet,
  Star, Zap, Award, Crown, TrendingUp, Clock, BarChart3, Users
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { Constellation } from "@/components/futuristic/Constellation";
import { TicketWallet } from "@/components/futuristic/TicketWallet";
import { useApi } from "@/hooks/useApi";
import { Link } from "react-router-dom";

const ME = 1;

// Mock activity data for heatmap (last 12 weeks)
const HEATMAP_DATA = Array.from({ length: 84 }, (_, i) => ({
  day: i,
  level: i % 7 === 0 ? 0 : Math.floor(Math.random() * 5),
}));

const ACHIEVEMENTS = [
  { id: 1, icon: Crown, title: "OG Pioneer", desc: "Among first 1,000 users", color: "from-amber-400 to-amber-600", earned: true },
  { id: 2, icon: Flame, title: "30-Day Streak", desc: "Active 30 days straight", color: "from-orange-400 to-red-500", earned: true },
  { id: 3, icon: Shield, title: "Privacy Pro", desc: "All privacy settings maxed", color: "from-emerald-400 to-teal-600", earned: true },
  { id: 4, icon: MessageCircle, title: "Connector", desc: "100+ meaningful conversations", color: "from-blue-400 to-indigo-600", earned: true },
  { id: 5, icon: Star, title: "Community Star", desc: "Top 5% engagement score", color: "from-purple-400 to-pink-600", earned: true },
  { id: 6, icon: Trophy, title: "Governance Hero", desc: "Voted on 50+ proposals", color: "from-teal-400 to-cyan-600", earned: false, progress: 34 },
  { id: 7, icon: Globe, title: "World Traveler", desc: "Used Cirkle in 10+ countries", color: "from-sky-400 to-blue-600", earned: false, progress: 60 },
  { id: 8, icon: Zap, title: "Power User", desc: "Used all 31 modules", color: "from-yellow-400 to-orange-500", earned: false, progress: 87 },
];

const DATA_MODULES = [
  { name: "Wasl (Chat)", size: "142 MB", items: "12,847 messages", icon: MessageCircle },
  { name: "Mashahd (Video)", size: "2.1 GB", items: "34 videos saved", icon: Play },
  { name: "Lamahat (Photos)", size: "890 MB", items: "1,204 photos", icon: ImageIcon },
  { name: "Midan (Posts)", size: "23 MB", items: "89 posts + 234 replies", icon: Activity },
  { name: "Pay (Wallet)", size: "1.2 MB", items: "156 transactions", icon: Wallet },
  { name: "Mail", size: "67 MB", items: "342 emails", icon: Globe },
];

export function ProfileScreen() {
  const { theme, toggleTheme, locale, toggleLocale } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'data' | 'settings'>('overview');
  const [ghostMode, setGhostMode] = useState(false);
  const { data: notifData } = useApi<{ notifications: any[] }>("/notifications/1");
  const unread = (notifData?.notifications ?? []).filter((n: any) => !n.read_at).length;

  return (
    <div className="pb-32">
      {/* Header card */}
      <div className="mx-4 mt-3 rounded-3xl overflow-hidden relative bg-gradient-hero shadow-float" style={{ color: 'hsl(var(--cream))' }}>
        <div className="absolute inset-0 bg-gradient-aurora opacity-60" />
        <div className="relative p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-gold p-1 relative">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-display text-3xl text-foreground">Y</div>
              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-2xl truncate">Yousef Al-Harbi</h2>
                <BadgeCheck className="w-5 h-5 text-sky-300" />
              </div>
              <div className="text-xs opacity-80">@yousef · Cairo, Egypt</div>
              <div className="flex gap-4 mt-2 text-xs">
                <span><b className="font-display text-base">2.4K</b> followers</span>
                <span><b className="font-display text-base">312</b> following</span>
                <span><b className="font-display text-base">Gold</b> tier</span>
              </div>
            </div>
          </div>
          {/* Trust Score Bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="opacity-80">Trust Score</span>
                <span className="font-display text-sm">98/100</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium">47d streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 px-4 mt-4 overflow-x-auto scrollbar-hide">
        {(['overview', 'achievements', 'data', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap ${
              activeTab === tab ? 'bg-secondary text-secondary-foreground' : 'glass'
            }`}>
            {tab === 'overview' && '📊 Overview'}
            {tab === 'achievements' && '🏆 Achievements'}
            {tab === 'data' && '🔐 My Data'}
            {tab === 'settings' && '⚙️ Settings'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2 px-4 mt-4">
              {[
                { v: "98", l: "Trust", icon: Shield, color: "text-emerald-400" },
                { v: "12", l: "Spaces", icon: Users, color: "text-blue-400" },
                { v: "47", l: "Streak", icon: Flame, color: "text-amber-400" },
                { v: "5", l: "Badges", icon: Award, color: "text-purple-400" },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-3 text-center">
                  <s.icon className={`w-4 h-4 mx-auto ${s.color}`} />
                  <div className="font-display text-xl mt-1">{s.v}</div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Activity Heatmap */}
            <div className="px-4 mt-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Activity · Last 12 weeks</h3>
                <span className="text-[10px] text-muted-foreground">847 contributions</span>
              </div>
              <div className="glass rounded-2xl p-3">
                <div className="grid grid-rows-7 grid-flow-col gap-[2px]">
                  {HEATMAP_DATA.map((d, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[3px] ${
                      d.level === 0 ? 'bg-muted/40' :
                      d.level === 1 ? 'bg-secondary/30' :
                      d.level === 2 ? 'bg-secondary/50' :
                      d.level === 3 ? 'bg-secondary/70' : 'bg-secondary'
                    }`} title={`${d.level} activities`} />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-[9px] text-muted-foreground">Less</span>
                  {[0,1,2,3,4].map(l => (
                    <div key={l} className={`w-2.5 h-2.5 rounded-[2px] ${
                      l === 0 ? 'bg-muted/40' : l === 1 ? 'bg-secondary/30' : l === 2 ? 'bg-secondary/50' : l === 3 ? 'bg-secondary/70' : 'bg-secondary'
                    }`} />
                  ))}
                  <span className="text-[9px] text-muted-foreground">More</span>
                </div>
              </div>
            </div>

            {/* Constellation */}
            <div className="px-4 mt-5">
              <Constellation userId={ME} />
            </div>

            {/* Ticket Wallet */}
            <div className="px-4 mt-5">
              <TicketWallet />
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div key="achievements" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="px-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">Your Achievements</h3>
              <span className="text-xs text-muted-foreground">5 of 8 earned</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.id} className={`glass rounded-2xl p-4 relative overflow-hidden ${!a.earned ? 'opacity-70' : ''}`}>
                  {a.earned && <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-secondary/20 to-transparent rounded-bl-full" />}
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0 ${!a.earned ? 'grayscale' : ''}`}>
                      <a.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{a.title}</h4>
                        {a.earned && <BadgeCheck className="w-4 h-4 text-secondary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                      {!a.earned && a.progress !== undefined && (
                        <div className="mt-2">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-secondary/60 rounded-full" style={{ width: `${a.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{a.progress}% complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div key="data" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="px-4 mt-4">
            {/* Data sovereignty banner */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-medium text-sm">Data Sovereignty</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                All your data is encrypted with your personal key. Cirkle cannot read your messages, photos, or files.
                You can export or permanently delete everything at any time.
              </p>
              <div className="flex gap-2 mt-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs">
                  <Download className="w-3 h-3" /> Export all
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs">
                  <Trash2 className="w-3 h-3" /> Delete account
                </button>
              </div>
            </div>

            {/* Storage breakdown */}
            <h3 className="font-display text-lg mb-3">Your Data · 3.4 GB total</h3>
            <div className="space-y-2">
              {DATA_MODULES.map((m) => {
                const sizeNum = parseFloat(m.size);
                const maxSize = 2100; // 2.1GB max
                const pct = Math.min((sizeNum * (m.size.includes('GB') ? 1000 : 1)) / maxSize * 100, 100);
                return (
                  <div key={m.name} className="glass rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <m.icon className="w-4 h-4 text-secondary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{m.name}</span>
                          <span className="text-xs text-muted-foreground">{m.size}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{m.items}</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted mt-1.5 overflow-hidden">
                          <div className="h-full bg-secondary/60 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Encryption info */}
            <div className="glass rounded-2xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-secondary" />
                <h4 className="font-medium text-sm">Encryption Keys</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Algorithm</span><span className="font-mono">Ed25519 + X25519</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Key age</span><span>127 days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Backup guardians</span><span>3 of 5 active</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last rotation</span><span>12 days ago</span></div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <Section title="Privacy & Identity">
              <Row icon={ShieldCheck} title="Privacy center" sub="Granular controls for every module" to="/privacy" />
              <Row icon={Lock} title="Ghost mode" sub={ghostMode ? "You're invisible" : "Visible to contacts"} toggle toggled={ghostMode} onToggle={() => setGhostMode(!ghostMode)} />
              <Row icon={Eye} title="Who can see me" sub="Contacts only" />
              <Row icon={Database} title="Data ownership" sub="Export, delete, or transfer" />
            </Section>

            <Section title="Personalization">
              <Row icon={Sparkles} title="AI personalization" sub="What Cirkle knows about you" />
              <Row icon={theme === 'dark' ? Moon : Sun} title="Theme" sub={theme === "dark" ? "Dark · Aurora" : "Light · Cream"} onClick={toggleTheme} />
              <Row icon={Languages} title="Language" sub={locale === "ar" ? "العربية (RTL)" : "English"} onClick={toggleLocale} />
              <Row icon={Globe} title="Region" sub="Egypt · Cairo" />
            </Section>

            <Section title="Notifications">
              <Row icon={Bell} title="Push notifications" sub="All modules enabled" toggle toggled={true} onToggle={() => {}} />
              <Row icon={Activity} title="Activity digest" sub="Daily at 8 PM" />
            </Section>

            <Section title="Network">
              <Row icon={Wifi} title="Mesh network" sub="Auto-connect nearby peers" to="/mesh" />
              <Row icon={WifiOff} title="Offline mode" sub="Fully functional without internet" />
            </Section>

            <Section title="Account">
              <Row icon={Key} title="Manage keys" sub="Ed25519 · Rotated 12d ago" to="/id" />
              <Link to="/auth" className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition text-red-500">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center"><Lock className="w-4 h-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium">Sign out</div></div>
              </Link>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 mt-6">
      <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">{title}</h3>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, title, sub, toggle, toggled, onToggle, onClick, to }: {
  icon: any; title: string; sub: string; toggle?: boolean; toggled?: boolean; onToggle?: () => void; onClick?: () => void; to?: string;
}) {
  const rowCls = "w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition";
  const inner = (
    <>
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><Icon className="w-4 h-4 text-secondary" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{sub}</div>
      </div>
      {toggle ? (
        <span className={`w-10 h-6 rounded-full relative transition ${toggled ? 'bg-secondary' : 'bg-muted'}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${toggled ? 'left-5' : 'left-1'}`} />
        </span>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </>
  );
  return to ? (
    <Link to={to} onClick={onClick ?? onToggle} className={rowCls}>{inner}</Link>
  ) : (
    <button onClick={onClick ?? onToggle} className={rowCls}>{inner}</button>
  );
}

export default ProfileScreen;
