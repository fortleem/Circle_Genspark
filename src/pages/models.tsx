// §32 Zero-Cost AI Model Catalogue
import type { Context } from 'hono'
import { all, type Env } from '../db'
import { getNames } from '../i18n'

export async function modelsPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const models = await all<any>(c.env.DB, 'SELECT * FROM ai_models ORDER BY required DESC, category, size_mb')

  const byCategory: Record<string, any[]> = {}
  models.forEach((m: any) => {
    byCategory[m.category] = byCategory[m.category] || []
    byCategory[m.category].push(m)
  })

  const totalMb = models.reduce((s: number, m: any) => s + (m.size_mb || 0), 0)
  const requiredMb = models.filter((m: any) => m.required).reduce((s: number, m: any) => s + (m.size_mb || 0), 0)

  const categoryLabels: Record<string, { name: string; icon: string }> = {
    core:        { name: 'Core',         icon: 'fa-microchip' },
    translation: { name: 'Translation',  icon: 'fa-language' },
    moderation:  { name: 'Moderation',   icon: 'fa-shield-virus' },
    assistant:   { name: 'Assistant',    icon: 'fa-comments' },
    creative:    { name: 'Creative',     icon: 'fa-palette' }
  }

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§32 · Every model is free, open, and on-device</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_models}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">{models.length} models. {totalMb.toLocaleString()} MB if you install all of them. {requiredMb.toLocaleString()} MB ship with the app. Every other model is optional, downloaded over Wi-Fi only by default, and can be deleted any time to reclaim storage.</p>
      </header>

      <section class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-stagger">
        {[
          { num: models.length,                                  lbl: 'Models in catalogue',  icon: 'fa-brain' },
          { num: requiredMb,                                     lbl: 'Required (MB)',        icon: 'fa-download' },
          { num: totalMb,                                        lbl: 'All models (MB)',      icon: 'fa-hard-drive' },
          { num: models.filter((m: any) => m.on_device).length,  lbl: 'Run on-device',        icon: 'fa-mobile-screen' }
        ].map(s => (
          <div class="stat-card">
            <div class="stat-number"><span data-count={s.num}>0</span></div>
            <div class="stat-label">{s.lbl}</div>
          </div>
        ))}
      </section>

      {Object.entries(byCategory).map(([cat, ms]) => {
        const label = categoryLabels[cat] || { name: cat, icon: 'fa-folder' }
        return (
          <section>
            <h2 class="section-title font-display text-2xl mb-4"><i class={`fas ${label.icon} text-gold mr-2`}></i>{label.name}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 fade-in-stagger">
              {ms.map(m => (
                <article class="pillar-card p-5">
                  <div class="flex items-start gap-3">
                    <span class="avatar avatar-md"><i class="fas fa-cube"></i></span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold">{m.name}</span>
                        {m.required ? <span class="chip chip-gold text-[10px]">required</span> : null}
                      </div>
                      <div class="text-[11px] flex flex-wrap gap-2 mt-1" style="color: var(--muted);">
                        <span class="chip text-[10px]">{m.task}</span>
                        <span>{m.size_mb} MB</span>
                        <span>{m.format}</span>
                        <span>{m.license}</span>
                        <span>· {m.source}</span>
                      </div>
                    </div>
                  </div>
                  <p class="text-sm mt-2" style="color: var(--muted);">{m.description}</p>
                </article>
              ))}
            </div>
          </section>
        )
      })}

      <section class="card-dark rounded-2xl p-6">
        <div class="eyebrow text-gold-light mb-2">Download strategy</div>
        <ul class="space-y-1 text-sm text-cream/85 list-disc pl-6 marker:text-gold">
          <li>Models download on first use, Wi-Fi only by default (configurable per-network).</li>
          <li>Cached in the app's documents directory; deletable from Settings → Storage at any time.</li>
          <li>Monthly check for updated versions; updates only over Wi-Fi.</li>
          <li>Quantised to int8 (ONNX) or 4-bit (GGUF) — <strong>4× smaller, &lt;2% quality loss</strong>.</li>
          <li>On the China data plane, equivalent models are sourced from ModelScope instead of Hugging Face.</li>
        </ul>
      </section>
    </div>,
    { title: n.module_models, lang, country, active: 'models' }
  )
}
