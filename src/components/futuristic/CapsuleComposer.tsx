// ╔══════════════════════════════════════════════════════════════════╗
// ║  CapsuleComposer — Time-Capsule post composer (Circle-unique F4) ║
// ║                                                                  ║
// ║  Write a message NOW that becomes visible at a chosen future     ║
// ║  date. Server stamps it with a SHA-256 anchor hash at seal time, ║
// ║  proving the content existed before it was unsealed. No other    ║
// ║  social network has provable-time future-release posts.          ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useState } from "react"
import { apiPost } from "@/lib/api"
import { Hourglass, Lock, Sparkles, X, Calendar } from "lucide-react"
import { toast } from "sonner"

const ME = 1

const PRESETS: { k: string; label: string; days: number }[] = [
  { k: '1d',  label: 'Tomorrow',   days: 1 },
  { k: '7d',  label: '1 week',     days: 7 },
  { k: '30d', label: '1 month',    days: 30 },
  { k: '1y',  label: '1 year',     days: 365 },
  { k: '5y',  label: '5 years',    days: 365 * 5 },
]

export function CapsuleComposer({ onClose }: { onClose: () => void }) {
  const [payload, setPayload] = useState('')
  const [days, setDays] = useState(30)
  const [visibility, setVisibility] = useState<'public'|'self'>('public')
  const [sealing, setSealing] = useState(false)
  const [sealed, setSealed] = useState<{ anchor: string; date: string } | null>(null)

  const unsealDate = new Date(Date.now() + days * 86400_000)
  const unsealStr = unsealDate.toISOString().slice(0, 19).replace('T', ' ')

  const seal = async () => {
    if (!payload.trim()) return
    setSealing(true)
    try {
      const r = await apiPost<{ ok: boolean; anchor_hash: string }>('/capsules', {
        author_id: ME, pillar: 'midan', payload, unseal_at: unsealStr, visibility,
      })
      if (r.ok) {
        setSealed({ anchor: r.anchor_hash, date: unsealDate.toLocaleDateString() })
        toast.success('Time-capsule sealed', { description: `Will unseal on ${unsealDate.toLocaleDateString()}` })
        setPayload('')
      }
    } catch (e: any) {
      toast.error('Seal failed', { description: e?.message })
    } finally {
      setSealing(false)
    }
  }

  return (
    <div className="orbit-ring rounded-2xl p-4 bg-card/80 backdrop-blur space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full mesh-fill grid place-items-center">
            <Hourglass className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Time Capsule</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sealed today · unseals later</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      {sealed ? (
        <div className="space-y-2 py-3">
          <div className="flex items-center gap-2 text-emerald-500">
            <Lock className="w-4 h-4" />
            <span className="font-semibold text-sm">Sealed.</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Your capsule is locked. Anchor hash:
          </div>
          <div className="font-mono text-[10px] bg-muted/50 rounded p-2 break-all">{sealed.anchor}</div>
          <div className="text-xs">
            Will appear publicly on <span className="font-semibold text-foreground">{sealed.date}</span>.
          </div>
          <button onClick={() => setSealed(null)} className="w-full mt-2 gold-stroke px-3 py-2 text-xs rounded-lg hover:bg-primary/10">
            Seal another
          </button>
        </div>
      ) : (
        <>
          <textarea
            value={payload}
            onChange={e => setPayload(e.target.value)}
            placeholder="Write something for your future self, or the public… (this will be sealed and only readable after the unseal date)"
            rows={4}
            className="w-full bg-muted/40 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p.k}
                onClick={() => setDays(p.days)}
                className={`text-[10px] px-2.5 py-1 rounded-full transition ${
                  days === p.days ? 'gold-stroke bg-primary/15 font-semibold' : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Unseals on {unsealDate.toLocaleDateString()} · {unsealDate.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-muted-foreground uppercase tracking-wider">Visibility:</span>
            {(['public','self'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`px-2 py-0.5 rounded-full ${visibility === v ? 'gold-stroke bg-primary/15 font-semibold' : 'bg-muted/40 hover:bg-muted'}`}
              >
                {v === 'public' ? 'Public' : 'Just me'}
              </button>
            ))}
          </div>
          <button
            onClick={seal}
            disabled={!payload.trim() || sealing}
            className="w-full gold-stroke bg-primary/15 hover:bg-primary/25 disabled:opacity-40 px-3 py-2.5 text-sm rounded-lg flex items-center justify-center gap-2 font-semibold"
          >
            {sealing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {sealing ? 'Sealing…' : 'Seal capsule'}
          </button>
        </>
      )}
    </div>
  )
}
