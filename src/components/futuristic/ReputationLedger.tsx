// ╔══════════════════════════════════════════════════════════════════╗
// ║  ReputationLedger — Quadratic-voting power viz (§29)             ║
// ║                                                                  ║
// ║  Circle-unique. Shows your reputation tokens (RT) per pillar,    ║
// ║  the quadratic cost of casting N votes, and your delegation map. ║
// ║  Tokens are non-transferable, decay on inactivity, mint on       ║
// ║  positive moderation outcomes. No platform exposes governance    ║
// ║  weight this transparently.                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useMemo, useState } from "react"
import { Award, ChevronUp, Hash, MessageCircle, Play, Image as ImageIcon, Plane, Wallet, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

// Deterministic per-user reputation. Real impl: SELECT FROM rep_tokens.
const STARTING_REP: Record<string, number> = {
  wasl: 312, mashahd: 88, lamahat: 145, midan: 421,
  rihla: 27, pay: 64,
}

const PILLAR_META: Record<string, { label: string; Icon: any; tint: string }> = {
  wasl:    { label: "Wasl",    Icon: MessageCircle, tint: "text-secondary" },
  mashahd: { label: "Mashahd", Icon: Play,          tint: "text-primary" },
  lamahat: { label: "Lamahat", Icon: ImageIcon,     tint: "text-secondary" },
  midan:   { label: "Midan",   Icon: Hash,          tint: "text-primary" },
  rihla:   { label: "Rihla",   Icon: Plane,         tint: "text-secondary" },
  pay:     { label: "Pay",     Icon: Wallet,        tint: "text-primary" },
}

export function ReputationLedger() {
  const [rep] = useState<Record<string, number>>(STARTING_REP)
  const [pickedPillar, setPickedPillar] = useState<string>("midan")
  const [votes, setVotes] = useState(1)

  const total = useMemo(() => Object.values(rep).reduce((a, b) => a + b, 0), [rep])
  const balance = rep[pickedPillar] ?? 0
  // Quadratic cost: N² tokens to cast N votes
  const cost = votes * votes
  const canAfford = cost <= balance
  const maxAffordable = Math.floor(Math.sqrt(balance))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gold-stroke grid place-items-center">
          <Award className="w-4 h-4 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base leading-tight">Reputation Ledger</h3>
          <p className="text-[11px] text-muted-foreground">
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
            Quadratic voting power · Circle-unique
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl gradient-text-gold leading-none">{total.toLocaleString()}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total RT</div>
        </div>
      </div>

      {/* Pillar bars */}
      <div className="space-y-1.5">
        {Object.entries(rep).map(([k, v]) => {
          const meta = PILLAR_META[k]
          const pct = (v / Math.max(...Object.values(rep))) * 100
          const active = pickedPillar === k
          return (
            <button key={k} onClick={() => setPickedPillar(k)}
              className={`w-full px-3 py-2 rounded-xl border transition flex items-center gap-3 ${
                active ? "border-secondary/40 bg-secondary/5" : "border-border/40 hover:bg-muted/40"
              }`}>
              <meta.Icon className={`w-3.5 h-3.5 ${meta.tint} shrink-0`} />
              <span className="text-xs font-medium w-16 shrink-0 text-left">{meta.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                  className={`h-full ${active ? "mesh-fill" : "bg-gradient-to-r from-secondary/50 to-primary/50"}`} />
              </div>
              <span className="text-xs font-mono w-12 text-right">{v}</span>
            </button>
          )
        })}
      </div>

      {/* Vote simulator */}
      <div className="rounded-2xl border border-border/40 p-4 bg-card/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span className="text-xs font-medium">Cast N votes in {PILLAR_META[pickedPillar].label}</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Quadratic cost
          </div>
        </div>

        <input type="range" min={1} max={Math.max(1, maxAffordable + 2)} value={votes}
          onChange={(e) => setVotes(Number(e.target.value))}
          className="w-full accent-secondary" />

        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Cell label="Votes" value={`${votes}`} tone="neutral" />
          <Cell label="Cost (RT)" value={`${cost}`} tone={canAfford ? "good" : "bad"} icon={<ChevronUp className="w-3 h-3 inline" />} />
          <Cell label="Balance after" value={`${balance - (canAfford ? cost : 0)}`} tone={canAfford ? "good" : "bad"} />
        </div>

        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          {canAfford
            ? `Costs ${votes}² = ${cost} RT. You can cast up to ${maxAffordable} votes with ${balance} RT.`
            : `Insufficient RT. Max affordable: ${maxAffordable} votes (${maxAffordable * maxAffordable} RT).`}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground px-1">
        RT are non-transferable · decay 0.5%/week on inactivity · mint on positive moderation outcomes & verified contributions.
      </p>
    </div>
  )
}

function Cell({ label, value, tone, icon }: { label: string; value: string; tone: "good" | "bad" | "neutral"; icon?: any }) {
  const color = tone === "good" ? "text-secondary" : tone === "bad" ? "text-destructive" : "text-foreground"
  return (
    <div className="rounded-xl bg-muted/40 p-2">
      <div className={`font-display text-base ${color} leading-tight`}>
        {value}{icon}
      </div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}

export default ReputationLedger
