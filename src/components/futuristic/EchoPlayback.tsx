// ╔══════════════════════════════════════════════════════════════════╗
// ║  EchoPlayback — AI-summarized conversation timeline (F7)         ║
// ║                                                                  ║
// ║  Long room? Scrub through Echoes — AI-summarized spans with      ║
// ║  sentiment color and key-actor avatars. Click an echo to jump    ║
// ║  to that span. NO other messenger has temporal AI playback.      ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { apiGet, type Echo } from "@/lib/api"
import { Sparkles, Smile, Frown, Flame, PartyPopper } from "lucide-react"

const SENTIMENT_META: Record<string, { color: string; Icon: any }> = {
  positive:    { color: 'from-emerald-500/40 to-emerald-500/10', Icon: Smile },
  celebratory: { color: 'from-amber-500/40 to-amber-500/10',     Icon: PartyPopper },
  tense:       { color: 'from-rose-500/40 to-rose-500/10',       Icon: Flame },
  neutral:     { color: 'from-zinc-500/40 to-zinc-500/10',       Icon: Frown },
}

export function EchoPlayback({ roomId, onJump }: { roomId: string; onJump?: (msgId: number) => void }) {
  const [echoes, setEchoes] = useState<Echo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return
    setLoading(true)
    apiGet<{ echoes: Echo[] }>(`/echoes/${encodeURIComponent(roomId)}`)
      .then(r => setEchoes(r.echoes ?? []))
      .catch(() => setEchoes([]))
      .finally(() => setLoading(false))
  }, [roomId])

  if (loading) return null
  if (echoes.length === 0) return null

  return (
    <div className="px-3 py-2 border-b border-border/30 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary mb-1.5">
        <Sparkles className="w-3 h-3" />
        Echo Playback · {echoes.length} summarized spans
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {echoes.map(e => {
          const meta = SENTIMENT_META[e.sentiment] ?? SENTIMENT_META.neutral
          return (
            <button
              key={e.id}
              onClick={() => onJump?.(e.span_start ?? 0)}
              className={`relative shrink-0 max-w-[280px] text-start orbit-ring rounded-xl p-2.5 bg-gradient-to-br ${meta.color} hover:scale-[1.02] transition`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <meta.Icon className="w-3 h-3 text-foreground/80" />
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {e.sentiment} · msgs {e.span_start}–{e.span_end}
                </span>
              </div>
              <div className="text-[11px] leading-snug line-clamp-3">{e.summary}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
