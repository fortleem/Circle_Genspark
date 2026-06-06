// ╔══════════════════════════════════════════════════════════════════╗
// ║  WhisperComposer — Self-destruct messages (Circle-unique F5)     ║
// ║                                                                  ║
// ║  Send a message that burns itself after N seconds of being seen, ║
// ║  or after M views. Snapchat-class ephemerality, but anchored to  ║
// ║  the recipient's mesh identity and cryptographically auditable.  ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useState } from "react"
import { apiPost } from "@/lib/api"
import { Flame, Eye, Clock, X, Send } from "lucide-react"
import { toast } from "sonner"

const ME = 1

const TTL_PRESETS = [10, 30, 60, 300]      // seconds
const VIEW_PRESETS = [1, 3, 5]              // max views

export function WhisperComposer({ onClose, defaultRecipient }: { onClose: () => void; defaultRecipient?: number }) {
  const [body, setBody] = useState('')
  const [to, setTo] = useState<string>(defaultRecipient ? String(defaultRecipient) : '')
  const [ttl, setTtl] = useState(60)
  const [maxViews, setMaxViews] = useState(1)
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!body.trim() || !to.trim()) return
    setSending(true)
    try {
      const r = await apiPost<{ ok: boolean }>('/whispers', {
        from_user: ME,
        to_user: Number(to),
        body,
        ttl_seconds: ttl,
        max_views: maxViews,
      })
      if (r.ok) {
        toast.success('Whisper sent', { description: `Burns in ${ttl}s after first view` })
        setBody('')
        onClose()
      }
    } catch (e: any) {
      toast.error('Whisper failed', { description: e?.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="orbit-ring rounded-2xl p-4 bg-card/80 backdrop-blur space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 grid place-items-center animate-pulse">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Whisper</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Self-destructs after viewing</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Recipient (user id)</label>
        <input
          value={to}
          onChange={e => setTo(e.target.value)}
          placeholder="e.g. 2"
          className="w-full mt-1 bg-muted/40 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Whisper… this message will burn after the recipient sees it."
        rows={3}
        className="w-full bg-muted/40 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> TTL
        </span>
        {TTL_PRESETS.map(t => (
          <button
            key={t}
            onClick={() => setTtl(t)}
            className={`text-[10px] px-2.5 py-1 rounded-full transition ${
              ttl === t ? 'gold-stroke bg-primary/15 font-semibold' : 'bg-muted/40 hover:bg-muted text-muted-foreground'
            }`}
          >
            {t < 60 ? `${t}s` : `${t / 60}m`}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Eye className="w-3 h-3" /> Max views
        </span>
        {VIEW_PRESETS.map(v => (
          <button
            key={v}
            onClick={() => setMaxViews(v)}
            className={`text-[10px] px-2.5 py-1 rounded-full transition ${
              maxViews === v ? 'gold-stroke bg-primary/15 font-semibold' : 'bg-muted/40 hover:bg-muted text-muted-foreground'
            }`}
          >
            {v}×
          </button>
        ))}
      </div>

      <div className="text-[10px] text-muted-foreground italic">
        Recipient can read this {maxViews} time{maxViews > 1 ? 's' : ''}, and the message dies {ttl}s after first view.
      </div>

      <button
        onClick={send}
        disabled={!body.trim() || !to.trim() || sending}
        className="w-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 hover:from-rose-500/30 hover:to-orange-500/30 border border-rose-500/40 disabled:opacity-40 px-3 py-2.5 text-sm rounded-lg flex items-center justify-center gap-2 font-semibold"
      >
        {sending ? <Flame className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
        {sending ? 'Igniting…' : 'Send whisper'}
      </button>
    </div>
  )
}
