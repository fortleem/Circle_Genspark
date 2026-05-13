// The Circle (الدائرة) — group system. Blueprint §10.
import type { Context } from 'hono'
import { all, type Env, fmtCount } from '../db'
import { getNames } from '../i18n'

export async function circlesPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const circles = await all(c.env.DB, 'SELECT * FROM circles ORDER BY member_count DESC')

  return c.render(
    <div class="fade-in space-y-6">
      <header class="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 class="font-display text-3xl text-ink">{n.module_groups}</h1>
          <p class="text-sm text-charcoal/70">Public, private, or secret — every Circle is a Matrix room</p>
        </div>
        <button class="bg-ink text-gold px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <i class="fas fa-circle-plus"></i> Create
        </button>
      </header>

      <nav class="flex gap-2 overflow-x-auto pb-1">
        {['All','Books','Food','Tech','Design','Sport'].map((t,i) => (
          <button class={`tab-btn ${i===0 ? 'tab-btn-active' : ''}`}>{t}</button>
        ))}
      </nav>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {circles.map((cir: any) => (
          <article class="pillar-card p-5">
            <header class="flex items-start gap-3">
              <span class="w-14 h-14 rounded-full bg-ink text-gold flex items-center justify-center text-xl shrink-0">
                <i class={`fas ${cir.category === 'books' ? 'fa-book-open' : cir.category === 'food' ? 'fa-mug-hot' : cir.category === 'tech' ? 'fa-code' : cir.category === 'design' ? 'fa-pen-nib' : cir.category === 'sport' ? 'fa-person-running' : 'fa-circle-nodes'}`}></i>
              </span>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base text-ink leading-tight">{cir.name}</h3>
                <div class="text-[11px] text-charcoal/60 mt-0.5 flex items-center gap-2">
                  <span class="chip text-[10px]"><i class={`fas ${cir.visibility === 'private' ? 'fa-lock' : cir.visibility === 'secret' ? 'fa-eye-slash' : 'fa-globe'}`}></i> {cir.visibility}</span>
                  {cir.city ? <span class="chip text-[10px]"><i class="fas fa-location-dot"></i> {cir.city}</span> : null}
                </div>
              </div>
            </header>
            <p class="text-xs text-charcoal/70 mt-3 leading-relaxed">{cir.description}</p>
            <footer class="mt-4 flex items-center justify-between">
              <span class="text-xs text-charcoal/60"><i class="fas fa-users text-gold"></i> {fmtCount(cir.member_count)} members</span>
              <button class="bg-gold text-ink text-xs font-semibold px-3 py-1.5 rounded">Join</button>
            </footer>
          </article>
        ))}
      </section>
    </div>,
    { title: n.module_groups, lang, country, active: 'circles' }
  )
}
