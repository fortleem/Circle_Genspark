// — Mini Apps Store: Full app marketplace with categories, permissions, and activity
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3, Search, Download, Shield, Star, TrendingUp, Clock, Users,
  Gamepad2, Calculator, BookOpen, Heart, MapPin, Music, Camera, Wallet,
  Lock, Eye, Mic, Smartphone
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { MiniApp } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

const CATEGORIES = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "productivity", label: "Productivity", icon: Calculator },
  { id: "social", label: "Social", icon: Users },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "health", label: "Health", icon: Heart },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "entertainment", label: "Games", icon: Gamepad2 },
];

const FEATURED_APPS = [
  {
    id: 101, name: "SplitPay", category: "finance", desc: "Split bills with friends instantly",
    installs: 45200, rating: 4.8, permissions: ["wallet", "contacts"],
    gradient: "from-emerald-500 to-teal-600", icon: "💰"
  },
  {
    id: 102, name: "FocusZone", category: "productivity", desc: "Pomodoro timer with circle groups",
    installs: 32100, rating: 4.9, permissions: ["notifications"],
    gradient: "from-purple-500 to-indigo-600", icon: "⏱️"
  },
  {
    id: 103, name: "CityWalk", category: "social", desc: "AR walking tours in your city",
    installs: 28700, rating: 4.7, permissions: ["location", "camera"],
    gradient: "from-orange-500 to-red-500", icon: "🚶"
  },
];

const ALL_APPS = [
  { id: 201, name: "QuranPal", category: "education", installs: 120000, rating: 4.9, icon: "📖", permissions: ["audio"] },
  { id: 202, name: "Expense Track", category: "finance", installs: 67000, rating: 4.6, icon: "📊", permissions: ["wallet"] },
  { id: 203, name: "Meditation", category: "health", installs: 54000, rating: 4.8, icon: "🧘", permissions: ["audio", "notifications"] },
  { id: 204, name: "Language Buddy", category: "education", installs: 41000, rating: 4.5, icon: "🗣️", permissions: ["microphone", "contacts"] },
  { id: 205, name: "Workout Log", category: "health", installs: 38000, rating: 4.4, icon: "💪", permissions: ["notifications"] },
  { id: 206, name: "Chess Online", category: "entertainment", installs: 29000, rating: 4.7, icon: "♟️", permissions: ["contacts"] },
  { id: 207, name: "Recipe Share", category: "social", installs: 23000, rating: 4.3, icon: "🍳", permissions: ["camera", "contacts"] },
  { id: 208, name: "Note Sync", category: "productivity", installs: 19000, rating: 4.6, icon: "📝", permissions: [] },
  { id: 209, name: "Music Rooms", category: "entertainment", installs: 15000, rating: 4.5, icon: "🎵", permissions: ["audio", "microphone"] },
  { id: 210, name: "Step Counter", category: "health", installs: 11000, rating: 4.2, icon: "👟", permissions: ["location"] },
  { id: 211, name: "Story Maker", category: "social", installs: 8500, rating: 4.4, icon: "✍️", permissions: ["camera"] },
  { id: 212, name: "Budget Plan", category: "finance", installs: 7200, rating: 4.1, icon: "💵", permissions: ["wallet"] },
];

const PERMISSION_ICONS: Record<string, any> = {
  wallet: Wallet, contacts: Users, location: MapPin, camera: Camera,
  audio: Music, microphone: Mic, notifications: Smartphone,
};

export function AppsScreen() {
  const { names } = useApp();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<typeof FEATURED_APPS[0] | typeof ALL_APPS[0] | null>(null);
  const [installed, setInstalled] = useState<Set<number>>(new Set([201, 203]));

  const filteredApps = ALL_APPS.filter(a =>
    (category === "all" || a.category === category) &&
    (!search || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleInstall = (id: number) => {
    setInstalled(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-3xl">Mini Apps</h1>
        <p className="text-sm text-muted-foreground mt-1">Sandboxed apps · You control permissions</p>
      </div>

      {/* Search bar */}
      <div className="px-4 mt-4">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="bg-transparent flex-1 outline-none text-sm" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
              category === c.id ? 'bg-secondary text-secondary-foreground' : 'glass'
            }`}>
            <c.icon className="w-3 h-3" /> {c.label}
          </button>
        ))}
      </div>

      {/* Featured carousel */}
      {category === "all" && !search && (
        <div className="mt-4">
          <div className="flex items-center justify-between px-5 mb-2">
            <h3 className="font-display text-lg flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Featured</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
            {FEATURED_APPS.map(app => (
              <motion.div key={app.id} whileHover={{ scale: 1.02 }}
                className="shrink-0 w-72 rounded-2xl overflow-hidden shadow-float cursor-pointer"
                onClick={() => setSelectedApp(app)}>
                <div className={`bg-gradient-to-br ${app.gradient} p-5 text-white`}>
                  <div className="text-3xl mb-2">{app.icon}</div>
                  <h4 className="font-display text-xl">{app.name}</h4>
                  <p className="text-sm opacity-80 mt-1">{app.desc}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs opacity-80">
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {(app.installs / 1000).toFixed(1)}K</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {app.rating}</span>
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {app.permissions.length} perms</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Security banner */}
      {category === "all" && !search && (
        <div className="px-4 mt-4">
          <div className="glass rounded-2xl p-3 border border-secondary/20 flex items-center gap-3">
            <Shield className="w-8 h-8 text-secondary shrink-0" />
            <div>
              <h4 className="text-sm font-medium">WASM Sandbox Protection</h4>
              <p className="text-[10px] text-muted-foreground">Every app runs in an isolated sandbox. Explicit permission grants. Source code verifiable via IPFS.</p>
            </div>
          </div>
        </div>
      )}

      {/* All apps grid */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">
            {category === "all" ? "All Apps" : CATEGORIES.find(c => c.id === category)?.label}
          </h3>
          <span className="text-xs text-muted-foreground">{filteredApps.length} apps</span>
        </div>
        <div className="space-y-2">
          {filteredApps.map(app => (
            <div key={app.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center text-xl border border-secondary/20">
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{app.name}</h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{app.category}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" /> {app.rating}</span>
                  <span>{(app.installs / 1000).toFixed(0)}K installs</span>
                  {app.permissions.length > 0 && (
                    <span className="flex items-center gap-0.5"><Lock className="w-3 h-3" /> {app.permissions.length}</span>
                  )}
                </div>
              </div>
              <button onClick={() => toggleInstall(app.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  installed.has(app.id) ? 'glass text-muted-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                {installed.has(app.id) ? 'Installed' : 'Install'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* App detail modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-card rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-float"
              onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center text-3xl border border-secondary/30">
                    {'icon' in selectedApp ? selectedApp.icon : '📱'}
                  </div>
                  <div>
                    <h3 className="font-display text-xl">{selectedApp.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedApp.category} · {'rating' in selectedApp ? selectedApp.rating : '4.5'} ★</p>
                  </div>
                </div>
                {'desc' in selectedApp && <p className="text-sm text-muted-foreground mb-4">{selectedApp.desc}</p>}

                {/* Permissions */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Required Permissions</h4>
                  <div className="space-y-1.5">
                    {(selectedApp.permissions || []).map(p => {
                      const Icon = PERMISSION_ICONS[p] || Shield;
                      return (
                        <div key={p} className="flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4 text-secondary" />
                          <span className="capitalize">{p}</span>
                        </div>
                      );
                    })}
                    {(!selectedApp.permissions || selectedApp.permissions.length === 0) && (
                      <p className="text-xs text-emerald-500 flex items-center gap-1"><Shield className="w-3 h-3" /> No special permissions needed</p>
                    )}
                  </div>
                </div>

                <button onClick={() => { toggleInstall(selectedApp.id); setSelectedApp(null); }}
                  className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm">
                  {installed.has(selectedApp.id) ? 'Uninstall' : 'Install App'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AppsScreen;
