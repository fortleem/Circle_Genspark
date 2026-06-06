// ╔══════════════════════════════════════════════════════════════════╗
// ║  MeshStatusChip — Live presence indicator (Circle-unique)        ║
// ║                                                                  ║
// ║  Shows in TopBar: animated mesh-fill chip with                   ║
// ║    • online count                                                ║
// ║    • mesh-node count (Reticulum off-grid)                        ║
// ║    • encrypted-channel count                                     ║
// ║    • active region pulse                                         ║
// ║  Click → opens presence flyout with full mesh roster.            ║
// ║                                                                  ║
// ║  This is the antidote to every other app's "online dot": Circle  ║
// ║  exposes the WHOLE mesh, including off-grid Reticulum nodes.     ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiGet, type PresenceUser, type PresenceTotals } from "@/lib/api"
import { Radio, Lock, Globe2, Smartphone, Monitor, Antenna } from "lucide-react"

const STATE_DOT: Record<string, string> = {
  online: 'bg-emerald-500',
  mesh: 'bg-amber-500',
  away: 'bg-zinc-400',
  invisible: 'bg-zinc-700',
}

const DEVICE_ICON: Record<string, any> = {
  mobile: Smartphone,
  desktop: Monitor,
  'mesh-only': Antenna,
}

export function MeshStatusChip() {
  const [totals, setTotals] = useState<PresenceTotals | null>(null)
  const [roster, setRoster] = useState<PresenceUser[]>([])
  const [open, setOpen] = useState(false)
  const [tick, setTick] = useState(0) // forces pulse animation

  // Poll every 20s
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await apiGet<{ presence: PresenceUser[]; totals: PresenceTotals }>('/presence/mesh')
        if (!alive) return
        setRoster(r.presence ?? [])
        setTotals(r.totals)
        setTick(t => t + 1)
      } catch { /* swallow */ }
    }
    load()
    const i = setInterval(load, 20000)
    return () => { alive = false; clearInterval(i) }
  }, [])

  if (!totals) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative h-9 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-medium gold-stroke bg-card/60 backdrop-blur hover:bg-primary/10 transition"
        title="Mesh & presence"
      >
        {/* animated dot stack */}
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full ${STATE_DOT.online} opacity-70 animate-ping`} key={tick} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${STATE_DOT.online}`} />
        </span>
        <span className="tabular-nums">{totals.online}</span>
        {totals.mesh > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <Antenna className="w-3 h-3 text-amber-500" />
            <span className="tabular-nums">{totals.mesh}</span>
          </>
        )}
        {totals.encrypted_channels > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <Lock className="w-3 h-3 text-cyan-500" />
            <span className="tabular-nums">{totals.encrypted_channels}</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 orbit-ring bg-card/95 backdrop-blur-xl rounded-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full mesh-fill grid place-items-center">
                    <Radio className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight">Live Mesh</div>
                    <div className="text-[10px] text-muted-foreground">Real-time presence + off-grid nodes</div>
                  </div>
                </div>
              </div>

              {/* totals strip */}
              <div className="grid grid-cols-3 px-3 py-2 gap-2 border-b border-border/30">
                <div className="text-center">
                  <div className="text-lg font-bold tabular-nums">{totals.online}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">online</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold tabular-nums text-amber-500">{totals.mesh}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">on mesh</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold tabular-nums text-cyan-500">{totals.encrypted_channels}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">E2EE chans</div>
                </div>
              </div>

              {/* regions */}
              {totals.regions.length > 0 && (
                <div className="px-3 py-2 border-b border-border/30 flex flex-wrap gap-1">
                  {totals.regions.map(r => (
                    <span key={r} className="gold-stroke text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Globe2 className="w-2.5 h-2.5" />{r}
                    </span>
                  ))}
                </div>
              )}

              {/* roster */}
              <div className="max-h-72 overflow-y-auto">
                {roster.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">No one on the mesh right now.</div>
                )}
                {roster.map(r => {
                  const DeviceIcon = DEVICE_ICON[r.device ?? ''] ?? Smartphone
                  return (
                    <div key={r.user_id} className="px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-primary/20 grid place-items-center text-[10px] font-bold uppercase">
                          {(r.display_name ?? r.handle ?? '?')[0]}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${STATE_DOT[r.state] ?? 'bg-zinc-500'} ring-2 ring-card`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{r.display_name ?? r.handle ?? `user${r.user_id}`}</div>
                        <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                          <DeviceIcon className="w-2.5 h-2.5" />
                          {r.state}{r.region ? ' · ' + r.region : ''}{r.mesh_node ? ' · mesh' : ''}
                        </div>
                      </div>
                      {r.encrypted_channels > 0 && (
                        <span className="text-[10px] flex items-center gap-0.5 text-cyan-500">
                          <Lock className="w-2.5 h-2.5" />{r.encrypted_channels}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="px-3 py-2 text-[10px] text-muted-foreground text-center border-t border-border/30">
                Mesh nodes route over Reticulum when internet is unreachable.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
