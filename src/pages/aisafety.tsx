// §17 AI Safety & Moderation — hybrid on-device + community pipeline
import type { Context } from 'hono'
import { all, type Env, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function aisafetyPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const actions = await all(c.env.DB, 'SELECT * FROM moderation_actions ORDER BY created_at DESC LIMIT 30')

  const detectors = [
    { slug: 'nsfw_onnx',      name: 'Falconsai NSFW',       runtime: 'on-device',       desc: 'Every image/video frame in Lamahat, Mashahd, Wasl checked against a 45 MB ONNX classifier. Threshold 0.7. Under-18 = hard block.' },
    { slug: 'toxic_bert',     name: 'Unitary Toxic-BERT',   runtime: 'on-device / hf',  desc: 'Public Midan posts and channel comments. >0.7 → flagged for jury; >0.85 → auto-blur with appeal.' },
    { slug: 'koala_violence', name: 'KoalaAI Moderation',   runtime: 'community node',  desc: 'Async public-content scan for violence/harassment/spam. Runs on a $5 VPS, cached 24h to stay within HF free tier.' },
    { slug: 'groq_threat',    name: 'GROQ few-shot threat', runtime: 'community node',  desc: 'Low-volume threat assessment for flagged content (doxxing, self-harm, harassment).' },
    { slug: 'jury',           name: 'Community jury',       runtime: 'human',           desc: 'Three random Circle-Verify users review appealed decisions. 48h window. Majority rules. Reputation, not money.' }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§17 · Hybrid safety</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_aisafety}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">Privacy-first moderation: heavy lifting happens on-device so your content rarely leaves your phone. Public content gets a second async pass from community nodes using free Hugging Face tiers. Every decision can be appealed to a randomly-drawn community jury.</p>
      </header>

      <section class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-stagger">
        {[
          { num: 5,    sfx: '',  lbl: 'Detectors',         icon: 'fa-shield-virus' },
          { num: 0.7,  sfx: '',  lbl: 'NSFW threshold',    icon: 'fa-gauge-high' },
          { num: 48,   sfx: 'h', lbl: 'Appeal window',     icon: 'fa-clock-rotate-left' },
          { num: 3,    sfx: '',  lbl: 'Jury size',         icon: 'fa-people-group' }
        ].map(s => (
          <div class="stat-card">
            <div class="flex items-start justify-between">
              <div>
                <div class="stat-number"><span data-count={s.num} data-suffix={s.sfx}>0{s.sfx}</span></div>
                <div class="stat-label">{s.lbl}</div>
              </div>
              <i class={`fas ${s.icon} text-gold opacity-60`}></i>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 class="section-title font-display text-2xl mb-4">Detector pipeline</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fade-in-stagger">
          {detectors.map(d => (
            <div class="pillar-card p-5">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold">{d.name}</span>
                <span class="chip text-[10px] ms-auto"><i class="fas fa-microchip"></i> {d.runtime}</span>
              </div>
              <p class="text-xs" style="color: var(--muted);">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Recent moderation log</h2>
          <span class="text-xs" style="color: var(--muted);">Anonymised public audit trail</span>
        </div>
        <div class="pillar-card overflow-hidden">
          <table class="w-full text-sm">
            <thead style="background: var(--bg-soft); color: var(--muted);">
              <tr class="text-xs uppercase tracking-wider">
                <th class="text-start p-3">Content</th>
                <th class="text-start p-3">Detector</th>
                <th class="text-start p-3">Action</th>
                <th class="text-end p-3">Score</th>
                <th class="text-start p-3">Age</th>
                <th class="text-start p-3">Appeal</th>
                <th class="text-end p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a: any) => (
                <tr class="border-t" style="border-color: var(--border);">
                  <td class="p-3 font-mono text-xs">{a.content_kind}/{a.content_id}</td>
                  <td class="p-3 text-xs">{a.detector}</td>
                  <td class="p-3">
                    <span class={`chip text-[10px] ${a.action === 'block' || a.action === 'remove' ? 'chip-danger' : a.action === 'warn' ? '' : ''}`}>{a.action}</span>
                  </td>
                  <td class="p-3 text-end font-mono text-xs">{a.score?.toFixed?.(2) ?? '—'}</td>
                  <td class="p-3 text-xs">{a.age_group ?? '—'}</td>
                  <td class="p-3 text-xs">{a.appealed ? <span class={`chip text-[10px] ${a.appeal_status === 'overturned' ? 'chip-success' : a.appeal_status === 'upheld' ? 'chip-danger' : ''}`}>{a.appeal_status}</span> : '—'}</td>
                  <td class="p-3 text-end text-xs" style="color: var(--muted);">{timeAgo(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="pillar-card p-5">
          <i class="fas fa-gavel text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Community jury appeals</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">Tap "Appeal" on any moderated content. The appeal is posted to <code class="text-gold">#moderation-appeals:matrix.circle.app</code>. Three random Circle-Verify users vote within 48 hours. Majority decides. The outcome is recorded in a public, anonymised audit log.</p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-flag-checkered text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">China plane variant</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">For users on the China data plane, keyword filtering and ModelScope-sourced models replace Hugging Face. Real-name (CTID) is required to post publicly. Government takedowns are final — community jury does not apply.</p>
        </div>
      </section>
    </div>,
    { title: n.module_aisafety, lang, country, active: 'aisafety' }
  )
}
