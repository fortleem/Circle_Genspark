// Transparency — ad revenue ledger. Blueprint §30.
import type { Context } from 'hono'
import { all, type Env, fmtMoney } from '../db'
import { getNames } from '../i18n'

export async function transparencyPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const rows = await all(c.env.DB, 'SELECT * FROM ad_revenue_ledger ORDER BY month DESC, amount_usd DESC')
  const total = rows.reduce((s, r: any) => s + r.amount_usd, 0)
  const byAlloc: Record<string, number> = {}
  rows.forEach((r: any) => { byAlloc[r.allocation] = (byAlloc[r.allocation] ?? 0) + r.amount_usd })
  const byMonth: Record<string, number> = {}
  rows.forEach((r: any) => { byMonth[r.month] = (byMonth[r.month] ?? 0) + r.amount_usd })

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.nav_transparency}</h1>
        <p class="text-sm text-charcoal/70">Every dollar of ad revenue is logged. No user is ever targeted.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="pillar-card p-5">
          <div class="text-xs uppercase tracking-widest text-charcoal/60">Total revenue logged</div>
          <div class="font-display text-3xl text-goldDark mt-1">{fmtMoney(total, 'USD')}</div>
          <div class="text-[11px] text-charcoal/60 mt-1">Across {rows.length} entries · paid via corporate invoice</div>
        </div>
        {Object.entries(byAlloc).map(([k, v]) => (
          <div class="pillar-card p-5">
            <div class="text-xs uppercase tracking-widest text-charcoal/60">Allocation · {k}</div>
            <div class="font-display text-3xl text-goldDark mt-1">{fmtMoney(v, 'USD')}</div>
            <div class="text-[11px] text-charcoal/60 mt-1">{Math.round((v/total)*100)}% of total</div>
          </div>
        ))}
      </section>

      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Per month</h2>
        <div class="space-y-2">
          {Object.entries(byMonth).sort().reverse().map(([m, v]) => {
            const pct = Math.max(8, Math.round((v / Math.max(...Object.values(byMonth))) * 100))
            return (
              <div class="pillar-card p-3">
                <div class="flex justify-between text-xs font-semibold">
                  <span>{m}</span>
                  <span>{fmtMoney(v, 'USD')}</span>
                </div>
                <div class="h-2 rounded-full bg-gold/15 mt-1 overflow-hidden">
                  <div class="h-full bg-gold" style={`width:${pct}%`}></div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Full ledger</h2>
        <div class="pillar-card p-0 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-cream/60 text-charcoal/60 text-xs uppercase tracking-wider">
              <tr><th class="text-left p-3">Month</th><th class="text-left p-3">Advertiser</th><th class="text-left p-3">City</th><th class="text-left p-3">Allocation</th><th class="text-right p-3">Amount</th></tr>
            </thead>
            <tbody class="divide-y divide-gold/10">
              {rows.map((r: any) => (
                <tr>
                  <td class="p-3 text-xs">{r.month}</td>
                  <td class="p-3 font-semibold">{r.advertiser}</td>
                  <td class="p-3"><span class="chip text-[10px]"><i class="fas fa-location-dot"></i> {r.city}</span></td>
                  <td class="p-3"><span class="chip text-[10px]">{r.allocation}</span></td>
                  <td class="p-3 text-right font-semibold text-goldDark">{fmtMoney(r.amount_usd, 'USD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section class="bg-ink text-cream rounded-2xl p-5 text-sm">
        <div class="text-gold font-semibold mb-1">No-targeting promise</div>
        <p class="text-cream/80 text-xs leading-relaxed">
          Circle never sells, shares, or models user data for advertising. Every ad above was bought at the city level only. Advertisers cannot specify gender, age, behavior, interests, or any individual signal. This page is regenerated from a public ledger that any community node operator can audit.
        </p>
      </section>
    </div>,
    { title: n.nav_transparency, lang, country, active: 'transparency' }
  )
}
