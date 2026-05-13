// Professional Network — LinkedIn replacement. Blueprint §14.
import type { Context } from 'hono'
import { all, type Env, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function proPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const [jobs, profiles] = await Promise.all([
    all(c.env.DB, 'SELECT j.*, u.display_name AS posted_by_name FROM pro_jobs j LEFT JOIN users u ON u.id=j.posted_by ORDER BY j.created_at DESC'),
    all(c.env.DB, 'SELECT p.*, u.handle, u.display_name, u.city, u.country, u.verified FROM pro_profiles p JOIN users u ON u.id=p.user_id')
  ])

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.module_professional}</h1>
        <p class="text-sm text-charcoal/70">Federated career identity · No data sold to recruiters</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <section>
          <h2 class="section-title font-display text-2xl text-ink mb-3">Open Roles</h2>
          <div class="space-y-3">
            {jobs.map((j: any) => (
              <article class="pillar-card p-4">
                <div class="flex items-start gap-3">
                  <span class="w-11 h-11 rounded-lg bg-ink text-gold flex items-center justify-center"><i class="fas fa-briefcase"></i></span>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base text-ink">{j.title}</h3>
                    <div class="text-xs text-charcoal/70">{j.company} · {j.city}, {j.country} {j.remote ? <span class="chip text-[10px] ml-1"><i class="fas fa-house-laptop"></i> Remote OK</span> : null}</div>
                    <p class="text-xs text-charcoal/70 mt-1">{j.description}</p>
                    <div class="mt-2 text-[10px] text-charcoal/50">Posted by {j.posted_by_name ?? 'Anonymous'} · {timeAgo(j.created_at)}</div>
                  </div>
                  <a href={j.apply_url} class="bg-gold text-ink text-xs font-semibold px-3 py-1.5 rounded h-fit">Apply</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside>
          <h2 class="section-title font-display text-xl text-ink mb-3">People to know</h2>
          <div class="space-y-2">
            {profiles.map((p: any) => (
              <article class="pillar-card p-3">
                <div class="flex items-start gap-2">
                  <span class="w-9 h-9 rounded-full bg-ink text-gold flex items-center justify-center text-xs"><i class="fas fa-user"></i></span>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm text-ink flex items-center gap-1">{p.display_name} {p.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}</div>
                    <div class="text-[11px] text-charcoal/70">{p.headline}</div>
                    <div class="text-[10px] text-charcoal/50">{p.current_role} · {p.company} · {p.city}, {p.country}</div>
                    {p.open_to_work ? <span class="chip text-[10px] mt-1"><i class="fas fa-door-open"></i> Open to work</span> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>,
    { title: n.module_professional, lang, country, active: 'pro' }
  )
}
