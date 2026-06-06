// ╔══════════════════════════════════════════════════════════════════╗
// ║  ShareSheet — Cross-pillar Share-To handoff (Circle-unique)      ║
// ║                                                                  ║
// ║  Global event-driven sheet. ANY screen fires:                    ║
// ║    window.dispatchEvent(new CustomEvent('circle:share', {        ║
// ║      detail: { pillar: 'mashahd', id: 'v1', title: '...' }       ║
// ║    }))                                                            ║
// ║                                                                  ║
// ║  The sheet appears, user picks destination (Wasl room / Midan /  ║
// ║  Mail / external), and we POST /api/shares which fans out into   ║
// ║  the actual destination pillar.                                  ║
// ║                                                                  ║
// ║  No competitor has this: cross-network handoff is Circle-native. ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiGet, apiPost } from "@/lib/api"
import { Send, MessageSquare, Megaphone, Mail, Share2, X, Sparkles, Check } from "lucide-react"
import { toast } from "sonner"

type ShareSource = {
  pillar: 'mashahd' | 'lamahat' | 'midan' | 'wasl' | 'mail' | 'pay' | string
  id: string
  title?: string
  preview?: string
}

type Destination =
  | { kind: 'midan' }
  | { kind: 'wasl'; room_id: string; room_name: string }
  | { kind: 'mail'; to_addr: string }

const ME = 1

export function ShareSheet() {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState<ShareSource | null>(null)
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([])
  const [tab, setTab] = useState<'midan' | 'wasl' | 'mail'>('midan')
  const [waslRoom, setWaslRoom] = useState<string>('')
  const [mailAddr, setMailAddr] = useState<string>('')
  const [caption, setCaption] = useState('')
  const [sending, setSending] = useState(false)

  // Listen for global share events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ShareSource>).detail
      if (!detail) return
      setSource(detail)
      setCaption(detail.title ?? '')
      setTab('midan')
      setOpen(true)
    }
    window.addEventListener('circle:share', handler as EventListener)
    return () => window.removeEventListener('circle:share', handler as EventListener)
  }, [])

  // Load rooms on open
  useEffect(() => {
    if (!open) return
    apiGet<{ rooms: any[] }>(`/wasl/rooms`)
      .then(r => setRooms((r.rooms ?? []).map((x: any) => ({ id: x.id, name: x.name }))))
      .catch(() => setRooms([]))
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const submit = async () => {
    if (!source) return
    setSending(true)
    try {
      const payload: any = {
        from_user: ME,
        source_pillar: source.pillar,
        source_id: source.id,
        to_pillar: tab,
        caption,
      }
      if (tab === 'wasl') payload.to_target = waslRoom
      if (tab === 'mail') payload.to_target = mailAddr
      const res = await apiPost<{ ok: boolean; fanout?: string }>('/shares', payload)
      if (res.ok) {
        toast.success(`Shared to ${tab}`, { description: res.fanout === 'ok' ? 'Delivered' : 'Recorded' })
        setOpen(false)
      } else {
        toast.error('Share failed')
      }
    } catch (e: any) {
      toast.error('Share failed', { description: e?.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && source && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          {/* sheet */}
          <motion.div
            className="relative w-full sm:max-w-md orbit-ring mx-2 sm:mx-0 mb-2 sm:mb-0 bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {/* header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full mesh-fill grid place-items-center">
                  <Share2 className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight">Share across Circle</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {source.pillar} · {source.id}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* preview */}
            {source.title && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/30">
                <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                {source.title}
              </div>
            )}

            {/* tabs */}
            <div className="flex p-2 gap-1 border-b border-border/30">
              {([
                { k: 'midan', label: 'Midan', Icon: Megaphone, hint: 'Public square' },
                { k: 'wasl',  label: 'Wasl',  Icon: MessageSquare, hint: 'Direct / room' },
                { k: 'mail',  label: 'Mail',  Icon: Mail, hint: 'Encrypted mail' },
              ] as const).map(t => {
                const active = tab === t.k
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={`flex-1 px-2 py-2 rounded-lg flex flex-col items-center gap-0.5 text-[11px] transition ${
                      active ? 'gold-stroke bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <t.Icon className="w-4 h-4" />
                    <span className="font-semibold">{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* body */}
            <div className="p-4 space-y-3">
              {tab === 'wasl' && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Destination room</label>
                  <select
                    value={waslRoom}
                    onChange={e => setWaslRoom(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-muted text-sm border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">— pick a room —</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              )}

              {tab === 'mail' && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Recipient address</label>
                  <input
                    value={mailAddr}
                    onChange={e => setMailAddr(e.target.value)}
                    placeholder="someone@circle.network"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-muted text-sm border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Add a note {tab === 'midan' ? '(public)' : '(private)'}
                </label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  rows={3}
                  placeholder={tab === 'midan' ? 'Why this matters…' : 'A few words for context…'}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-muted text-sm border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* receipt strip */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  signed by you · anchored
                </span>
                <span className="font-mono">→ {tab}</span>
              </div>
            </div>

            {/* footer */}
            <div className="p-3 border-t border-border/40 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm rounded-lg hover:bg-muted"
              >Cancel</button>
              <button
                onClick={submit}
                disabled={sending || (tab === 'wasl' && !waslRoom) || (tab === 'mail' && !mailAddr)}
                className="flex-1 px-3 py-2 text-sm rounded-lg gold-stroke bg-primary/15 hover:bg-primary/25 disabled:opacity-40 flex items-center justify-center gap-2 font-semibold"
              >
                {sending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Send'}
                {!sending && <Check className="w-3 h-3 opacity-50" />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper for any screen to fire a share event
export function fireShare(detail: ShareSource) {
  window.dispatchEvent(new CustomEvent('circle:share', { detail }))
}
