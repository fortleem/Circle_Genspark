// Home Dashboard — the launchpad. Implements blueprint §5.
import type { Context } from 'hono'
import { all, type Env, timeAgo, fmtCount } from '../db'
import { getNames } from '../i18n'
import { configFor } from '../dre'

export async function homePage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const cfg = configFor(country)
  const city = country === 'CN' ? 'Shanghai' : country === 'DE' ? 'Berlin' : country === 'SA' ? 'Riyadh' : 'Cairo'

  const [events, posts, videos, photos, channels, trending, circles] = await Promise.all([
    all(c.env.DB, 'SELECT * FROM events WHERE city = ? ORDER BY priority DESC, start_time ASC LIMIT 6', city),
    all(c.env.DB, 'SELECT p.*, u.handle, u.display_name, u.verified FROM posts p JOIN users u ON u.id=p.author_id ORDER BY p.created_at DESC LIMIT 4'),
    all(c.env.DB, 'SELECT v.*, u.display_name FROM videos v JOIN users u ON u.id=v.uploader_id WHERE v.city = ? ORDER BY v.views DESC LIMIT 4', city),
    all(c.env.DB, 'SELECT p.*, u.display_name FROM photos p JOIN users u ON u.id=p.uploader_id WHERE p.city = ? ORDER BY p.likes DESC LIMIT 8', city),
    all(c.env.DB, 'SELECT * FROM channels WHERE channel_type = "official" ORDER BY subscriber_count DESC LIMIT 4'),
    all(c.env.DB, `SELECT hashtags, COUNT(*) AS cnt FROM posts WHERE city = ? AND hashtags IS NOT NULL GROUP BY hashtags ORDER BY cnt DESC LIMIT 6`, city),
    all(c.env.DB, 'SELECT * FROM circles ORDER BY member_count DESC LIMIT 4')
  ])

  const topAlert = events.find((e: any) => e.category === 'emergency') || events.find((e: any) => e.category === 'psa')

  // Synthesize stat numbers for the hero (derived from DB + headline figures)
  const stats = [
    { label: 'Free forever',         value: 0,       prefix: '$',  icon: 'fa-dollar-sign' },
    { label: 'Languages',            value: 200,     suffix: '+',  icon: 'fa-language' },
    { label: 'Federated planes',     value: 6,       suffix: '',   icon: 'fa-globe' },
    { label: 'On-device AI models',  value: 14,      suffix: '',   icon: 'fa-microchip' }
  ]

  return c.render(
    <div class="space-y-10 fade-in">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section class="card-dark rounded-3xl p-8 md:p-12 relative">
        <div class="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div class="eyebrow text-gold-light mb-3">{country} · {cfg.region.toUpperCase()} data plane · v12.0</div>
            <h1 class="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight">
              <span class="text-gradient-gold">{n.brand_name}</span>
              <span class="block mt-2 text-cream/95 text-3xl md:text-4xl font-display">{n.tagline}</span>
            </h1>
            <p class="mt-5 max-w-2xl text-cream/75 text-base md:text-lg leading-relaxed">
              One app replacing WhatsApp, Instagram, YouTube, X, LinkedIn, Maps, Gmail, Zoom — and a dozen others. Federated, end-to-end encrypted, AI-on-device.
              Yours by design, free in perpetuity.
            </p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span class="chip chip-dark"><i class="fas fa-shield-halved"></i> E2EE Matrix</span>
              <span class="chip chip-dark"><i class="fas fa-network-wired"></i> Federated</span>
              <span class="chip chip-dark"><i class="fas fa-share-nodes"></i> P2P IPFS</span>
              <span class="chip chip-dark"><i class="fas fa-mobile-screen"></i> On-device AI</span>
              <span class="chip chip-dark"><i class="fas fa-tower-cell"></i> Offline mesh</span>
              <span class="chip chip-gold"><i class="fas fa-dollar-sign"></i> $0 forever</span>
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
              <a href="/covenant" class="btn btn-primary"><i class="fas fa-scroll"></i> Read the Covenant</a>
              <a href="/aicore"   class="btn btn-ghost" style="background: rgba(255,255,255,0.06); color: var(--gold-light); border-color: rgba(194,160,96,0.35);"><i class="fas fa-microchip"></i> Self-Learning AI</a>
              <a href="/mesh"     class="btn btn-ghost" style="background: rgba(255,255,255,0.06); color: var(--gold-light); border-color: rgba(194,160,96,0.35);"><i class="fas fa-tower-cell"></i> Offline Mesh</a>
            </div>
          </div>

          <div class="hidden lg:flex flex-col items-center gap-4">
            <span class="circle-logo circle-logo-xl circle-aura float"></span>
            <div class="text-center">
              <div class="font-display text-gold text-2xl">دواير</div>
              <div class="text-cream/60 text-xs uppercase tracking-[0.22em] mt-1">one app · every life</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT BAR ────────────────────────────────────────────────── */}
      <section class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-stagger">
        {stats.map(s => (
          <div class="stat-card">
            <div class="flex items-start justify-between">
              <div>
                <div class="stat-number">
                  <span data-count={s.value} data-prefix={s.prefix ?? ''} data-suffix={s.suffix ?? ''}>{s.prefix ?? ''}0{s.suffix ?? ''}</span>
                </div>
                <div class="stat-label">{s.label}</div>
              </div>
              <i class={`fas ${s.icon} text-gold text-lg opacity-60`}></i>
            </div>
          </div>
        ))}
      </section>

      {/* ── TOP ALERT ──────────────────────────────────────────────── */}
      {topAlert && (
        <section class={`glass rounded-2xl p-5 flex items-start gap-4 ${topAlert.category === 'emergency' ? 'alert-emergency' : ''}`} style={topAlert.category === 'emergency' ? 'border-color: rgba(220,38,38,0.5); background: rgba(220,38,38,0.08);' : 'border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.06);'}>
          <i class={`fas ${topAlert.category === 'emergency' ? 'fa-triangle-exclamation text-red-500' : 'fa-circle-info text-amber-500'} text-2xl mt-1`}></i>
          <div class="flex-1">
            <div class="eyebrow" style={topAlert.category === 'emergency' ? 'color: #DC2626;' : 'color: #D97706;'}>
              {topAlert.category === 'emergency' ? 'Emergency Alert' : 'Public Service Announcement'} · {topAlert.city}
            </div>
            <div class="font-display text-xl mt-1">{topAlert.title}</div>
            <div class="text-sm mt-1" style="color: var(--muted);">{topAlert.description}</div>
          </div>
          <button class="text-xs hover:text-gold" style="color: var(--muted);">Dismiss</button>
        </section>
      )}

      {/* ── QUICK ACTIONS ──────────────────────────────────────────── */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Quick Actions</h2>
          <span class="text-xs" style="color: var(--muted);">One-tap launchpad</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-stagger">
          {[
            { href: '/pay',     icon: 'fa-qrcode',        label: 'Scan to Pay',   sub: 'NFC + QR'        },
            { href: '/midan',   icon: 'fa-pen-to-square', label: 'New Post',      sub: n.module_square    },
            { href: '/mashahd', icon: 'fa-video',         label: 'Go Live',       sub: n.module_video     },
            { href: '/translate', icon: 'fa-language',    label: 'Translate',     sub: '200+ languages'  }
          ].map(a => (
            <a href={a.href} class="pillar-card p-4 flex items-center gap-3 group">
              <span class="avatar avatar-lg shrink-0" style="background: linear-gradient(135deg, var(--ink) 0%, var(--charcoal,#2B2B2B) 100%); color: var(--gold-light);">
                <i class={`fas ${a.icon} text-lg`}></i>
              </span>
              <span class="min-w-0">
                <span class="block font-semibold text-sm">{a.label}</span>
                <span class="block text-xs" style="color: var(--muted);">{a.sub}</span>
              </span>
              <i class="fas fa-arrow-right ms-auto text-gold opacity-0 group-hover:opacity-100 transition"></i>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOUR PILLARS ────────────────────────────────────────────── */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">The Four Pillars</h2>
          <span class="text-xs" style="color: var(--muted);">Wasl · Mashahd · Lamahat · Midan</span>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 fade-in-stagger">
          {[
            { href: '/wasl',    icon: 'fa-comments',     name: n.module_chat,   note: 'E2EE Matrix · Olm/Megolm',         color: '194,160,96'  },
            { href: '/mashahd', icon: 'fa-circle-play',  name: n.module_video,  note: 'PeerTube · WebTorrent · IPFS',    color: '142,110,44'  },
            { href: '/lamahat', icon: 'fa-images',       name: n.module_photos, note: 'IPFS-pinned · on-device NSFW',     color: '230,204,138' },
            { href: '/midan',   icon: 'fa-hashtag',      name: n.module_square, note: 'ActivityPub · Mastodon-compatible', color: '194,160,96'  }
          ].map(p => (
            <a href={p.href} class="pillar-card p-6 block relative overflow-hidden group">
              <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full transition-transform group-hover:scale-150" style={`background: radial-gradient(circle, rgba(${p.color},0.25), transparent 70%);`}></div>
              <span class="relative w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4" style="background: var(--ink); color: var(--gold-light); box-shadow: var(--shadow-md);">
                <i class={`fas ${p.icon}`}></i>
              </span>
              <span class="relative block font-display text-3xl text-gradient-gold">{p.name}</span>
              <span class="relative block text-xs mt-2" style="color: var(--muted);">{p.note}</span>
              <span class="relative inline-flex items-center gap-1 text-xs text-gold mt-3 font-semibold">
                Open <i class="fas fa-arrow-right text-[10px] transition group-hover:translate-x-1"></i>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── HAPPENING NEARBY ──────────────────────────────────────── */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Happening in {city}</h2>
          <a href="/events" class="text-xs text-gold-dark font-semibold hover:underline" style="color: var(--gold-dark);">See all events →</a>
        </div>
        <div class="h-scroll">
          {events.filter((e: any) => e.category !== 'emergency').slice(0, 6).map((e: any) => (
            <div class="min-w-[280px] pillar-card p-4 flex flex-col">
              <div class="flex items-center gap-2 mb-3">
                <span class="chip text-[10px]"><i class={`fas ${e.category === 'tech' ? 'fa-code' : e.category === 'music' ? 'fa-music' : e.category === 'sport' ? 'fa-person-running' : e.category === 'culture' ? 'fa-masks-theater' : 'fa-circle-info'}`}></i>{e.category}</span>
                <span class="text-[10px] ms-auto" style="color: var(--muted);">{new Date(e.start_time).toLocaleDateString()}</span>
              </div>
              <div class="font-display text-lg leading-snug mb-1">{e.title}</div>
              <div class="text-xs flex items-center gap-1" style="color: var(--muted);"><i class="fas fa-location-dot text-gold"></i> {e.venue}</div>
              <p class="text-xs mt-2 line-clamp-2" style="color: var(--muted);">{e.description}</p>
              <button data-action="interested" data-id={e.id} class="btn btn-ink mt-3 w-full text-xs justify-center">
                <i class="fas fa-bookmark"></i> Interested · {fmtCount(e.interested)}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR YOU + TRENDING ─────────────────────────────────────── */}
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="flex items-end justify-between mb-3">
            <h2 class="section-title font-display text-2xl">For You</h2>
            <span class="text-xs flex items-center gap-1" style="color: var(--muted);">
              <i class="fas fa-lock text-gold"></i> Ranked on your device
            </span>
          </div>
          <div class="space-y-3 fade-in-stagger">
            {posts.slice(0, 4).map((p: any) => (
              <article class="pillar-card p-5">
                <div class="flex items-start gap-3">
                  <span class="avatar avatar-md">{(p.anonymous ? '·' : (p.display_name || '?').charAt(0))}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 text-xs flex-wrap">
                      <span class="font-semibold text-base">{p.anonymous ? 'Anonymous' : p.display_name}</span>
                      {!p.anonymous && p.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
                      {!p.anonymous && <span style="color: var(--muted);">@{p.handle}</span>}
                      <span style="color: var(--muted-2);">· {timeAgo(p.created_at)}</span>
                    </div>
                    <p class="text-sm leading-relaxed whitespace-pre-line mt-2">{p.content ?? <span class="italic" style="color: var(--muted);">(empty post)</span>}</p>
                    {p.hashtags && <div class="mt-2 text-xs font-semibold" style="color: var(--gold-dark);">{p.hashtags}</div>}
                    <div class="flex gap-5 mt-3 text-xs" style="color: var(--muted);">
                      <button data-action="like-post" data-id={p.id} class="hover:text-red-500 transition"><i class="far fa-heart"></i> <span data-likes={p.id}>{fmtCount(p.likes)}</span></button>
                      <span><i class="far fa-comment"></i> {fmtCount(p.replies_count)}</span>
                      <span><i class="fas fa-retweet"></i> {fmtCount(p.reposts)}</span>
                      <span class="ms-auto"><i class="fas fa-share-nodes text-gold"></i> ActivityPub</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 class="section-title font-display text-2xl mb-3">Trending in {city}</h2>
          <ul class="space-y-2 fade-in-stagger">
            {trending.map((t: any, i: number) => (
              <li class="pillar-card p-3 flex items-center justify-between group">
                <span class="flex items-center gap-3 min-w-0">
                  <span class="font-display text-gold text-2xl w-7 leading-none">{String(i + 1).padStart(2, '0')}</span>
                  <span class="font-semibold text-sm truncate">{t.hashtags || '—'}</span>
                </span>
                <span class="text-xs whitespace-nowrap" style="color: var(--muted);">{t.cnt} posts</span>
              </li>
            ))}
          </ul>

          <div class="mt-4 pillar-card p-4">
            <div class="eyebrow mb-2">Active circles</div>
            <ul class="space-y-2">
              {circles.slice(0, 3).map((g: any) => (
                <li class="flex items-center gap-3">
                  <i class="fas fa-circle-nodes text-gold"></i>
                  <span class="flex-1 text-sm truncate">{g.name}</span>
                  <span class="text-[11px]" style="color: var(--muted);">{fmtCount(g.member_count)}</span>
                </li>
              ))}
            </ul>
            <a href="/circles" class="text-xs mt-3 inline-flex items-center gap-1 text-gold-dark font-semibold hover:underline" style="color: var(--gold-dark);">Explore circles <i class="fas fa-arrow-right text-[10px]"></i></a>
          </div>
        </div>
      </section>

      {/* ── OFFICIAL UPDATES ──────────────────────────────────────── */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Official Updates</h2>
          <a href="/channels" class="text-xs font-semibold hover:underline" style="color: var(--gold-dark);">{n.module_official} →</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 fade-in-stagger">
          {channels.map((ch: any) => (
            <a href={`/channels/${ch.slug}`} class="pillar-card p-4 flex items-center gap-3 group">
              <span class="avatar avatar-lg" style="background: linear-gradient(135deg, var(--ink), #2B2B2B); color: var(--gold-light);">
                <i class="fas fa-tower-broadcast text-lg"></i>
              </span>
              <span class="flex-1 min-w-0">
                <span class="block font-semibold text-base flex items-center gap-1">{ch.name} <span class="verified-badge"><i class="fas fa-check"></i></span></span>
                <span class="block text-xs" style="color: var(--muted);">{fmtCount(ch.subscriber_count)} subscribers · {ch.category}</span>
              </span>
              <i class="fas fa-arrow-right text-gold opacity-0 group-hover:opacity-100 transition"></i>
            </a>
          ))}
        </div>
      </section>

      {/* ── WATCH + GLIMPSES (masonry) ────────────────────────────── */}
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-end justify-between mb-4">
            <h2 class="section-title font-display text-2xl">Watch in {city}</h2>
            <a href="/mashahd" class="text-xs font-semibold hover:underline" style="color: var(--gold-dark);">{n.module_video} →</a>
          </div>
          <div class="space-y-3 fade-in-stagger">
            {videos.slice(0, 3).map((v: any) => (
              <a href="/mashahd" class="pillar-card p-3 flex gap-3 items-center group">
                <span class="w-32 video-thumb shrink-0">
                  <i class="fas fa-play"></i>
                  <span class="duration">{Math.floor(v.duration_sec/60)}:{(v.duration_sec%60).toString().padStart(2,'0')}</span>
                </span>
                <span class="flex-1 min-w-0">
                  <span class="block font-semibold text-sm leading-tight line-clamp-2">{v.title}</span>
                  <span class="block text-xs mt-1" style="color: var(--muted);">{v.display_name}</span>
                  <span class="block text-[11px] mt-1" style="color: var(--muted-2);">{fmtCount(v.views)} views · <i class="fas fa-share-nodes text-gold"></i> P2P seeded</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div class="flex items-end justify-between mb-4">
            <h2 class="section-title font-display text-2xl">Glimpses</h2>
            <a href="/lamahat" class="text-xs font-semibold hover:underline" style="color: var(--gold-dark);">{n.module_photos} →</a>
          </div>
          <div class="masonry">
            {photos.slice(0, 6).map((p: any, i: number) => {
              const h = (i % 3 === 0) ? 'h-3' : (i % 3 === 1) ? 'h-2' : 'h-1'
              return (
                <div class={`masonry-tile ${h}`} title={p.caption}>
                  <div class="flex items-start justify-between">
                    <span class="chip-dark chip text-[10px]"><i class="fas fa-camera"></i></span>
                    <span class="chip-dark chip text-[10px]"><i class="fas fa-heart"></i> {fmtCount(p.likes)}</span>
                  </div>
                  <div class="text-xs font-semibold text-[#1B1B1B]/80 line-clamp-2">{p.caption ?? ''}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SPONSORED ──────────────────────────────────────────── */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Sponsored</h2>
          <a href="/transparency" class="text-xs font-semibold hover:underline" style="color: var(--gold-dark);">Why you saw this →</a>
        </div>
        <div class="card-dark rounded-2xl p-6 relative">
          <div class="relative flex items-center gap-5">
            <span class="avatar avatar-lg" style="background: linear-gradient(135deg, var(--gold-light), var(--gold)); color: #1B1B1B;">
              <i class="fas fa-store text-xl"></i>
            </span>
            <div class="flex-1">
              <div class="eyebrow text-gold-light">Local ad · city-level only · no profiling</div>
              <div class="font-display text-2xl text-cream mt-1">El Sawy Cultural Centre — Friday night poetry</div>
              <p class="text-cream/70 text-xs mt-1 max-w-xl">You saw this because you live in {city} and ads are city-level, not user-level. No retargeting. No tracking pixels. Paid by corporate invoice.</p>
            </div>
            <a href="/transparency" class="btn btn-primary whitespace-nowrap"><i class="fas fa-eye"></i> Audit</a>
          </div>
        </div>
      </section>

    </div>,
    { title: n.nav_home, lang, country, active: 'home' }
  )
}
