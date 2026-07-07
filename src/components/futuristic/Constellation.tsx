// ╔══════════════════════════════════════════════════════════════════╗
// ║  Constellation — Orbital connection viz (F8, Cirkle-unique)      ║
// ║                                                                  ║
// ║  3 concentric orbits (inner/middle/outer) of your top contacts   ║
// ║  weighted by message volume. No competitor visualizes social     ║
// ║  graph this way; LinkedIn shows lists, IG shows grids, X shows   ║
// ║  numeric counts — Cirkle shows your gravitational system.        ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { apiGet, type Constellation as ConstType } from "@/lib/api"
import { Sparkles, Users } from "lucide-react"
import { motion } from "framer-motion"

const RING_RADIUS = { inner: 55, middle: 100, outer: 145 }
const RING_DOT_SIZE = { inner: 32, middle: 26, outer: 22 }

export function Constellation({ userId }: { userId: number }) {
  const [data, setData] = useState<ConstType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<ConstType>(`/constellation/${userId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading || !data) return null
  if (data.total === 0) return null

  return (
    <div className="orbit-ring rounded-2xl p-4 bg-card/70 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full mesh-fill grid place-items-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Constellation</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {data.total} active connections
            </div>
          </div>
        </div>
        <span className="gold-stroke text-[9px] uppercase">
          <Users className="w-2.5 h-2.5" /> Live
        </span>
      </div>

      <div className="relative w-full h-80 mx-auto flex items-center justify-center" style={{ maxWidth: 340 }}>
        {/* concentric rings */}
        {(['outer', 'middle', 'inner'] as const).map(ring => (
          <div
            key={ring}
            className="absolute rounded-full border border-primary/20"
            style={{
              width: RING_RADIUS[ring] * 2,
              height: RING_RADIUS[ring] * 2,
              borderStyle: ring === 'inner' ? 'solid' : 'dashed',
              opacity: ring === 'inner' ? 0.7 : 0.35,
            }}
          />
        ))}

        {/* center: you */}
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-gradient-gold grid place-items-center text-brand-charcoal font-display text-lg shadow-float z-10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          You
        </motion.div>

        {/* orbital nodes */}
        {data.orbits.map((orbit, ringIdx) =>
          orbit.nodes.map((node, i) => {
            const total = orbit.nodes.length
            const angle = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2
            const r = RING_RADIUS[orbit.ring as 'inner' | 'middle' | 'outer']
            const size = RING_DOT_SIZE[orbit.ring as 'inner' | 'middle' | 'outer']
            const x = Math.cos(angle) * r
            const y = Math.sin(angle) * r
            return (
              <motion.div
                key={`${orbit.ring}-${node.id}`}
                className="absolute group"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: ringIdx * 0.15 + i * 0.05, type: 'spring', stiffness: 200 }}
              >
                <div
                  className="rounded-full bg-primary/30 ring-1 ring-primary/60 grid place-items-center text-[10px] font-bold uppercase hover:scale-110 transition cursor-pointer"
                  style={{ width: size, height: size }}
                  title={`${node.display_name ?? node.handle} · ${node.weight} interactions`}
                >
                  {(node.display_name ?? node.handle ?? '?')[0]}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap text-[9px] bg-card/95 backdrop-blur rounded px-1.5 py-0.5 z-20">
                  {node.display_name ?? node.handle}
                </div>
              </motion.div>
            )
          })
        )}

        {/* ambient sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40"
              style={{ left: `${20 + i * 8}%`, top: `${30 + (i % 3) * 15}%` }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
        {data.orbits.map(o => (
          <div key={o.ring} className="text-center bg-muted/40 rounded-lg py-1.5">
            <div className="font-bold text-foreground tabular-nums">{o.nodes.length}</div>
            <div className="uppercase tracking-wider text-muted-foreground">{o.ring}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
