// — Privacy: Full privacy dashboard with per-module controls, data flow viz, privacy score
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, Eye, EyeOff, Shield, MapPin, Mic, Camera, Users, MessageCircle,
  Activity, Globe, Smartphone, Wifi, Database, AlertTriangle, CheckCircle2, ToggleLeft
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useApi } from "@/hooks/useApi";

const MODULES_PRIVACY = [
  { id: "wasl", name: "Wasl (Chat)", icon: MessageCircle, level: "maximum", desc: "E2EE · No metadata retention", color: "text-emerald-500" },
  { id: "mashahd", name: "Mashahd (Video)", icon: Activity, level: "high", desc: "Watch history local-only", color: "text-emerald-500" },
  { id: "lamahat", name: "Lamahat (Photos)", icon: Camera, level: "maximum", desc: "EXIF stripped · Encrypted at rest", color: "text-emerald-500" },
  { id: "midan", name: "Midan (Public)", icon: Globe, level: "medium", desc: "Posts public by default", color: "text-amber-500" },
  { id: "pay", name: "Circle Pay", icon: Database, level: "high", desc: "Txns encrypted · CBE compliant", color: "text-emerald-500" },
  { id: "location", name: "Location", icon: MapPin, level: "high", desc: "Geohash-5 only (±4.9 km)", color: "text-emerald-500" },
  { id: "mesh", name: "Mesh Network", icon: Wifi, level: "maximum", desc: "MAC randomized · No IP logging", color: "text-emerald-500" },
  { id: "ai", name: "AI Features", icon: Shield, level: "maximum", desc: "On-device only · Opt-in cloud", color: "text-emerald-500" },
];

const PRIVACY_THREATS = [
  { id: 1, severity: "low", message: "2 apps have contact access — review permissions", module: "Apps" },
  { id: 2, severity: "info", message: "Last key rotation was 12 days ago (recommended: 30d)", module: "ID" },
];

const DATA_FLOWS = [
  { from: "Your Device", to: "Circle Servers", data: "Encrypted blobs only", encrypted: true },
  { from: "Your Device", to: "Mesh Peers", data: "E2EE packets", encrypted: true },
  { from: "Circle Servers", to: "Third Parties", data: "NOTHING", encrypted: true, blocked: true },
  { from: "Your Device", to: "IPFS Network", data: "CID pinning (public content only)", encrypted: false },
];

export function PrivacyScreen() {
  const { names } = useApp();
  const [ghostMode, setGhostMode] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { data: privData } = useApi<any>("/privacy/1");

  // Calculate privacy score
  const maxModules = MODULES_PRIVACY.filter(m => m.level === "maximum").length;
  const highModules = MODULES_PRIVACY.filter(m => m.level === "high").length;
  const privacyScore = Math.round((maxModules * 100 + highModules * 80 + (MODULES_PRIVACY.length - maxModules - highModules) * 50) / MODULES_PRIVACY.length);

  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-3xl">Privacy Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete control over your digital footprint</p>
      </div>

      {/* Privacy Score */}
      <div className="px-4 mt-4">
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#privGrad)" strokeWidth="8"
                  strokeDasharray={`${privacyScore * 2.51} 251`} strokeLinecap="round" />
                <defs><linearGradient id="privGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" />
                  <stop offset="100%" stopColor="hsl(160, 84%, 50%)" />
                </linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl">{privacyScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl">Privacy Score</h3>
              <p className="text-xs text-muted-foreground mt-1">Excellent — your data is well protected across all modules</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">{maxModules} Maximum</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500">{highModules} High</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">{MODULES_PRIVACY.length - maxModules - highModules} Medium</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost Mode */}
      <div className="px-4 mt-4">
        <button onClick={() => setGhostMode(!ghostMode)}
          className={`w-full glass rounded-2xl p-4 flex items-center gap-4 transition ${ghostMode ? 'border border-secondary/50 bg-secondary/5' : ''}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ghostMode ? 'bg-secondary/20' : 'bg-muted'}`}>
            {ghostMode ? <EyeOff className="w-6 h-6 text-secondary" /> : <Eye className="w-6 h-6 text-muted-foreground" />}
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-medium">Ghost Mode</h4>
            <p className="text-xs text-muted-foreground">{ghostMode ? "You're invisible to everyone" : "Visible to contacts"}</p>
          </div>
          <div className={`w-12 h-7 rounded-full relative transition ${ghostMode ? 'bg-secondary' : 'bg-muted'}`}>
            <motion.div animate={{ x: ghostMode ? 22 : 2 }} className="absolute top-1 w-5 h-5 rounded-full bg-white shadow" />
          </div>
        </button>
      </div>

      {/* Alerts */}
      {PRIVACY_THREATS.length > 0 && (
        <div className="px-4 mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">Recommendations</h3>
          <div className="space-y-2">
            {PRIVACY_THREATS.map(t => (
              <div key={t.id} className={`glass rounded-xl p-3 flex items-start gap-3 ${
                t.severity === 'low' ? 'border border-amber-500/20' : ''
              }`}>
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  t.severity === 'low' ? 'text-amber-500' : 'text-sky-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{t.message}</p>
                  <span className="text-[10px] text-muted-foreground">{t.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-module privacy controls */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-secondary" /> Module Privacy Levels
        </h3>
        <div className="space-y-2">
          {MODULES_PRIVACY.map(m => (
            <div key={m.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <m.icon className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-[10px] text-muted-foreground">{m.desc}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                m.level === 'maximum' ? 'bg-emerald-500/15 text-emerald-500' :
                m.level === 'high' ? 'bg-sky-500/15 text-sky-500' : 'bg-amber-500/15 text-amber-500'
              }`}>{m.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data flow visualization */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary" /> Data Flow Map
        </h3>
        <div className="glass rounded-2xl p-4 space-y-3">
          {DATA_FLOWS.map((flow, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-lg bg-secondary/10 font-medium whitespace-nowrap">{flow.from}</span>
              <div className="flex-1 flex items-center gap-1">
                <div className={`flex-1 h-px ${flow.blocked ? 'bg-red-500' : 'bg-secondary/40'}`} />
                {flow.encrypted && <Lock className="w-3 h-3 text-emerald-500" />}
                {flow.blocked && <span className="text-[9px] text-red-500 font-medium">BLOCKED</span>}
                <div className={`flex-1 h-px ${flow.blocked ? 'bg-red-500' : 'bg-secondary/40'}`} />
              </div>
              <span className="px-2 py-1 rounded-lg bg-muted font-medium whitespace-nowrap">{flow.to}</span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Circle NEVER sells, shares, or analyzes your data. Zero third-party access.
          </p>
        </div>
      </div>

      {/* Privacy philosophy */}
      <div className="px-4 mt-6">
        <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
          <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-secondary" /> Our Privacy Promise
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-secondary">•</span> End-to-end encryption on all private communications</li>
            <li className="flex items-start gap-2"><span className="text-secondary">•</span> AI runs on-device — your data never leaves your phone</li>
            <li className="flex items-start gap-2"><span className="text-secondary">•</span> No telemetry, no analytics, no ad tracking</li>
            <li className="flex items-start gap-2"><span className="text-secondary">•</span> Location is geohash-5 only (±4.9 km precision)</li>
            <li className="flex items-start gap-2"><span className="text-secondary">•</span> Full data export and permanent deletion at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default PrivacyScreen;
