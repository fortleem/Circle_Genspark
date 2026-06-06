// ╔══════════════════════════════════════════════════════════════════╗
// ║  CulturalInterpreter — Tipping & etiquette guide (F11)           ║
// ║                                                                  ║
// ║  When you land in a new city, Circle teaches you the unwritten   ║
// ║  rules: tipping norms, greetings, taboos, dress codes.           ║
// ║  No travel app does this beyond price comparison.                ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe2, Coffee, Handshake, Shirt, AlertTriangle, ChevronDown } from "lucide-react"

type CulturalProfile = {
  city: string
  greeting: string
  tip: { restaurants: string; taxi: string; hotel: string }
  dress: string
  taboo: string
  emoji: string
}

const PROFILES: Record<string, CulturalProfile> = {
  Cairo: {
    city: 'Cairo',
    greeting: 'As-salāmu ʿalaykum / Merhaba — handshake with right hand only',
    tip: { restaurants: '10–12% (rarely on bill)', taxi: 'Round up', hotel: 'EGP 20–30 per bag' },
    dress: 'Modest in old city; western OK in Zamalek/Maadi',
    taboo: 'Decline coffee/tea twice politely before accepting (custom)',
    emoji: '🇪🇬',
  },
  Beirut: {
    city: 'Beirut',
    greeting: 'Marhaba / Kifak — kiss on both cheeks among friends',
    tip: { restaurants: 'Service usually included; round up', taxi: 'Round up to nearest 5,000 LL', hotel: 'USD 2–3 per bag' },
    dress: 'Cosmopolitan; very flexible',
    taboo: 'Never refuse food at someone\'s home — taste at least once',
    emoji: '🇱🇧',
  },
  Tokyo: {
    city: 'Tokyo',
    greeting: 'Konnichiwa with a slight bow — no handshake unless offered',
    tip: { restaurants: 'NO TIP — refusing tip is normal', taxi: 'NO TIP', hotel: 'Only at ryokan in envelope (kokorozuke)' },
    dress: 'Smart casual; cover tattoos at onsen/temples',
    taboo: 'Do not stick chopsticks vertically in rice (funeral symbol)',
    emoji: '🇯🇵',
  },
  Riyadh: {
    city: 'Riyadh',
    greeting: 'As-salāmu ʿalaykum — wait for woman to extend hand first',
    tip: { restaurants: '10% if not included', taxi: 'Round up', hotel: 'SAR 10–20 per bag' },
    dress: 'Cover shoulders/knees in public; abaya optional for women',
    taboo: 'Public displays of affection; eat/drink in daylight during Ramadan',
    emoji: '🇸🇦',
  },
  Istanbul: {
    city: 'Istanbul',
    greeting: 'Merhaba — light handshake; men touch right hand to chest',
    tip: { restaurants: '10% (bahşiş)', taxi: 'Round up', hotel: '20–50 TRY per bag' },
    dress: 'Cover head/shoulders in mosques (scarves provided)',
    taboo: 'Avoid pointing soles of feet at others',
    emoji: '🇹🇷',
  },
}

export function CulturalInterpreter({ defaultCity = 'Cairo' }: { defaultCity?: string }) {
  const [city, setCity] = useState(defaultCity)
  const [open, setOpen] = useState(true)
  const profile = PROFILES[city] ?? PROFILES.Cairo

  return (
    <div className="orbit-ring rounded-2xl bg-card/70 backdrop-blur overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full mesh-fill grid place-items-center text-lg">{profile.emoji}</div>
          <div className="text-start">
            <div className="text-sm font-bold tracking-tight">Cultural Interpreter</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Local norms · {profile.city}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 pb-4 space-y-3">
              {/* city picker */}
              <div className="flex gap-1 flex-wrap">
                {Object.keys(PROFILES).map(c => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`text-[10px] px-2.5 py-1 rounded-full transition ${
                      city === c ? 'gold-stroke bg-primary/15 font-semibold' : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {PROFILES[c].emoji} {c}
                  </button>
                ))}
              </div>

              {/* facts */}
              <FactRow Icon={Handshake} title="Greeting" body={profile.greeting} />
              <FactRow Icon={Coffee} title="Tipping" body={`Restaurants: ${profile.tip.restaurants} · Taxi: ${profile.tip.taxi} · Hotel: ${profile.tip.hotel}`} />
              <FactRow Icon={Shirt} title="Dress code" body={profile.dress} />
              <FactRow Icon={AlertTriangle} title="Avoid" body={profile.taboo} tone="warning" />

              <div className="text-[10px] text-muted-foreground border-t border-border/30 pt-2 flex items-center gap-1">
                <Globe2 className="w-3 h-3" /> Compiled from open civic data · updated by local Circle members
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FactRow({ Icon, title, body, tone }: { Icon: any; title: string; body: string; tone?: 'warning' }) {
  return (
    <div className="flex items-start gap-2">
      <div className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 ${tone === 'warning' ? 'bg-rose-500/15 text-rose-500' : 'bg-primary/15 text-primary'}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="text-xs leading-snug">{body}</div>
      </div>
    </div>
  )
}
