// ╔══════════════════════════════════════════════════════════════════╗
// ║  SmartRouter — Heuristic post-routing suggestion (F9)            ║
// ║                                                                  ║
// ║  As you type, Cirkle figures out which pillar this belongs in.   ║
// ║  Long message + question mark? Probably a chat — suggest Wasl.   ║
// ║  URL + emoji? Probably a story — suggest Lamahat.                ║
// ║  Multi-line + sources? Maybe an article — suggest Channel.       ║
// ║                                                                  ║
// ║  No other social app routes your thought to the RIGHT pillar.    ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useMemo } from "react"
import { ArrowRight, Sparkles, MessageSquare, Image as ImageIcon, Mail, Megaphone } from "lucide-react"

type Suggestion = { pillar: string; reason: string; Icon: any; route: string }

function suggest(text: string): Suggestion | null {
  const t = text.trim()
  if (t.length < 16) return null

  const hasUrl = /https?:\/\/|ipfs:\/\//i.test(t)
  const hasQuestion = /\?$/.test(t)
  const hasDirectAddress = /^(@|hey |hi |to )/i.test(t)
  const longForm = t.length > 320
  const newlines = (t.match(/\n/g) ?? []).length
  const isCode = /```|\bfunction\b|\bclass\b|=>/.test(t)

  if (hasDirectAddress || hasQuestion && t.length < 140) {
    return { pillar: 'Wasl', reason: 'Looks like a direct conversation — send it to a chat instead.', Icon: MessageSquare, route: '/wasl' }
  }
  if (longForm && newlines > 2) {
    return { pillar: 'Channel', reason: 'This reads like an article — publish to a channel for proper attribution.', Icon: Megaphone, route: '/channels' }
  }
  if (hasUrl && t.length < 200) {
    return { pillar: 'Lamahat', reason: 'A link with a short note works better as a Lamahat moment.', Icon: ImageIcon, route: '/lamahat' }
  }
  if (isCode) {
    return { pillar: 'Mail', reason: 'Code is easier to read in mail — send it to a recipient.', Icon: Mail, route: '/mail' }
  }
  return null
}

export function SmartRouter({ text }: { text: string }) {
  const s = useMemo(() => suggest(text), [text])
  if (!s) return null

  return (
    <div className="orbit-ring rounded-xl bg-card/60 backdrop-blur px-3 py-2 flex items-center gap-2 mt-2 text-[11px] animate-in fade-in slide-in-from-top-1">
      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
      <div className="flex-1 leading-snug text-muted-foreground">
        <span className="text-foreground font-semibold">Smart router:</span> {s.reason}
      </div>
      <a
        href={s.route}
        className="gold-stroke whitespace-nowrap flex items-center gap-1 text-[10px] px-2 py-1 rounded-full hover:bg-primary/15 transition"
      >
        <s.Icon className="w-3 h-3" /> {s.pillar}
        <ArrowRight className="w-2.5 h-2.5" />
      </a>
    </div>
  )
}
