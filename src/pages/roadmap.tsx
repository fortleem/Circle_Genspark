// §34 Phased Development Roadmap
import type { Context } from 'hono'
import { all, type Env } from '../db'
import { getNames } from '../i18n'

export async function roadmapPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const rows = await all<any>(c.env.DB, 'SELECT * FROM roadmap_phases ORDER BY phase_no')
  const phases = rows.map(p => ({ ...p, deliverables: p.deliverables ? JSON.parse(p.deliverables) : [] }))

  const totalMonths = phases.reduce((s, p) => s + p.months, 0)
  const doneMonths  = phases.filter(p => p.status === 'done').reduce((s, p) => s + p.months, 0)
  const inProgMonths= phases.filter(p => p.status === 'in-progress').reduce((s, p) => s + p.months, 0)
  const pct = Math.round(((doneMonths + inProgMonths * 0.5) / totalMonths) * 100)

  const statusStyle = (s: string) => {
    if (s === 'done')        return { chip: 'chip-success', icon: 'fa-check'   }
    if (s === 'in-progress') return { chip: 'chip-gold',    icon: 'fa-spinner fa-spin' }
    return { chip: '', icon: 'fa-clock' }
  }

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§34 · The plan, transparently</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_roadmap}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">Nine phases over ~24 months from foundation to global rollout. This is the public roadmap. Every line item below ships as open source. Every milestone requires a community governance vote before any major scope change.</p>
        <div class="mt-5">
          <div class="flex items-center gap-3">
            <div class="progress flex-1"><div class="progress-bar" style={`width: ${pct}%`}></div></div>
            <span class="text-cream text-sm font-semibold">{pct}%</span>
          </div>
          <div class="mt-2 text-[11px] text-cream/70">
            {doneMonths} months delivered · {inProgMonths} months in progress · {totalMonths - doneMonths - inProgMonths} months planned
          </div>
        </div>
      </header>

      <section class="relative">
        <div class="absolute start-6 top-2 bottom-2 w-px" style="background: linear-gradient(180deg, var(--gold) 0%, var(--border) 100%);"></div>
        <div class="space-y-4">
          {phases.map(p => {
            const st = statusStyle(p.status)
            return (
              <article class="relative ps-16">
                <span class="absolute start-0 top-3 w-12 h-12 rounded-full flex items-center justify-center font-display text-xl" style={`background: ${p.status === 'done' ? '#16A34A' : p.status === 'in-progress' ? 'var(--gold)' : 'var(--bg-soft)'}; color: ${p.status === 'done' || p.status === 'in-progress' ? '#1B1B1B' : 'var(--muted)'}; box-shadow: 0 0 0 4px var(--bg-elev), 0 0 0 5px var(--border);`}>
                  {p.phase_no}
                </span>
                <div class="pillar-card p-5">
                  <div class="flex items-center gap-3 flex-wrap">
                    <h3 class="font-display text-xl">{p.title}</h3>
                    <span class={`chip text-[10px] ${st.chip}`}><i class={`fas ${st.icon}`}></i> {p.status}</span>
                    <span class="ms-auto text-xs" style="color: var(--muted);">{p.months > 0 ? `${p.months} months` : 'continuous'}</span>
                  </div>
                  <ul class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm" style="color: var(--muted);">
                    {p.deliverables.map((d: string) => (
                      <li class="flex items-start gap-2"><i class="fas fa-circle text-gold text-[5px] mt-2 shrink-0"></i><span>{d}</span></li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>,
    { title: n.module_roadmap, lang, country, active: 'roadmap' }
  )
}
