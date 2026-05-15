// §26 Unique Out-of-the-Box Features
import type { Context } from 'hono'
import type { Env } from '../db'
import { getNames } from '../i18n'

export async function uniquePage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)

  const features = [
    { icon: 'fa-shuffle',           name: 'Smart Post Router',     hue: '194,160,96', desc: 'Compose once, fan out to Lamahat/Midan/Mashahd/Stories automatically. Local classifier — zero AI cost.' },
    { icon: 'fa-book-open',         name: 'Personal AI Memoir',    hue: '142,110,44', desc: 'An encrypted on-device journal of your life on Circle. DistilGPT-2 summarises your weeks. Time capsules unlock on future dates.' },
    { icon: 'fa-book',              name: 'Knowledge Circles',     hue: '230,204,138',desc: 'Group wikis on IPFS. Markdown pages, version history, [[wiki links]], templates. Export the entire wiki as ZIP anytime.' },
    { icon: 'fa-box-archive',       name: 'Offline Content Stash', hue: '194,160,96', desc: 'One-tap save of any post/video/map. Smart pre-caching learns your travel patterns and pre-stashes overnight on Wi-Fi.' },
    { icon: 'fa-ticket',            name: 'Decentralised Ticketing',hue: '142,110,44',desc: 'Issue cryptographically signed Ed25519 tickets to events. Verify offline by QR scan. No Eventbrite. No fees. No forgery.' },
    { icon: 'fa-vault',             name: 'Family Vault',          hue: '230,204,138',desc: 'Encrypted shared album that lives only on family devices. Mesh-syncs locally. The cloud is not invited.' },
    { icon: 'fa-user-secret',       name: 'Anonymous Help Circles',hue: '194,160,96', desc: 'Pseudonymous support groups for mental health, addiction, survivor networks. Identity mapping stored only on your device.' },
    { icon: 'fa-clone',             name: 'Echoes (Duets)',        hue: '142,110,44', desc: 'React to a Mashahd video by recording yourself alongside it. ffmpeg_kit on-device — no server transcoding.' },
    { icon: 'fa-comment-dots',      name: 'Bullet Comments (Danmaku)',hue: '230,204,138',desc: 'Comments scroll across the video in real time. Bilibili-style. Time-stamped on recorded videos.' },
    { icon: 'fa-bell-slash',        name: 'Smart Notifications',   hue: '194,160,96', desc: 'On-device Naive Bayes clusters notifications by intent, learns quiet hours, summarises low-priority categories into a digest.' }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§26 · Different by design</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_unique}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">Ten features you won't find in any other super-app. All zero-cost to operate, all privacy-first, most of them genuinely impossible to build on a centralised platform.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fade-in-stagger">
        {features.map(f => (
          <article class="pillar-card p-6 relative overflow-hidden group">
            <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full transition-transform group-hover:scale-150" style={`background: radial-gradient(circle, rgba(${f.hue},0.20), transparent 70%);`}></div>
            <span class="relative w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3" style="background: var(--ink); color: var(--gold-light);">
              <i class={`fas ${f.icon}`}></i>
            </span>
            <h3 class="relative font-display text-xl">{f.name}</h3>
            <p class="relative text-sm mt-2" style="color: var(--muted);">{f.desc}</p>
          </article>
        ))}
      </section>

      <section class="card-dark rounded-2xl p-6">
        <div class="eyebrow text-gold-light mb-2">Common thread</div>
        <p class="text-cream/85 text-sm">Every one of these features uses <strong>on-device processing</strong>, <strong>local storage</strong>, <strong>peer-to-peer sync</strong>, and <strong>open-source libraries</strong> (ffmpeg, ONNX, Ed25519). Total operational cost to Circle: <strong class="text-gold">$0</strong>. No paid APIs, no cloud storage, no user billing details. The features that should not work on a free platform — work here, because the platform is yours.</p>
      </section>
    </div>,
    { title: n.module_unique, lang, country, active: 'unique' }
  )
}
