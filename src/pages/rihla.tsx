// Rihla (رحلة) — Circle Travel. Blueprint §24.
import type { Context } from 'hono'
import { all, type Env, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function rihlaPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const items = await all(c.env.DB, 'SELECT * FROM travel_itineraries ORDER BY created_at DESC LIMIT 12')

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.module_travel}</h1>
        <p class="text-sm text-charcoal/70">AI-generated itineraries · Maps offline · No price markup, no commission</p>
      </header>

      <form id="rihla-plan" class="pillar-card p-5 grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr_auto] gap-3 items-end">
        <label class="block">
          <span class="text-xs text-charcoal/70">Destination</span>
          <input name="city" required placeholder="Istanbul" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-xs text-charcoal/70">Days</span>
          <input name="days" type="number" min="1" max="14" value="3" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-xs text-charcoal/70">Interests (comma-separated)</span>
          <input name="interests" placeholder="history, food, sufi" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm" />
        </label>
        <button type="submit" class="bg-ink text-gold px-5 py-2 rounded-lg text-sm font-semibold">
          <i class="fas fa-wand-magic-sparkles mr-1"></i> Generate
        </button>
      </form>
      <div id="rihla-result" class="hidden pillar-card p-5"></div>

      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Recent itineraries</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((it: any) => {
            const plan = (() => { try { return JSON.parse(it.plan_json) } catch { return {} } })()
            return (
              <article class="pillar-card p-4">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="font-semibold text-base text-ink"><i class="fas fa-plane-departure text-gold"></i> {it.city}</h3>
                  <span class="chip text-[10px]">{it.days} days</span>
                </div>
                <div class="text-[11px] text-charcoal/60 mb-2">Interests: {it.interests || '—'} · {timeAgo(it.created_at)}</div>
                <ol class="space-y-1 text-xs text-charcoal/80">
                  {Object.entries(plan).slice(0, 3).map(([day, slots]: [string, any]) => (
                    <li><span class="font-semibold capitalize text-ink">{day}:</span> {slots.morning ?? ''} · {slots.lunch ?? ''}</li>
                  ))}
                </ol>
              </article>
            )
          })}
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { icon: 'fa-map-location-dot', t: 'Offline maps',      b: 'OpenStreetMap region packs.' },
          { icon: 'fa-ticket',           t: 'Direct booking',    b: 'No markup, no commission.' },
          { icon: 'fa-language',         t: 'On-device phrase',  b: '7-language Arabic-first.' },
          { icon: 'fa-shield-halved',    t: 'No tracking',       b: 'Your trip stays yours.' }
        ].map(card => (
          <div class="pillar-card p-4">
            <i class={`fas ${card.icon} text-gold text-xl mb-2`}></i>
            <div class="font-semibold text-sm">{card.t}</div>
            <p class="text-xs text-charcoal/70 mt-1">{card.b}</p>
          </div>
        ))}
      </section>
    </div>,
    { title: n.module_travel, lang, country, active: 'rihla' }
  )
}
