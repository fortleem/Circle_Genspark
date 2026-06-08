// ╔══════════════════════════════════════════════════════════════════╗
// ║  ItineraryBuilder — On-device AI trip planner (Rihla)            ║
// ║                                                                  ║
// ║  Heuristic, locally-computed itinerary generator. No API key, no ║
// ║  cloud round-trip. Suggestions weight: morning culture, midday   ║
// ║  food, afternoon souks, evening rooftop. User can shuffle.       ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useMemo, useState } from "react"
import { Sparkles, Coffee, Camera, Utensils, ShoppingBag, Wine, Moon, Sun, Loader2, RefreshCw, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const POI_LIBRARY: Record<string, Array<{ name: string; slot: Slot; tag: string }>> = {
  Istanbul: [
    { name: "Hagia Sophia at first light", slot: "morning",   tag: "culture" },
    { name: "Turkish breakfast in Karaköy", slot: "midday",    tag: "food" },
    { name: "Grand Bazaar treasure hunt",   slot: "afternoon", tag: "shop" },
    { name: "Sultanahmet sunset rooftop",   slot: "evening",   tag: "view" },
    { name: "Topkapi Palace courtyards",    slot: "morning",   tag: "culture" },
    { name: "Galata fish sandwich",         slot: "midday",    tag: "food" },
    { name: "Çukurcuma antique lanes",      slot: "afternoon", tag: "shop" },
    { name: "Bosphorus night ferry",        slot: "evening",   tag: "view" },
  ],
  Cairo: [
    { name: "Giza pyramids sunrise",        slot: "morning",   tag: "culture" },
    { name: "Khan el-Khalili tea house",    slot: "midday",    tag: "food" },
    { name: "Coptic Cairo old churches",    slot: "afternoon", tag: "culture" },
    { name: "Nile felucca at dusk",         slot: "evening",   tag: "view" },
    { name: "Egyptian Museum new wing",     slot: "morning",   tag: "culture" },
    { name: "Koshary at Abou Tarek",        slot: "midday",    tag: "food" },
    { name: "Wekalat al-Ghouri craft yard", slot: "afternoon", tag: "shop" },
    { name: "Al-Azhar Park city lights",    slot: "evening",   tag: "view" },
  ],
  Mecca: [
    { name: "Fajr at the Holy Mosque",      slot: "morning",   tag: "spiritual" },
    { name: "Date palm market breakfast",   slot: "midday",    tag: "food" },
    { name: "Jabal al-Nour reflection walk",slot: "afternoon", tag: "spiritual" },
    { name: "Maghrib at the Kaaba",         slot: "evening",   tag: "spiritual" },
  ],
  Tokyo: [
    { name: "Tsukiji outer market",         slot: "morning",   tag: "food" },
    { name: "Asakusa Sensō-ji visit",       slot: "midday",    tag: "culture" },
    { name: "Akihabara electronics dive",   slot: "afternoon", tag: "shop" },
    { name: "Shibuya neon crossing",        slot: "evening",   tag: "view" },
  ],
  Marrakech: [
    { name: "Bahia Palace mosaics",         slot: "morning",   tag: "culture" },
    { name: "Tagine in the medina",         slot: "midday",    tag: "food" },
    { name: "Souk leather & spice walk",    slot: "afternoon", tag: "shop" },
    { name: "Jemaa el-Fnaa drums by night", slot: "evening",   tag: "view" },
  ],
  AlUla: [
    { name: "Hegra rock-cut tombs",         slot: "morning",   tag: "culture" },
    { name: "Maraya mirror palace lunch",   slot: "midday",    tag: "food" },
    { name: "Elephant Rock hike",           slot: "afternoon", tag: "culture" },
    { name: "Stargazing in the desert",     slot: "evening",   tag: "view" },
  ],
}

type Slot = "morning" | "midday" | "afternoon" | "evening"
const SLOT_META: Record<Slot, { label: string; Icon: any; hint: string }> = {
  morning:   { label: "Morning",   Icon: Sun,      hint: "06:00 – 11:00" },
  midday:    { label: "Midday",    Icon: Coffee,   hint: "11:00 – 14:00" },
  afternoon: { label: "Afternoon", Icon: Camera,   hint: "14:00 – 18:00" },
  evening:   { label: "Evening",   Icon: Moon,     hint: "18:00 – 23:00" },
}
const TAG_ICON: Record<string, any> = {
  culture: Camera, food: Utensils, shop: ShoppingBag, view: Wine, spiritual: Sun,
}

type Day = { day: number; slots: Record<Slot, string> }

function buildItinerary(city: string, days: number, seed: number): Day[] {
  const pois = POI_LIBRARY[city] ?? POI_LIBRARY["Istanbul"]
  const slots: Slot[] = ["morning", "midday", "afternoon", "evening"]
  const out: Day[] = []
  let cursor = seed
  for (let d = 0; d < days; d++) {
    const day: Day = { day: d + 1, slots: {} as any }
    for (const s of slots) {
      const candidates = pois.filter((p) => p.slot === s)
      const pick = candidates[cursor % Math.max(1, candidates.length)] ?? candidates[0]
      day.slots[s] = pick?.name ?? "Free time"
      cursor = (cursor * 9301 + 49297) % 233280 // LCG so we deterministically rotate
    }
    out.push(day)
  }
  return out
}

const CITIES = Object.keys(POI_LIBRARY)

export function ItineraryBuilder() {
  const [city, setCity] = useState<string>("Istanbul")
  const [days, setDays] = useState(3)
  const [seed, setSeed] = useState(1)
  const [building, setBuilding] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const itinerary = useMemo(() => buildItinerary(city, days, seed), [city, days, seed])

  const generate = async () => {
    setBuilding(true)
    setRevealed(false)
    await new Promise((r) => setTimeout(r, 650))   // theatrical pause — "AI is thinking"
    setSeed((s) => s + 1)
    setBuilding(false)
    setRevealed(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl mesh-fill grid place-items-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-base leading-tight">AI Itinerary</h3>
          <p className="text-[11px] text-muted-foreground">
            On-device · no API key · no data leaves your phone
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
        {CITIES.map((c) => (
          <button key={c} onClick={() => { setCity(c); setRevealed(false) }}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap border ${
              city === c ? "gold-stroke" : "border-border/40 hover:bg-muted/40"
            }`}>
            <MapPin className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />{c}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Days</label>
        <input type="range" min={1} max={7} value={days}
          onChange={(e) => { setDays(Number(e.target.value)); setRevealed(false) }}
          className="flex-1 accent-secondary" />
        <span className="font-display text-lg w-6 text-center">{days}</span>
      </div>

      <button onClick={generate} disabled={building}
        className={`w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 ${
          building ? "bg-muted text-muted-foreground" : "gold-stroke"
        }`}>
        {building ? <><Loader2 className="w-4 h-4 animate-spin" /> Building…</>
                  : revealed
                    ? <><RefreshCw className="w-4 h-4" /> Reshuffle</>
                    : <><Sparkles className="w-4 h-4" /> Build with AI</>}
      </button>

      {/* Result */}
      <AnimatePresence>
        {revealed && !building && (
          <motion.div key={seed} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-2">
            {itinerary.map((d) => (
              <motion.div key={d.day}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (d.day - 1) * 0.08 }}
                className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur p-3">
                <div className="text-[10px] uppercase tracking-widest text-secondary mb-2">Day {d.day}</div>
                <div className="space-y-1.5">
                  {(Object.entries(d.slots) as [Slot, string][]).map(([slot, item]) => {
                    const meta = SLOT_META[slot]
                    return (
                      <div key={slot} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-muted/40 grid place-items-center shrink-0">
                          <meta.Icon className="w-3.5 h-3.5 text-secondary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{meta.label}<span className="ml-1.5 opacity-60">· {meta.hint}</span></div>
                          <div className="text-sm font-medium truncate">{item}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ItineraryBuilder
