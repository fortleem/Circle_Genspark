// ╔══════════════════════════════════════════════════════════════════╗
// ║  AIConsents — Per-pillar AI training consent matrix (F16)        ║
// ║                                                                  ║
// ║  Cirkle-unique. No other platform lets you grant or revoke AI    ║
// ║  training consent at the pillar × tier level — on-device,        ║
// ║  federated, or cloud — independently. Default is on-device only. ║
// ║  Every toggle creates an audit trail. Withdrawal is instant.     ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { apiGet, apiPost, type AIConsent } from "@/lib/api"
import { Brain, Cpu, Network, Cloud, Check, Sparkles, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { getMe } from "@/lib/session"
const ME = getMe()

type Tier = "on_device" | "federated" | "cloud"

const PILLARS: { key: string; label: string; sub: string }[] = [
  { key: "wasl",    label: "Wasl",    sub: "Chat smart-reply, language model" },
  { key: "mashahd", label: "Mashahd", sub: "Auto-captions, recommendations" },
  { key: "lamahat", label: "Lamahat", sub: "Story moderation, hashtag suggest" },
  { key: "midan",   label: "Midan",   sub: "Spam filter, ranking" },
  { key: "madrasa", label: "Madrasa", sub: "Doc summarisation, search, attendance insights" },
  { key: "mail",    label: "Mail",    sub: "Inbox triage, draft assist" },
  { key: "pay",     label: "Pay",     sub: "Fraud detection only" },
  { key: "rihla",   label: "Rihla",   sub: "Travel etiquette, translation" },
]

const TIERS: { key: Tier; label: string; sub: string; Icon: any }[] = [
  { key: "on_device", label: "On-device",  sub: "Stays on your hardware",       Icon: Cpu },
  { key: "federated", label: "Federated",  sub: "Encrypted gradients shared",   Icon: Network },
  { key: "cloud",     label: "Cloud",      sub: "Server-side fine-tune",         Icon: Cloud },
]

export function AIConsents() {
  const [map, setMap] = useState<Record<string, AIConsent>>({})
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<string | null>(null)

  const load = async () => {
    try {
      const r = await apiGet<{ consents: AIConsent[] }>(`/ai/consents/${ME}`)
      const m: Record<string, AIConsent> = {}
      ;(r.consents ?? []).forEach((c) => { m[c.pillar] = c })
      setMap(m)
    } catch { /* keep prior */ }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const valueOf = (pillar: string, tier: Tier): number => {
    const c = map[pillar]
    if (!c) {
      // Default: on-device on, others off — matches Cirkle's privacy-by-default ethos
      return tier === "on_device" ? 1 : 0
    }
    return c[tier] ?? 0
  }

  const toggle = async (pillar: string, tier: Tier) => {
    const next = valueOf(pillar, tier) ? 0 : 1
    const key = `${pillar}-${tier}`
    setPending(key)
    // Optimistic
    setMap((m) => ({
      ...m,
      [pillar]: {
        pillar,
        on_device: tier === "on_device" ? next : (m[pillar]?.on_device ?? (pillar in m ? 0 : 1)),
        federated: tier === "federated" ? next : (m[pillar]?.federated ?? 0),
        cloud: tier === "cloud" ? next : (m[pillar]?.cloud ?? 0),
        updated_at: new Date().toISOString(),
      },
    }))
    try {
      await apiPost(`/ai/consents/${ME}`, { pillar, [tier]: next })
      toast.success(next ? `${labelOf(pillar)} · ${tier.replace("_", "-")} granted` : `${labelOf(pillar)} · ${tier.replace("_", "-")} revoked`)
    } catch (e: any) {
      toast.error("Could not update", { description: e?.message })
      load()
    } finally { setPending(null) }
  }

  const granted = Object.values(map).reduce((acc, c) => acc + (c.on_device || 0) + (c.federated || 0) + (c.cloud || 0), 0)
  const possible = PILLARS.length * 3
  // Add defaults for un-touched pillars (on_device = 1)
  const defaultGrants = PILLARS.filter(p => !map[p.key]).length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl mesh-fill grid place-items-center">
          <Brain className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-base leading-tight">AI Consent Matrix</h3>
          <p className="text-[11px] text-muted-foreground">
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
            Per-pillar, per-tier · privacy-by-default
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border/40 p-3 bg-card/60 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Active grants</div>
          <div className="font-display text-lg">{granted + defaultGrants}<span className="text-muted-foreground/60 text-xs">/{possible}</span></div>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden flex-1 max-w-[180px]">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${((granted + defaultGrants) / possible) * 100}%` }} transition={{ duration: 0.7 }}
            className="h-full mesh-fill"
          />
        </div>
        <button
          onClick={async () => {
            // Revoke everything beyond on-device
            for (const p of PILLARS) {
              try { await apiPost(`/ai/consents/${ME}`, { pillar: p.key, on_device: 1, federated: 0, cloud: 0 }) } catch {}
            }
            toast.success("Reset to privacy-by-default")
            load()
          }}
          className="text-[10px] px-2.5 py-1 rounded-full glass border border-border/40 whitespace-nowrap"
        >
          Reset defaults
        </button>
      </div>

      {/* Tier header */}
      <div className="grid grid-cols-[1fr_repeat(3,minmax(0,72px))] gap-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <div>Pillar</div>
        {TIERS.map((t) => (
          <div key={t.key} className="text-center flex flex-col items-center gap-0.5">
            <t.Icon className="w-3 h-3" /> {t.label}
          </div>
        ))}
      </div>

      {/* Matrix rows */}
      {loading ? (
        <div className="rounded-2xl border border-border/40 p-6 text-center text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 mx-auto mb-2 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="rounded-2xl bg-card/60 border border-border/40 divide-y divide-border/30 overflow-hidden">
          {PILLARS.map((p) => (
            <div key={p.key} className="grid grid-cols-[1fr_repeat(3,minmax(0,72px))] gap-2 items-center px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-[10px] text-muted-foreground truncate">{p.sub}</div>
              </div>
              {TIERS.map((t) => {
                const on = valueOf(p.key, t.key) === 1
                const isPending = pending === `${p.key}-${t.key}`
                return (
                  <button
                    key={t.key}
                    onClick={() => toggle(p.key, t.key)}
                    disabled={isPending}
                    className={`mx-auto w-12 h-7 rounded-full relative transition ${
                      on ? "mesh-fill" : "bg-muted"
                    }`}
                    title={`${p.label} · ${t.label}: ${on ? "Granted" : "Denied"}`}
                  >
                    <motion.span
                      animate={{ x: on ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`absolute top-1 w-5 h-5 rounded-full grid place-items-center shadow ${
                        on ? "bg-primary-foreground" : "bg-foreground"
                      }`}
                    >
                      {isPending ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin opacity-70" />
                      ) : on ? (
                        <Check className="w-2.5 h-2.5 text-primary" />
                      ) : null}
                    </motion.span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground px-1">
        On-device learning never leaves your hardware. Federated shares only encrypted gradients. Cloud requires explicit opt-in per pillar.
      </p>
    </div>
  )
}

function labelOf(pillar: string) {
  return PILLARS.find(p => p.key === pillar)?.label ?? pillar
}

export default AIConsents
