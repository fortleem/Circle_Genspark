import { transactions } from "@/lib/mock";
import { ScanLine, Send, Plus, Eye, EyeOff, Nfc, ShieldCheck, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function PayScreen() {
  const [hide, setHide] = useState(false);
  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-4xl">Circle Pay</h1>
        <p className="text-sm text-muted-foreground mt-1">Premium fintech for your everyday</p>
      </div>

      {/* Card */}
      <div className="px-5 mt-5">
        <motion.div initial={{ rotateX: -10, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }}
          className="relative rounded-3xl aspect-[16/10] p-5 overflow-hidden shadow-float bg-gradient-hero"
          style={{ color: 'hsl(var(--cream))' }}>
          <div className="absolute inset-0 bg-gradient-aurora opacity-70" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full border border-white/15" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-white/10" />
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-70">Balance</div>
                <div className="font-display text-4xl mt-1">{hide ? "•••••" : "SAR 24,180.50"}</div>
              </div>
              <button onClick={() => setHide(!hide)} className="w-9 h-9 rounded-full glass-strong flex items-center justify-center">
                {hide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs opacity-70">Yousef Al-Harbi</div>
                <div className="text-sm tracking-[0.3em] mt-1">•••• 4820</div>
              </div>
              <Nfc className="w-6 h-6 opacity-80" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 px-5 mt-5">
        {[
          { icon: ScanLine, label: "Scan" },
          { icon: Send, label: "Send" },
          { icon: Plus, label: "Top-up" },
          { icon: ShieldCheck, label: "Vault" },
        ].map((q, i) => (
          <button key={i} className="glass rounded-2xl py-3 flex flex-col items-center gap-2 shadow-soft">
            <q.icon className="w-5 h-5 text-secondary" />
            <span className="text-[11px]">{q.label}</span>
          </button>
        ))}
      </div>

      {/* P2P contacts */}
      <div className="px-5 mt-6">
        <h2 className="font-display text-xl mb-3">Send to</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {["Layla", "Omar", "Sara", "Khalid", "Mom", "Faisal"].map(n => (
            <div key={n} className="shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-gradient-mesh flex items-center justify-center font-display text-lg" style={{ color: 'hsl(var(--cream))' }}>{n[0]}</div>
              <span className="text-[10px] text-muted-foreground">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Recent activity</h2>
          <button className="text-xs text-secondary">See all</button>
        </div>
        <div className="glass rounded-2xl divide-y divide-border/60 overflow-hidden">
          {transactions.map(tx => {
            const isPos = tx.amount > 0;
            return (
              <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPos ? "bg-secondary/20 text-secondary" : "bg-muted text-foreground"}`}>
                  {isPos ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tx.who}</div>
                  <div className="text-[11px] text-muted-foreground">{tx.cat} · {tx.time}</div>
                </div>
                <div className={`text-sm font-medium ${isPos ? "text-secondary" : ""}`}>
                  {isPos ? "+" : ""}{tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
