// Home Dashboard — the launchpad. Implements blueprint §5.
import type { Context } from 'hono'
import { all, type Env, timeAgo, fmtCount } from '../db'
import { getNames } from '../i18n'
import { configFor } from '../dre'

export async function homePage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const cfg = configFor(country)
  const city = country === 'CN' ? 'Shanghai' : country === 'DE' ? 'Berlin' : country === 'SA' ? 'Riyadh' : 'Cairo'

  // Pull live data
  const [events, posts, videos, photos, channels, trending] = await Promise.all([
    all(c.env.DB, 'SELECT * FROM events WHERE city = ? ORDER BY priority DESC, start_time ASC LIMIT 5', city),
    all(c.env.DB, 'SELECT p.*, u.handle, u.display_name, u.verified FROM posts p JOIN users u ON u.id=p.author_id ORDER BY p.created_at DESC LIMIT 4'),
    all(c.env.DB, 'SELECT v.*, u.display_name FROM videos v JOIN users u ON u.id=v.uploader_id WHERE v.city = ? ORDER BY v.views DESC LIMIT 4', city),
    all(c.env.DB, 'SELECT p.*, u.display_name FROM photos p JOIN users u ON u.id=p.uploader_id WHERE p.city = ? ORDER BY p.likes DESC LIMIT 6', city),
    all(c.env.DB, 'SELECT * FROM channels WHERE channel_type = "official" ORDER BY subscriber_count DESC LIMIT 4'),
    all(c.env.DB, `SELECT hashtags, COUNT(*) AS cnt FROM posts WHERE city = ? AND hashtags IS NOT NULL GROUP BY hashtags ORDER BY cnt DESC LIMIT 6`, city)
  ])

  const topAlert = events.find((e: any) => e.category === 'emergency') || events.find((e: any) => e.category === 'psa')

  return c.render(
    <div class="space-y-8 fade-in">

      {/* HERO */}
      <section class="bg-ink text-cream rounded-3xl p-8 md:p-10 relative overflow-hidden border border-gold/30">
        <div class="absolute -right-10 -top-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl"></div>
        <div class="absolute -left-10 -bottom-20 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        <div class="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <span class="circle-logo circle-logo-xl shrink-0"></span>
          <div class="flex-1 min-w-0">
            <h1 class="font-display text-4xl md:text-5xl text-gold leading-tight">{n.brand_name}</h1>
            <p class="mt-2 text-cream/80 text-lg max-w-2xl">{n.tagline}</p>
            <div class="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span class="chip chip-dark"><i class="fas fa-shield-halved"></i> E2EE Matrix</span>
              <span class="chip chip-dark"><i class="fas fa-network-wired"></i> Federated</span>
              <span class="chip chip-dark"><i class="fas fa-share-nodes"></i> P2P IPFS</span>
              <span class="chip chip-dark"><i class="fas fa-mobile-screen"></i> On-device AI</span>
              <span class="chip chip-dark"><i class="fas fa-dollar-sign"></i> $0 forever</span>
              <span class="chip chip-dark"><i class="fas fa-globe"></i> {country} → {cfg.region.toUpperCase()} plane</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOP CAROUSEL — emergency / PSA / featured events */}
      {topAlert && (
        <section class={`rounded-2xl p-5 flex items-start gap-4 border ${topAlert.category === 'emergency' ? 'bg-red-600 text-white border-red-700 alert-emergency' : 'bg-yellow-50 border-yellow-300 text-yellow-900'}`}>
          <i class={`fas ${topAlert.category === 'emergency' ? 'fa-triangle-exclamation' : 'fa-circle-info'} text-2xl mt-1`}></i>
          <div class="flex-1">
            <div class="text-xs uppercase tracking-widest opacity-80">{topAlert.category === 'emergency' ? 'Emergency Alert' : 'Public Service Announcement'}</div>
            <div class="font-semibold text-lg">{topAlert.title}</div>
            <div class="text-sm opacity-90">{topAlert.description}</div>
          </div>
          <button class="text-xs underline opacity-80">Dismiss</button>
        </section>
      )}

      {/* QUICK ACTIONS — 4 actions, blueprint §5.3.2 */}
      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/pay',     icon: 'fa-qrcode',       label: 'Scan to Pay',  sub: 'NFC + QR'        },
            { href: '/midan',   icon: 'fa-pen-to-square', label: 'New Post',     sub: n.module_square    },
            { href: '/mashahd', icon: 'fa-video',         label: 'Go Live',      sub: n.module_video     },
            { href: '/circles', icon: 'fa-circle-plus',   label: 'Create Circle',sub: n.module_groups    }
          ].map(a => (
            <a href={a.href} class="pillar-card p-4 flex items-center gap-3 group">
              <span class="w-12 h-12 rounded-full bg-gold text-ink flex items-center justify-center text-xl shrink-0">
                <i class={`fas ${a.icon}`}></i>
              </span>
              <span class="min-w-0">
                <span class="block font-semibold text-sm text-ink">{a.label}</span>
                <span class="block text-xs text-charcoal/60">{a.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* FOUR PILLARS */}
      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-4">The Four Pillars</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/wasl',    icon: 'fa-comments',     name: n.module_chat,   note: 'E2EE Matrix · Olm/Megolm' },
            { href: '/mashahd', icon: 'fa-circle-play',  name: n.module_video,  note: 'PeerTube + WebTorrent + IPFS' },
            { href: '/lamahat', icon: 'fa-image',        name: n.module_photos, note: 'IPFS-pinned · on-device NSFW blur' },
            { href: '/midan',   icon: 'fa-hashtag',      name: n.module_square, note: 'ActivityPub · federated' }
          ].map(p => (
            <a href={p.href} class="pillar-card p-5 block">
              <span class="w-12 h-12 rounded-full bg-ink text-gold flex items-center justify-center text-xl mb-3">
                <i class={`fas ${p.icon}`}></i>
              </span>
              <span class="block font-display text-2xl text-goldDark">{p.name}</span>
              <span class="block text-[11px] text-charcoal/60 mt-1">{p.note}</span>
            </a>
          ))}
        </div>
      </section>

      {/* HAPPENING NEARBY */}
      <section>
        <div class="flex items-end justify-between mb-3">
          <h2 class="section-title font-display text-2xl text-ink">Happening in {city}</h2>
          <a href="/events" class="text-xs text-goldDark hover:underline">See all →</a>
        </div>
        <div class="h-scroll">
          {events.filter((e: any) => e.category !== 'emergency').slice(0, 6).map((e: any) => (
            <div class="min-w-[260px] pillar-card p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="chip text-[10px]"><i class={`fas ${e.category === 'tech' ? 'fa-code' : e.category === 'music' ? 'fa-music' : e.category === 'sport' ? 'fa-person-running' : e.category === 'culture' ? 'fa-masks-theater' : 'fa-circle-info'}`}></i>{e.category}</span>
                <span class="text-[10px] text-charcoal/60">{new Date(e.start_time).toLocaleDateString()}</span>
              </div>
              <div class="font-semibold text-sm leading-snug">{e.title}</div>
              <div class="text-[11px] text-charcoal/60 mt-1">{e.venue}</div>
              <button data-action="interested" data-id={e.id}
                      class="mt-3 w-full text-xs bg-ink text-gold hover:bg-charcoal rounded-lg py-1.5">
                <i class="fas fa-bookmark mr-1"></i> Interested · {fmtCount(e.interested)}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOR YOU + TRENDING two-col */}
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
          <h2 class="section-title font-display text-2xl text-ink mb-3">For You</h2>
          <p class="text-xs text-charcoal/60 mb-3"><i class="fas fa-lock text-gold"></i> Ranked on your device. Your interaction history never leaves it.</p>
          <div class="space-y-3">
            {posts.slice(0, 4).map((p: any) => (
              <article class="pillar-card p-4">
                <div class="flex items-center gap-2 text-xs text-charcoal/70 mb-1">
                  <span class="font-semibold text-ink">{p.anonymous ? 'Anonymous' : p.display_name}</span>
                  {!p.anonymous && p.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
                  {!p.anonymous && <span class="text-charcoal/50">@{p.handle}</span>}
                  <span class="text-charcoal/40">· {timeAgo(p.created_at)}</span>
                </div>
                <p class="text-sm leading-relaxed whitespace-pre-line">{p.content ?? <span class="italic text-charcoal/50">(empty post)</span>}</p>
                <div class="flex gap-4 mt-2 text-xs text-charcoal/60">
                  <span><i class="far fa-heart"></i> {fmtCount(p.likes)}</span>
                  <span><i class="far fa-comment"></i> {fmtCount(p.replies_count)}</span>
                  <span><i class="fas fa-retweet"></i> {fmtCount(p.reposts)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 class="section-title font-display text-2xl text-ink mb-3">Trending in {city}</h2>
          <ul class="space-y-1">
            {trending.map((t: any, i: number) => (
              <li class="pillar-card p-3 flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <span class="font-display text-gold text-lg w-6">{i + 1}</span>
                  <span class="font-semibold text-sm">{t.hashtags || '—'}</span>
                </span>
                <span class="text-xs text-charcoal/60">{t.cnt} posts</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OFFICIAL UPDATES */}
      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Official Updates</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {channels.map((ch: any) => (
            <a href={`/channels/${ch.slug}`} class="pillar-card p-4 flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-ink text-gold flex items-center justify-center"><i class="fas fa-tower-broadcast"></i></span>
              <span class="flex-1 min-w-0">
                <span class="block font-semibold text-sm text-ink flex items-center gap-1">{ch.name} <span class="verified-badge"><i class="fas fa-check"></i></span></span>
                <span class="block text-[11px] text-charcoal/60">{fmtCount(ch.subscriber_count)} subscribers</span>
              </span>
              <i class="fas fa-chevron-right text-gold"></i>
            </a>
          ))}
        </div>
      </section>

      {/* TRENDING VIDEOS / PHOTOS */}
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="flex items-end justify-between mb-3">
            <h2 class="section-title font-display text-2xl text-ink">Watch in {city}</h2>
            <a href="/mashahd" class="text-xs text-goldDark hover:underline">{n.module_video} →</a>
          </div>
          <div class="space-y-3">
            {videos.slice(0, 3).map((v: any) => (
              <a href="/mashahd" class="pillar-card p-3 flex gap-3 items-center">
                <span class="w-28 video-thumb shrink-0"><i class="fas fa-play"></i><span class="duration">{Math.floor(v.duration_sec/60)}:{(v.duration_sec%60).toString().padStart(2,'0')}</span></span>
                <span class="flex-1 min-w-0">
                  <span class="block font-semibold text-sm leading-tight line-clamp-2">{v.title}</span>
                  <span class="block text-[11px] text-charcoal/60 mt-1">{v.display_name} · {fmtCount(v.views)} views</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div class="flex items-end justify-between mb-3">
            <h2 class="section-title font-display text-2xl text-ink">Glimpses</h2>
            <a href="/lamahat" class="text-xs text-goldDark hover:underline">{n.module_photos} →</a>
          </div>
          <div class="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((p: any) => (
              <div class="photo-tile" title={p.caption}>
                <i class="fas fa-camera"></i>
                <div class="overlay">{p.caption ?? ''}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORED — local, non-targeted, transparent */}
      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Sponsored</h2>
        <div class="bg-gradient-to-r from-ink to-charcoal text-cream rounded-2xl p-5 flex items-center gap-4 border border-gold/30">
          <i class="fas fa-store text-3xl text-gold"></i>
          <div class="flex-1">
            <div class="text-xs uppercase tracking-widest text-gold/80">Local ad · city-level only</div>
            <div class="font-semibold">El Sawy Cultural Centre — Friday night poetry</div>
            <div class="text-xs text-cream/70 mt-1">No user profiling, no retargeting. <a href="/transparency" class="underline">Why you saw this</a>.</div>
          </div>
          <a href="/transparency" class="text-xs bg-gold text-ink font-semibold px-3 py-2 rounded">Learn More</a>
        </div>
      </section>

    </div>,
    { title: n.nav_home, lang, country, active: 'home' }
  )
}
