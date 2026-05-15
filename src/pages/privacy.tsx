// §28 Privacy, Consent & Identity Dashboard
import type { Context } from 'hono'
import { all, type Env } from '../db'
import { getNames } from '../i18n'

export async function privacyPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const consents = await all(c.env.DB, 'SELECT * FROM privacy_consent WHERE user_id = 1 ORDER BY scope, granted_to')

  // Synthetic Privacy Score
  const allowed = consents.filter((c: any) => c.decision === 'always_allow').length
  const score = Math.max(40, Math.min(100, 100 - allowed * 4))

  const tips = [
    { points: 8,  text: 'Enable Ghost Mode for non-contacts',           done: score > 85 },
    { points: 12, text: 'Turn on Forwarding Consent for all messages',  done: false },
    { points: 6,  text: 'Set Pro Profile to private',                   done: true  },
    { points: 4,  text: 'Disable read receipts for non-contacts',       done: true  },
    { points: 10, text: 'Verify with Circle Verify (anonymous claims)', done: false }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§28 · You are not the product</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_privacy}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">Every byte of data on Circle assumes the user owns it. The dashboard below shows what's collected, who has access, what they can see, and how to revoke any of it instantly. There is no "premium privacy" tier — every user gets the same uncompromised treatment.</p>
      </header>

      {/* Score + tips */}
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="pillar-card p-6 lg:col-span-1">
          <div class="eyebrow mb-2">Privacy Score</div>
          <div class="flex items-end gap-2">
            <span class="font-display text-7xl text-gradient-gold leading-none" data-count={score}>0</span>
            <span class="text-2xl" style="color: var(--muted);">/ 100</span>
          </div>
          <div class="mt-4 progress"><div class="progress-bar" style={`width: ${score}%`}></div></div>
          <p class="text-xs mt-3" style="color: var(--muted);">Calculated locally from your settings. Never shared.</p>
        </div>
        <div class="pillar-card p-6 lg:col-span-2">
          <div class="eyebrow mb-3">Suggestions to improve</div>
          <ul class="space-y-2">
            {tips.map(t => (
              <li class="flex items-center gap-3">
                <span class={`avatar avatar-sm ${t.done ? '' : ''}`} style={t.done ? 'background: linear-gradient(135deg, #16A34A, #15803D); color: white;' : ''}>
                  <i class={`fas ${t.done ? 'fa-check' : 'fa-plus'}`}></i>
                </span>
                <span class="flex-1 text-sm">{t.text}</span>
                <span class="chip chip-gold text-[10px]">+{t.points}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 class="section-title font-display text-2xl mb-4">Privacy tools</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-stagger">
          {[
            { icon: 'fa-eye',           label: 'Risk simulation',  sub: 'What can X see?' },
            { icon: 'fa-file-shield',   label: 'Self-audit',       sub: 'Generate report' },
            { icon: 'fa-download',      label: 'Download my data', sub: 'Machine-readable' },
            { icon: 'fa-user-xmark',    label: 'Delete account',   sub: '30-day grace' }
          ].map(a => (
            <button class="pillar-card p-4 flex items-center gap-3 text-start group">
              <span class="avatar avatar-lg" style="background: var(--ink); color: var(--gold-light);"><i class={`fas ${a.icon}`}></i></span>
              <span class="min-w-0">
                <span class="block font-semibold text-sm">{a.label}</span>
                <span class="block text-xs" style="color: var(--muted);">{a.sub}</span>
              </span>
              <i class="fas fa-arrow-right ms-auto text-gold opacity-0 group-hover:opacity-100"></i>
            </button>
          ))}
        </div>
      </section>

      {/* Consent table */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">App & contact permissions</h2>
          <span class="text-xs" style="color: var(--muted);">Granular · revocable · auditable</span>
        </div>
        <div class="pillar-card overflow-hidden">
          <table class="w-full text-sm">
            <thead style="background: var(--bg-soft); color: var(--muted);">
              <tr class="text-xs uppercase tracking-wider">
                <th class="text-start p-3">Resource</th>
                <th class="text-start p-3">Granted to</th>
                <th class="text-start p-3">Decision</th>
                <th class="text-end p-3"></th>
              </tr>
            </thead>
            <tbody>
              {consents.map((c: any) => (
                <tr class="border-t" style="border-color: var(--border);">
                  <td class="p-3 capitalize"><i class={`fas ${c.scope === 'camera' ? 'fa-camera' : c.scope === 'mic' ? 'fa-microphone' : c.scope === 'location' ? 'fa-location-dot' : c.scope === 'contacts' ? 'fa-address-book' : 'fa-bell'} text-gold mr-2`}></i>{c.scope.replace('_', ' ')}</td>
                  <td class="p-3 font-mono text-xs">{c.granted_to}</td>
                  <td class="p-3"><span class={`chip text-[10px] ${c.decision === 'deny' ? 'chip-danger' : c.decision === 'always_allow' ? 'chip-success' : ''}`}>{c.decision.replace(/_/g, ' ')}</span></td>
                  <td class="p-3 text-end"><button class="text-xs hover:text-gold" style="color: var(--muted);"><i class="fas fa-ellipsis-vertical"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dual identity + screenshot consent */}
      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="pillar-card p-5">
          <i class="fas fa-masks-theater text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Dual identity</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">Your private Matrix ID (<code class="text-gold">@you:matrix.circle.app</code>) and your public profile (<code class="text-gold">@you_public</code>) are <strong>not linked</strong> by default. Link them only if you choose to. The server never stores the mapping.</p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-camera-rotate text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Screenshot & forwarding consent</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">Per-message, per-contact. Unauthorised screenshots get a watermarked black image with the requester's ID and timestamp — traceable, not blockable, but enough to deter the casual leak.</p>
        </div>
      </section>
    </div>,
    { title: n.module_privacy, lang, country, active: 'privacy' }
  )
}
