// — Transparency Report: Live metrics, financial data, moderation stats, open source status
import { motion } from "framer-motion";
import {
  BarChart3, Users, Shield, DollarSign, Eye, Server, Globe, Clock,
  TrendingUp, AlertTriangle, CheckCircle2, Code2, GitBranch, Heart
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useApp } from "@/providers/AppProvider";

const METRICS = [
  { label: "Total Users", value: "2.4M", change: "+12.3%", icon: Users, color: "text-blue-400" },
  { label: "Monthly Active", value: "1.8M", change: "+8.7%", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Messages/Day", value: "47M", change: "+15%", icon: Heart, color: "text-pink-400" },
  { label: "Uptime", value: "99.97%", change: "30d", icon: Server, color: "text-amber-400" },
];

const FINANCIAL = [
  { month: "Jun 2024", revenue: 245000, costs: 180000, surplus: 65000 },
  { month: "May 2024", revenue: 228000, costs: 175000, surplus: 53000 },
  { month: "Apr 2024", revenue: 210000, costs: 168000, surplus: 42000 },
  { month: "Mar 2024", revenue: 195000, costs: 162000, surplus: 33000 },
];

const MODERATION = [
  { type: "Spam removed", count: 12450, icon: AlertTriangle },
  { type: "Content appeals", count: 234, icon: Shield },
  { type: "Appeals upheld", count: 89, icon: CheckCircle2 },
  { type: "Accounts banned", count: 67, icon: Users },
  { type: "False positives", count: 12, icon: Eye },
];

const OPEN_SOURCE = [
  { repo: "cirkle-core", stars: 4200, lang: "Rust", desc: "Core server and federation" },
  { repo: "cirkle-mobile", stars: 2800, lang: "Swift/Kotlin", desc: "Native mobile apps" },
  { repo: "cirkle-web", stars: 1900, lang: "TypeScript", desc: "Web client (this app)" },
  { repo: "cirkle-ai", stars: 3400, lang: "Python", desc: "On-device ML models" },
  { repo: "cirkle-crypto", stars: 1200, lang: "Rust", desc: "E2EE & key management" },
];

export function TransparencyScreen() {
  const { names } = useApp();
  const { data } = useApi<{ entries: any[] }>("/transparency/ledger");
  const entries = data?.entries ?? [];

  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-3xl">Transparency</h1>
        <p className="text-sm text-muted-foreground mt-1">Every metric, every dollar, every decision — public by default</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {METRICS.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">{m.change}</span>
            </div>
            <div className="font-display text-2xl">{m.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Financial transparency */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-secondary" /> Financial Report
        </h3>
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-2 bg-muted/30">
            <span>Month</span><span className="text-right">Revenue</span><span className="text-right">Costs</span><span className="text-right">Surplus</span>
          </div>
          {FINANCIAL.map((f, i) => (
            <div key={i} className="grid grid-cols-4 text-xs px-4 py-3 border-t border-border/30">
              <span className="font-medium">{f.month}</span>
              <span className="text-right">${(f.revenue / 1000).toFixed(0)}K</span>
              <span className="text-right text-muted-foreground">${(f.costs / 1000).toFixed(0)}K</span>
              <span className="text-right text-emerald-500">${(f.surplus / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 px-1">
          Revenue: subscriptions + sponsored banners (city-level only). No data sales, ever.
        </p>
      </div>

      {/* Revenue visualization */}
      <div className="px-4 mt-4">
        <div className="glass rounded-2xl p-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Revenue Trend (Last 4 months)</h4>
          <div className="flex items-end gap-2 h-24">
            {FINANCIAL.slice().reverse().map((f, i) => {
              const height = (f.revenue / 250000) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-secondary/60 to-secondary" />
                  <span className="text-[9px] text-muted-foreground">{f.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Moderation stats */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-secondary" /> Moderation Report (30 days)
        </h3>
        <div className="glass rounded-2xl divide-y divide-border/30">
          {MODERATION.map((m, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <m.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{m.type}</span>
              <span className="font-display text-base">{m.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-3 mt-2 border border-amber-500/20">
          <p className="text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3 text-amber-500 inline mr-1" />
            All moderation actions are appealable via the Community Jury system. False positive rate: 0.1%.
          </p>
        </div>
      </div>

      {/* Open source */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-secondary" /> Open Source
        </h3>
        <div className="space-y-2">
          {OPEN_SOURCE.map(repo => (
            <div key={repo.repo} className="glass rounded-xl p-3 flex items-center gap-3">
              <GitBranch className="w-4 h-4 text-secondary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono font-medium">{repo.repo}</div>
                <div className="text-xs text-muted-foreground">{repo.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium flex items-center gap-0.5">⭐ {(repo.stars / 1000).toFixed(1)}K</div>
                <div className="text-[9px] text-muted-foreground">{repo.lang}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparency ledger from API */}
      {entries.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="font-display text-lg mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-secondary" /> Public Ledger
          </h3>
          <div className="space-y-2">
            {entries.slice(0, 5).map((e: any) => (
              <div key={e.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{e.event_type}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.description}</div>
                </div>
                <span className="text-[10px] text-muted-foreground">{new Date(e.event_time).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default TransparencyScreen;
