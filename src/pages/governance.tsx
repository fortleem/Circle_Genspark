// Community Governance & Transparency. Blueprint §29.
import type { Context } from 'hono'
import { all, type Env, fmtCount, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function governancePage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const proposals = await all(c.env.DB, 'SELECT p.*, u.display_name AS proposer FROM governance_proposals p LEFT JOIN users u ON u.id=p.proposer_id ORDER BY p.status DESC, p.created_at DESC')

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.nav_governance}</h1>
        <p class="text-sm text-charcoal/70">DAO-style proposals · One Circle ID, one vote · Apache 2.0 forever</p>
      </header>

      <section class="space-y-3">
        {proposals.map((p: any) => {
          const total = p.votes_yes + p.votes_no
          const yesPct = total > 0 ? Math.round((p.votes_yes / total) * 100) : 0
          return (
            <article class="pillar-card p-5">
              <header class="flex items-start gap-3 mb-2">
                <span class={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${p.status === 'passed' ? 'bg-green-700 text-white' : p.status === 'rejected' ? 'bg-red-700 text-white' : 'bg-ink text-gold'}`}>
                  <i class={`fas ${p.status === 'passed' ? 'fa-check' : p.status === 'rejected' ? 'fa-xmark' : 'fa-vote-yea'}`}></i>
                </span>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-base text-ink">{p.title}</h3>
                  <div class="text-[11px] text-charcoal/60">Proposed by {p.proposer ?? 'community'} · {timeAgo(p.created_at)}</div>
                </div>
                <span class={`chip ${p.status === 'open' ? '' : p.status === 'passed' ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-red-800 border-red-300'}`}>{p.status}</span>
              </header>
              <p class="text-sm text-charcoal/80 leading-relaxed">{p.body}</p>

              <div class="mt-3">
                <div class="h-2 rounded-full bg-red-200 overflow-hidden">
                  <div class="h-full bg-green-600" style={`width:${yesPct}%`}></div>
                </div>
                <div class="flex justify-between text-[11px] mt-1 text-charcoal/70">
                  <span><i class="fas fa-thumbs-up text-green-700"></i> {fmtCount(p.votes_yes)} yes ({yesPct}%)</span>
                  <span><i class="fas fa-thumbs-down text-red-700"></i> {fmtCount(p.votes_no)} no</span>
                </div>
              </div>

              {p.status === 'open' && (
                <div class="flex gap-2 mt-4">
                  <button data-action="vote" data-id={p.id} data-vote="yes" class="flex-1 bg-green-700 text-white text-sm font-semibold py-2 rounded"><i class="fas fa-thumbs-up"></i> Vote Yes</button>
                  <button data-action="vote" data-id={p.id} data-vote="no" class="flex-1 bg-red-700 text-white text-sm font-semibold py-2 rounded"><i class="fas fa-thumbs-down"></i> Vote No</button>
                </div>
              )}
            </article>
          )
        })}
      </section>
    </div>,
    { title: n.nav_governance, lang, country, active: 'governance' }
  )
}
