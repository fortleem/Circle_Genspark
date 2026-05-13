// Mini App Ecosystem & Universal App Hub. Blueprint §26.
import type { Context } from 'hono'
import { all, type Env, fmtCount } from '../db'
import { getNames } from '../i18n'

export async function appsPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const apps = await all(c.env.DB, 'SELECT * FROM mini_apps ORDER BY install_count DESC')

  const byCategory = apps.reduce((acc: Record<string, any[]>, a: any) => {
    (acc[a.category] ||= []).push(a); return acc
  }, {})

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.nav_apps}</h1>
        <p class="text-sm text-charcoal/70">Lightweight mini apps · Sandboxed · Free to publish</p>
      </header>

      {Object.entries(byCategory).map(([cat, list]) => (
        <section>
          <h2 class="section-title font-display text-xl text-ink mb-3 capitalize">{cat}</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map((a: any) => (
              <article class="pillar-card p-4">
                <div class="flex items-start gap-3">
                  <span class="w-12 h-12 rounded-xl bg-ink text-gold flex items-center justify-center text-xl">
                    <i class={`fas ${cat === 'religion' ? 'fa-mosque' : cat === 'transport' ? 'fa-bus' : cat === 'finance' ? 'fa-coins' : cat === 'lifestyle' ? 'fa-leaf' : cat === 'tools' ? 'fa-screwdriver-wrench' : cat === 'games' ? 'fa-chess' : 'fa-cube'}`}></i>
                  </span>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-sm text-ink flex items-center gap-1">
                      {a.name}
                      {a.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
                    </h3>
                    <div class="text-[10px] text-charcoal/60">{a.developer}</div>
                  </div>
                </div>
                <p class="text-xs text-charcoal/70 mt-2 leading-snug">{a.description}</p>
                <footer class="mt-3 flex items-center justify-between">
                  <span class="text-[11px] text-charcoal/60"><i class="fas fa-download text-gold"></i> {fmtCount(a.install_count)}</span>
                  <button class="bg-gold text-ink text-xs font-semibold px-3 py-1 rounded">Install</button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>,
    { title: n.nav_apps, lang, country, active: 'apps' }
  )
}
