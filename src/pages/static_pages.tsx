// Static-ish pages: Covenant, Circle ID/Verify, Settings.
import type { Context } from 'hono'
import { all, first, type Env } from '../db'
import { getNames, ALL_LANGS } from '../i18n'
import { configFor, KNOWN_COUNTRIES } from '../dre'

export async function covenantPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const promises = [
    { icon: 'fa-dollar-sign',    title: '$0 forever',                body: 'Every feature, every module, every user — free in perpetuity.' },
    { icon: 'fa-eye-slash',      title: 'No tracking',               body: 'No analytics, no fingerprinting, no behavioral profiles.' },
    { icon: 'fa-bullseye',       title: 'No targeted ads',           body: 'Local ads only, city-level, paid by corporate invoice.' },
    { icon: 'fa-mobile-screen',  title: 'Data stays on device',      body: 'All personal data lives on your phone. Cloud is opt-in only.' },
    { icon: 'fa-share-nodes',    title: 'Federated by design',       body: 'Matrix + ActivityPub + IPFS. Run your own node anytime.' },
    { icon: 'fa-shield-halved',  title: 'E2EE everywhere',           body: 'Olm + Megolm encryption. Keys never leave your device.' },
    { icon: 'fa-code-branch',    title: 'Open source forever',       body: 'Apache 2.0 license. Fork, audit, self-host without limits.' },
    { icon: 'fa-scale-balanced', title: 'Community governance',      body: 'Future changes require a DAO vote. No silent enshittification.' }
  ]
  return c.render(
    <div class="fade-in space-y-6">
      <header class="bg-ink text-cream rounded-3xl p-8 border border-gold/30 relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div class="relative">
          <span class="circle-logo circle-logo-xl"></span>
          <h1 class="font-display text-4xl text-gold mt-4">{n.covenant}</h1>
          <p class="text-cream/80 max-w-2xl mt-2">The eight non-negotiable promises every Circle user, developer, and community node operator can rely on — for the next decade and beyond.</p>
        </div>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promises.map(p => (
          <article class="pillar-card p-5">
            <i class={`fas ${p.icon} text-gold text-2xl mb-2`}></i>
            <h2 class="font-display text-xl text-ink">{p.title}</h2>
            <p class="text-sm text-charcoal/80 mt-1">{p.body}</p>
          </article>
        ))}
      </section>

      <section class="pillar-card p-6">
        <h2 class="font-display text-2xl text-ink section-title mb-3">Long-term vision (10 years)</h2>
        <ul class="space-y-2 text-sm text-charcoal/80">
          <li><i class="fas fa-circle text-gold text-[6px] mr-2"></i> Perpetual open source — Apache 2.0, no rug-pull.</li>
          <li><i class="fas fa-circle text-gold text-[6px] mr-2"></i> No enshittification — every change requires a DAO vote.</li>
          <li><i class="fas fa-circle text-gold text-[6px] mr-2"></i> Global mesh internet — LoRa + Wi-Fi Direct fallback.</li>
          <li><i class="fas fa-circle text-gold text-[6px] mr-2"></i> Decentralised identity — self-sovereign Circle ID.</li>
          <li><i class="fas fa-circle text-gold text-[6px] mr-2"></i> Zero marginal cost per new user.</li>
        </ul>
      </section>
    </div>,
    { title: n.covenant, lang, country }
  )
}

export async function idPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const users = await all<any>(c.env.DB, 'SELECT * FROM users ORDER BY id LIMIT 12')
  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.module_id}</h1>
        <p class="text-sm text-charcoal/70">OIDC identity provider · Self-sovereign · One real human, one account</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article class="pillar-card p-6">
          <i class="fas fa-id-card-clip text-gold text-3xl mb-2"></i>
          <h2 class="font-display text-2xl text-ink">{n.module_verify}</h2>
          <p class="text-sm text-charcoal/80 mt-1">Optional, voluntary, anonymous attestations. Used to prove things like:</p>
          <ul class="mt-3 space-y-1 text-sm">
            <li><i class="fas fa-check text-gold mr-2"></i> Over 18 — without revealing your birthday</li>
            <li><i class="fas fa-check text-gold mr-2"></i> Nationality — without revealing your name</li>
            <li><i class="fas fa-check text-gold mr-2"></i> Organization — without revealing your role</li>
            <li><i class="fas fa-check text-gold mr-2"></i> Real human — without biometric storage on the cloud</li>
          </ul>
        </article>

        <article class="pillar-card p-6">
          <i class="fas fa-key text-gold text-3xl mb-2"></i>
          <h2 class="font-display text-2xl text-ink">OIDC sign-in</h2>
          <p class="text-sm text-charcoal/80 mt-1">Use your Circle ID to log into any compatible third-party service. Powered by Ory Hydra, fully open-source.</p>
          <div class="mt-4 bg-ink text-gold text-xs rounded-lg p-3 font-mono leading-relaxed">
            GET /oauth2/authorize?<br />
            &nbsp;&nbsp;client_id=app-xyz<br />
            &nbsp;&nbsp;response_type=code<br />
            &nbsp;&nbsp;scope=openid%20profile<br />
            &nbsp;&nbsp;redirect_uri=https://example.com/cb
          </div>
        </article>
      </section>

      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Verified members (sample)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u: any) => (
            <article class="pillar-card p-4">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-full bg-ink text-gold flex items-center justify-center text-xs"><i class="fas fa-user"></i></span>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm text-ink flex items-center gap-1">
                    {u.display_name}
                    {u.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
                  </div>
                  <div class="text-[11px] text-charcoal/60 truncate">{u.matrix_id}</div>
                </div>
              </div>
              <div class="mt-2 text-[11px] text-charcoal/70 flex gap-2 flex-wrap">
                {u.verified_claim && <span class="chip text-[10px]">{u.verified_claim}</span>}
                <span class="chip text-[10px]"><i class="fas fa-globe"></i> {u.country}</span>
                <span class="chip text-[10px]">{u.language}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>,
    { title: n.module_id, lang, country }
  )
}

export async function settingsPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const cfg = configFor(country)
  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">Settings</h1>
        <p class="text-sm text-charcoal/70">Adjust language, region, and dynamic data plane — applied without an app update.</p>
      </header>

      <form action="/settings" method="get" class="pillar-card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block">
          <span class="text-xs text-charcoal/70">Language (dynamic naming convention)</span>
          <select name="lang" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm">
            {ALL_LANGS.map(l => <option value={l.code} selected={l.code === lang}>{l.label}</option>)}
          </select>
        </label>
        <label class="block">
          <span class="text-xs text-charcoal/70">Country (Dynamic Regional Engine)</span>
          <select name="country" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm">
            {KNOWN_COUNTRIES.map(cc => <option value={cc} selected={cc === country}>{cc}</option>)}
          </select>
        </label>
        <div class="md:col-span-2">
          <button class="bg-ink text-gold px-4 py-2 rounded-lg text-sm font-semibold">Apply</button>
        </div>
      </form>

      <section class="pillar-card p-5">
        <h2 class="section-title font-display text-xl text-ink mb-3">Resolved region config</h2>
        <pre class="bg-ink text-gold text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">{JSON.stringify(cfg, null, 2)}</pre>
      </section>
    </div>,
    { title: 'Settings', lang, country }
  )
}

export async function eventsPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const events = await all<any>(c.env.DB, 'SELECT * FROM events ORDER BY start_time ASC LIMIT 50')
  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">Events</h1>
        <p class="text-sm text-charcoal/70">All upcoming events across federated nodes</p>
      </header>
      <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((e: any) => (
          <article class={`pillar-card p-4 ${e.category === 'emergency' ? 'border-red-500 bg-red-50' : ''}`}>
            <div class="flex items-start justify-between gap-2 mb-1">
              <h3 class="font-semibold text-base text-ink">{e.title}</h3>
              <span class={`chip text-[10px] ${e.category === 'emergency' ? 'bg-red-100 border-red-300 text-red-800' : ''}`}>{e.category}</span>
            </div>
            <div class="text-xs text-charcoal/70"><i class="fas fa-location-dot text-gold"></i> {e.venue}, {e.city}</div>
            <div class="text-xs text-charcoal/70"><i class="fas fa-clock text-gold"></i> {new Date(e.start_time).toLocaleString()}</div>
            <p class="text-sm text-charcoal/80 mt-2">{e.description}</p>
            <div class="mt-2 text-[11px] text-charcoal/60"><i class="fas fa-bookmark text-gold"></i> {e.interested} interested</div>
          </article>
        ))}
      </section>
    </div>,
    { title: 'Events', lang, country }
  )
}
