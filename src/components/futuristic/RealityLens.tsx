// ╔══════════════════════════════════════════════════════════════════╗
// ║  RealityLens — Geo-anchored AR memory layer (F6)                 ║
// ║                                                                  ║
// ║  Cirkle-unique. Lamahat photos pinned to lat/lng/bearing build a ║
// ║  geo-temporal memory map. Walk through a city and see what other ║
// ║  Cirkle users captured here, anchored by GPS + compass bearing.  ║
// ║  No competitor — Snap Map shows live, IG shows tagged places —   ║
// ║  Cirkle shows the historical AR layer of human memory.           ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useMemo, useState } from "react"
import { apiGet, type LensPin } from "@/lib/api"
import { Compass, MapPin, Camera, Loader2, Sparkles, Globe2 } from "lucide-react"
import { motion } from "framer-motion"

const CITIES = ["Riyadh", "Cairo", "Dubai", "Istanbul", "Mecca", "Jeddah", "*"]

export function RealityLens() {
  const [city, setCity] = useState<string>("Cairo")
  const [pins, setPins] = useState<LensPin[]>([])
  const [loading, setLoading] = useState(true)
  const [picked, setPicked] = useState<LensPin | null>(null)

  useEffect(() => {
    setLoading(true)
    apiGet<{ pins: LensPin[] }>(`/lens/${encodeURIComponent(city)}`)
      .then((r) => { setPins(r.pins ?? []); setPicked(null) })
      .catch(() => setPins([]))
      .finally(() => setLoading(false))
  }, [city])

  // Compute bbox so we can position pins on the canvas
  const bounds = useMemo(() => {
    if (pins.length === 0) return null
    const lats = pins.map(p => p.lat), lngs = pins.map(p => p.lng)
    return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) }
  }, [pins])

  const project = (p: LensPin) => {
    if (!bounds) return { x: 50, y: 50 }
    const dLat = bounds.maxLat - bounds.minLat || 1
    const dLng = bounds.maxLng - bounds.minLng || 1
    return {
      x: 6 + ((p.lng - bounds.minLng) / dLng) * 88,
      y: 6 + (1 - (p.lat - bounds.minLat) / dLat) * 88,
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl city-pulse-static grid place-items-center bg-secondary/15">
          <Camera className="w-4 h-4 text-secondary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base leading-tight">Reality Lens</h3>
          <p className="text-[11px] text-muted-foreground">
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
            Geo-anchored AR memory layer · Cirkle-unique
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 max-w-[55%]">
          {CITIES.map((c) => (
            <button key={c} onClick={() => setCity(c)}
              className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap border ${
                city === c ? "gold-stroke" : "border-border/40 hover:bg-muted/40"
              }`}>
              {c === "*" ? <span className="flex items-center gap-1"><Globe2 className="w-2.5 h-2.5" />All</span> : c}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-square sm:aspect-[2/1] w-full rounded-2xl border border-border/40 bg-card/60 backdrop-blur overflow-hidden">
        {/* Faint compass overlay */}
        <div className="absolute inset-3 rounded-2xl border border-border/30 pointer-events-none" />
        <Compass className="absolute top-3 right-3 w-4 h-4 text-muted-foreground/50" />
        <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-muted-foreground/70">
          {city === "*" ? "World" : city} · {pins.length} pin{pins.length === 1 ? "" : "s"}
        </div>

        {loading ? (
          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : pins.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground text-center px-6">
            <div>
              <MapPin className="w-5 h-5 mx-auto mb-2 opacity-60" />
              No pins captured here yet. Snap a Lamahat with location to start the layer.
            </div>
          </div>
        ) : (
          <>
            {pins.map((p) => {
              const { x, y } = project(p)
              const isPicked = picked?.id === p.id
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (p.id % 12) * 0.04 }}
                  onClick={() => setPicked(p)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <span className={`block w-2.5 h-2.5 rounded-full ${isPicked ? "bg-secondary ring-2 ring-secondary/40 scale-150" : "bg-primary"} transition`} />
                  {p.bearing != null && (
                    <span
                      className="absolute left-1/2 top-1/2 w-3 h-[2px] origin-left bg-primary/60"
                      style={{ transform: `translate(-1px, -1px) rotate(${p.bearing - 90}deg)` }}
                    />
                  )}
                </motion.button>
              )
            })}
          </>
        )}
      </div>

      {/* Selected pin info */}
      {picked && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur p-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 grid place-items-center shrink-0">
              <Camera className="w-4 h-4 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {picked.display_name ?? picked.handle ?? `User #${picked.user_id}`}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {picked.lat.toFixed(4)}, {picked.lng.toFixed(4)}
                </span>
              </div>
              {picked.caption && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{picked.caption}</p>}
              <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                {picked.bearing != null && <span><Compass className="w-2.5 h-2.5 inline mr-0.5" />{picked.bearing}°</span>}
                {picked.altitude != null && <span>{picked.altitude}m</span>}
                <span>{new Date(picked.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <p className="text-[10px] text-muted-foreground px-1">
        Pins carry GPS + compass bearing + altitude. AR overlay activates on phones with full sensors.
      </p>
    </div>
  )
}

export default RealityLens
