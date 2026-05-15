// §18 Self-Learning AI Core — on-device training + federated learning + DP
import type { Context } from 'hono'
import { all, type Env, fmtCount } from '../db'
import { getNames } from '../i18n'

export async function aicorePage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const [stats, rounds, models] = await Promise.all([
    all(c.env.DB, 'SELECT * FROM ai_training_stats WHERE user_id = 1 ORDER BY updated_at DESC'),
    all(c.env.DB, 'SELECT * FROM federated_rounds ORDER BY round_no DESC LIMIT 6'),
    all(c.env.DB, "SELECT * FROM ai_models WHERE category='assistant' OR category='core' ORDER BY size_mb")
  ])

  const totalSamples = stats.reduce((s: number, r: any) => s + (r.samples_local || 0), 0)
  const totalRounds  = stats.reduce((s: number, r: any) => s + (r.rounds_done || 0), 0)
  const optedIn      = stats.filter((s: any) => s.fed_opt_in === 1).length

  return c.render(
    <div class="fade-in space-y-8">

      <header class="card-dark rounded-3xl p-8 relative">
        <div class="relative">
          <div class="eyebrow text-gold-light">§18 · The model is yours</div>
          <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_aicore}</h1>
          <p class="text-cream/80 mt-3 max-w-3xl">Recommendations, smart replies, and personal AI are <strong>trained on your phone</strong> from your own data — not on a server somewhere. Federated learning is opt-in only, and even then, your contribution is differentially private (ε=1.0, δ=1e-5) and aggregated via secure aggregation before any community node ever sees it.</p>
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="chip chip-dark"><i class="fas fa-mobile-screen"></i> Trains on-device</span>
            <span class="chip chip-dark"><i class="fas fa-shield-halved"></i> Differential privacy</span>
            <span class="chip chip-dark"><i class="fas fa-share-nodes"></i> Secure aggregation</span>
            <span class="chip chip-gold"><i class="fas fa-check"></i> Opt-in only</span>
          </div>
        </div>
      </header>

      {/* Personal training stats */}
      <section>
        <h2 class="section-title font-display text-2xl mb-4">Your on-device training</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-stagger">
          <div class="stat-card">
            <div class="stat-number"><span data-count={totalSamples}>0</span></div>
            <div class="stat-label">Local samples</div>
          </div>
          <div class="stat-card">
            <div class="stat-number"><span data-count={totalRounds}>0</span></div>
            <div class="stat-label">Training rounds</div>
          </div>
          <div class="stat-card">
            <div class="stat-number"><span data-count={optedIn}>0</span></div>
            <div class="stat-label">Models in federation</div>
          </div>
          <div class="stat-card">
            <div class="stat-number"><span data-count={stats.length}>0</span></div>
            <div class="stat-label">Models installed</div>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          {stats.map((s: any) => {
            const lossPct = Math.max(0, Math.min(100, Math.round((1 - (s.last_loss ?? 0.5)) * 100)))
            return (
              <article class="pillar-card p-5">
                <div class="flex items-center gap-3 flex-wrap">
                  <span class="avatar avatar-md"><i class="fas fa-microchip"></i></span>
                  <div class="min-w-0">
                    <div class="font-semibold text-base">{s.model_name}</div>
                    <div class="text-[11px]" style="color: var(--muted);">
                      {fmtCount(s.samples_local)} samples · {s.rounds_done} rounds · last loss {s.last_loss?.toFixed?.(3) ?? s.last_loss}
                    </div>
                  </div>
                  <div class="ms-auto flex items-center gap-3 flex-wrap">
                    <span class="chip"><i class={`fas fa-battery-${s.battery_pct > 50 ? 'three-quarters' : 'half'}`}></i> {s.battery_pct}%</span>
                    {s.charging ? <span class="chip chip-success"><i class="fas fa-plug"></i> Charging</span> : null}
                    {s.fed_opt_in ? <span class="chip chip-success"><i class="fas fa-share-nodes"></i> Federated (opt-in)</span> : <span class="chip" style="color: var(--muted);"><i class="fas fa-lock"></i> Local only</span>}
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-3">
                  <div class="progress flex-1"><div class="progress-bar" style={`width: ${lossPct}%`}></div></div>
                  <span class="text-[11px] font-semibold w-12 text-end">{lossPct}%</span>
                </div>
                <div class="mt-2 text-[10px] flex gap-3" style="color: var(--muted-2);">
                  <span>ε = {s.epsilon}</span>
                  <span>δ = {s.delta}</span>
                  <span>updated {new Date(s.updated_at).toLocaleDateString()}</span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Federated rounds */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Federated learning rounds</h2>
          <span class="text-xs" style="color: var(--muted);">Aggregated across all opted-in users · gradients only</span>
        </div>
        <div class="pillar-card overflow-hidden">
          <table class="w-full text-sm">
            <thead style="background: var(--bg-soft); color: var(--muted);">
              <tr class="text-xs uppercase tracking-wider">
                <th class="text-start p-3">Round</th>
                <th class="text-start p-3">Model</th>
                <th class="text-end p-3">Participants</th>
                <th class="text-start p-3">Aggregator</th>
                <th class="text-end p-3">DP noise σ</th>
                <th class="text-end p-3">Finished</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r: any) => (
                <tr class="border-t" style="border-color: var(--border);">
                  <td class="p-3 font-display text-gold-dark text-base">#{r.round_no}</td>
                  <td class="p-3">{r.model_name}</td>
                  <td class="p-3 text-end">{fmtCount(r.participants)}</td>
                  <td class="p-3 text-xs font-mono" style="color: var(--muted);">{r.aggregator_node}</td>
                  <td class="p-3 text-end font-mono text-xs">{r.noise_added}</td>
                  <td class="p-3 text-end text-xs" style="color: var(--muted);">{new Date(r.finished_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Installed assistant / core models */}
      <section>
        <h2 class="section-title font-display text-2xl mb-4">Assistant & core models on this device</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fade-in-stagger">
          {models.map((m: any) => (
            <div class="pillar-card p-5">
              <div class="flex items-start gap-3">
                <span class="avatar avatar-md"><i class="fas fa-brain"></i></span>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold truncate">{m.name}</div>
                  <div class="text-[11px]" style="color: var(--muted);">{m.size_mb} MB · {m.format} · {m.license}</div>
                </div>
                {m.required ? <span class="chip chip-gold text-[10px]">required</span> : <span class="chip text-[10px]">optional</span>}
              </div>
              <p class="text-xs mt-2" style="color: var(--muted);">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section class="card-dark rounded-2xl p-6">
        <div class="eyebrow text-gold-light mb-2">How federated learning works on Circle</div>
        <ol class="space-y-2 text-sm text-cream/90 list-decimal pl-6 marker:text-gold">
          <li>Your phone trains a local copy of the model on data that <strong>never leaves</strong> the device.</li>
          <li>If you opt-in, the model's <strong>gradients</strong> (not your data) are perturbed with Gaussian noise calibrated to ε=1.0, δ=1e-5.</li>
          <li>The noisy gradient is encrypted to the community aggregator using <strong>secure aggregation</strong>: the aggregator can decrypt only the <em>sum</em> of all participants, never any individual contribution.</li>
          <li>The new global model is published with its CID, signed by the aggregator. Anyone can audit it.</li>
          <li>You pull the new global model — and continue training on your local data again.</li>
        </ol>
      </section>

    </div>,
    { title: n.module_aicore, lang, country, active: 'aicore' }
  )
}
