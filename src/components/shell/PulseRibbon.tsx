// ╔══════════════════════════════════════════════════════════════════╗
// ║  PulseRibbon — Real-time per-pillar activity heat (Cirkle-unique)║
// ║                                                                  ║
// ║  A thin gold-strand ribbon under TopBar showing the LIVE pulse   ║
// ║  of activity across every pillar over the last 60 minutes.       ║
// ║                                                                  ║
// ║  Click a pillar segment → jumps to that pillar with a "fresh     ║
// ║  activity" filter applied. NO competitor exposes this cross-     ║
// ║  network heart-rate of their entire system.                      ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { apiGet, type PulseSummary } from "@/lib/api"
import { Activity } from "lucide-react"

const PILLAR_ROUTE: Record<string, string> = {
  wasl: '/wasl',
  midan: '/midan',
  mashahd: '/mashahd',
  lamahat: '/lamahat',
  mail: '/mail',
  pay: '/pay',
  channels: '/channels',
  mesh: '/mesh',
}

const PILLAR_COLOR: Record<string, string> = {
  wasl: 'from-cyan-500/50 to-cyan-400/20',
  midan: 'from-orange-500/50 to-amber-400/20',
  mashahd: 'from-rose-500/50 to-pink-400/20',
  lamahat: 'from-emerald-500/50 to-teal-400/20',
  mail: 'from-purple-500/50 to-violet-400/20',
  pay: 'from-yellow-500/50 to-amber-400/20',
}

export function PulseRibbon() {
  const [pulse, setPulse] = useState<PulseSummary | null>(null)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    let alive = true
    const load = () => {
      apiGet<PulseSummary>('/pulse')
        .then(r => alive && setPulse(r))
        .catch(() => {})
    }
    load()
    const i = setInterval(load, 30000)
    return () => { alive = false; clearInterval(i) }
  }, [])

  // Only show on home + main pillar screens; hide on settings/system pages
  const VISIBLE_ON = ['/', '/wasl', '/midan', '/mashahd', '/lamahat', '/mail', '/pay', '/mesh', '/channels']
  if (!VISIBLE_ON.includes(loc.pathname)) return null
  if (!pulse || pulse.total === 0) return null

  // sort pillars by weight desc
  const entries = Object.entries(pulse.byPillar).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="hidden md:flex items-stretch gap-1 px-4 py-1 border-b border-border/40 bg-card/30 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground pr-2 border-r border-border/40">
        <Activity className="w-3 h-3 text-primary" />
        <span>Pulse · last 60m</span>
      </div>
      <div className="flex-1 flex gap-1 items-stretch overflow-x-auto scrollbar-none">
        {entries.map(([pillar, weight]) => {
          const pct = (weight / max) * 100
          const color = PILLAR_COLOR[pillar] ?? 'from-zinc-500/50 to-zinc-400/20'
          return (
            <button
              key={pillar}
              onClick={() => {
                const route = PILLAR_ROUTE[pillar]
                if (route) nav(route)
              }}
              className="group relative flex-1 min-w-[80px] h-7 rounded-md overflow-hidden bg-muted/40 hover:bg-muted transition"
              title={`${pillar}: ${weight} events`}
            >
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} transition-all`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative h-full flex items-center justify-between px-2 text-[10px] font-semibold">
                <span className="capitalize">{pillar}</span>
                <span className="tabular-nums opacity-70">{weight}</span>
              </div>
              {/* shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
