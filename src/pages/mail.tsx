// Circle Mail — free @circle.app email (Mailcow-backed). Blueprint §22.
import type { Context } from 'hono'
import { all, type Env, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function mailPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const folder = c.req.query('folder') ?? 'inbox'
  const userId = 1
  const messages = await all(c.env.DB,
    'SELECT * FROM mail_messages WHERE user_id = ? AND folder = ? ORDER BY created_at DESC',
    userId, folder)

  return c.render(
    <div class="fade-in space-y-6">
      <header class="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 class="font-display text-3xl text-ink">{n.module_mail}</h1>
          <p class="text-sm text-charcoal/70">Free @circle.app · 5 GB · IMAP/POP3 compatible · Anti-spam by Rspamd</p>
        </div>
        <button class="bg-ink text-gold px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <i class="fas fa-pen-to-square"></i> Compose
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
        <aside class="pillar-card p-3">
          <ul class="space-y-1 text-sm">
            {[
              { f: 'inbox',   icon: 'fa-inbox',   label: 'Inbox' },
              { f: 'sent',    icon: 'fa-paper-plane', label: 'Sent' },
              { f: 'drafts',  icon: 'fa-file-pen', label: 'Drafts' },
              { f: 'spam',    icon: 'fa-shield-virus', label: 'Spam' }
            ].map(item => (
              <li>
                <a href={`/mail?folder=${item.f}`}
                   class={`flex items-center gap-2 px-3 py-2 rounded-lg ${folder === item.f ? 'bg-gold/20 text-goldDark font-semibold' : 'hover:bg-gold/10 text-ink'}`}>
                  <i class={`fas ${item.icon} text-gold w-4 text-center`}></i> {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <section class="pillar-card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-gold/15 bg-cream/60 text-xs uppercase tracking-widest text-charcoal/60">
            {folder} · {messages.length} messages
          </div>
          <ul class="divide-y divide-gold/10">
            {messages.map((m: any) => (
              <li class={`flex items-start gap-3 px-4 py-3 hover:bg-gold/5 ${m.read_flag ? '' : 'bg-cream/60'}`}>
                <span class={`w-2 h-2 mt-2 rounded-full ${m.read_flag ? 'bg-transparent' : 'bg-gold'}`}></span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm text-ink truncate">{m.from_addr}</span>
                    <span class="text-[10px] text-charcoal/50">→ {m.to_addr}</span>
                    <span class="ml-auto text-[11px] text-charcoal/60">{timeAgo(m.created_at)}</span>
                  </div>
                  <div class="text-sm text-ink">{m.subject}</div>
                  <div class="text-xs text-charcoal/60 truncate">{m.body}</div>
                </div>
              </li>
            ))}
            {messages.length === 0 && <li class="px-4 py-12 text-center text-sm text-charcoal/50">Folder is empty</li>}
          </ul>
        </section>
      </div>
    </div>,
    { title: n.module_mail, lang, country, active: 'mail' }
  )
}
