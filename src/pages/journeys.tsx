// §35 User Journey Examples
import type { Context } from 'hono'
import type { Env } from '../db'
import { getNames } from '../i18n'

export async function journeysPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)

  const stories = [
    {
      who: 'Layla · Cairo · new user',
      icon: 'fa-user',
      tint: '194,160,96',
      summary: 'From sign-up to creator income in 30 days, zero cost.',
      steps: [
        'Day 1: signs up with email (no SMS), 12 hashed contacts already on Circle, attends a Sufi Café event paid via Fawry voucher.',
        'Day 7: Circle Verify scan (on-device, 2 min). Over-18 attestation. Applies for a job through Pro Network.',
        'Day 30: receives first salary via Vodafone Cash. Creates "Layla\'s Cairo Lens" creator channel. Sets up @layla:circle.app email.'
      ]
    },
    {
      who: 'Ahmed · Cairo · parent',
      icon: 'fa-user-tie',
      tint: '142,110,44',
      summary: 'School onboarding in 2 minutes — email-only, no SMS.',
      steps: [
        'Receives school invitation by email, clicks link, account created in 2 minutes.',
        'Auto-joined to #parents-grade5 and #announcements-all. Sees parent-teacher conference alert.',
        'Pays EGP 2,500 school fees via Fawry voucher. Receipt arrives in Circle Mail. Views child\'s private grade report.'
      ]
    },
    {
      who: 'Sara · supermarket checkout',
      icon: 'fa-cart-shopping',
      tint: '230,204,138',
      summary: 'EGP 350 paid in 3 seconds, no card, no app-switch.',
      steps: [
        'Scans the unified POS QR via Dashboard → Scan to Pay.',
        'Confirms payment with fingerprint; routed via her linked Vodafone Cash.',
        'Both Sara and the cashier see "Success". Receipt lands in Circle Mail automatically.'
      ]
    },
    {
      who: 'Mona · Alexandria · creator',
      icon: 'fa-palette',
      tint: '194,160,96',
      summary: '"Mona\'s Egyptian Kitchen" gets 10k views, 0 bandwidth cost.',
      steps: [
        'Uploads "How to Make Perfect Koshari" — stored on IPFS, federated via PeerTube.',
        'Smart Post Router fans it out to Lamahat and Midan automatically.',
        'Week 3: live Ramadan cooking session, 200 viewers, bullet comments. Tips arrive directly to her wallet.'
      ]
    },
    {
      who: 'Zhang Wei · Chinese tourist · Paris',
      icon: 'fa-suitcase',
      tint: '142,110,44',
      summary: 'WeChat Pay abroad + offline maps + emergency SOS.',
      steps: [
        'Home region auto-detected; WeChat Pay stays primary even abroad. Books hotel via Rihla.',
        'Downloads 1.2 GB Paris offline map over hotel Wi-Fi. Walks all day without internet.',
        'Loses wallet → Emergency SOS, auto-translates distress to French, dials local emergency. Cultural Interpreter shows tipping norms (15%).'
      ]
    },
    {
      who: 'Karim · Cairo → Dubai',
      icon: 'fa-briefcase',
      tint: '230,204,138',
      summary: 'Career relocation managed end-to-end in Circle.',
      steps: [
        'Activates Pro Profile, uploads watermarked CV to IPFS.',
        'Applies to Careem with one click, interviews via Wasl video call, signs contract via Circle Verify e-signature.',
        'Relocates to Dubai using Rihla. First salary cross-plane-fed to his Egyptian Vodafone Cash.'
      ]
    },
    {
      who: 'Ali · Cairo Metro · offline',
      icon: 'fa-train-subway',
      tint: '194,160,96',
      summary: 'Mesh chat in the underground, no cell tower needed.',
      steps: [
        'No signal. Opens Wasl → Nearby tab. Sees "Omar (15 m away)" via BLE mesh.',
        'Sends "Meet at Sadat exit 3?" — delivered instantly over Bluetooth.',
        'When the metro emerges, all messages sync to homeservers automatically; chronology preserved.'
      ]
    },
    {
      who: 'The Ezz Family · shared vault',
      icon: 'fa-people-roof',
      tint: '142,110,44',
      summary: 'A family photo album that never sees the cloud.',
      steps: [
        'Parents create Family Vault (Private, E2EE). Five devices store redundant copies.',
        'New photos sync over mesh when in proximity; queued and sent when offline members reconnect.',
        'Time capsule scheduled: daughter\'s graduation photo unlocks on July 15, 2030.'
      ]
    },
    {
      who: 'Nour · anonymous support',
      icon: 'fa-hand-holding-heart',
      tint: '230,204,138',
      summary: 'Stigma-free help; no one can link aliases to identity.',
      steps: [
        'Joins "Cairo Anxiety Support" — assigned alias "مواظب #F8E2".',
        'Posts anonymously; replies arrive from other pseudonyms. The mapping lives only on Nour\'s device.',
        'Even Circle infrastructure cannot link the alias across different anonymous Circles.'
      ]
    }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§35 · Real lives, real flows</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_journeys}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">Nine end-to-end scenarios distilled from the blueprint — the lived experience of using Circle from sign-up to subway to emergency to creator income. Every step is achievable on the architecture described in the other sections.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in-stagger">
        {stories.map(s => (
          <article class="pillar-card p-6 relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={`background: radial-gradient(circle, rgba(${s.tint},0.20), transparent 70%);`}></div>
            <div class="relative flex items-start gap-3 mb-3">
              <span class="avatar avatar-lg" style="background: var(--ink); color: var(--gold-light);"><i class={`fas ${s.icon} text-lg`}></i></span>
              <div class="flex-1 min-w-0">
                <div class="font-display text-xl leading-tight">{s.who}</div>
                <div class="text-xs italic mt-1" style="color: var(--muted);">{s.summary}</div>
              </div>
            </div>
            <ol class="relative space-y-2 ps-5 text-sm" style="color: var(--muted);">
              {s.steps.map((step: string, i: number) => (
                <li class="relative">
                  <span class="absolute -start-5 top-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style="background: var(--gold); color: #1B1B1B;">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </div>,
    { title: n.module_journeys, lang, country, active: 'journeys' }
  )
}
