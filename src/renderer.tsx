import { jsxRenderer } from 'hono/jsx-renderer'
import { getNames, isRTL, ALL_LANGS, type Lang } from './i18n'
import { planeFor } from './dre'

declare module 'hono' {
  interface ContextRenderer {
    (content: any, props?: { title?: string; lang?: string; country?: string; active?: string }): Response
  }
}

export const renderer = jsxRenderer(({ children, title, lang, country, active }) => {
  const userLang = (lang ?? 'en-BRAND') as Lang
  const rtl = isRTL(userLang)
  const n = getNames(userLang)
  const htmlLang = userLang === 'en-BRAND' ? 'en' : userLang
  const pageTitle = title ? `${title} — ${n.brand_name}` : `${n.brand_name} — ${n.tagline}`
  const ctry = country ?? 'EG'

  const nav = [
    { href: '/',             key: 'home',         label: n.nav_home,            icon: 'fa-house' },
    { href: '/wasl',         key: 'wasl',         label: n.module_chat,         icon: 'fa-comments' },
    { href: '/mashahd',      key: 'mashahd',      label: n.module_video,        icon: 'fa-circle-play' },
    { href: '/lamahat',      key: 'lamahat',      label: n.module_photos,       icon: 'fa-image' },
    { href: '/midan',        key: 'midan',        label: n.module_square,       icon: 'fa-hashtag' },
    { href: '/circles',      key: 'circles',      label: n.module_groups,       icon: 'fa-circle-nodes' },
    { href: '/channels',     key: 'channels',     label: n.module_official,     icon: 'fa-tower-broadcast' },
    { href: '/creators',     key: 'creators',     label: n.module_creators,     icon: 'fa-palette' },
    { href: '/pro',          key: 'pro',          label: n.module_professional, icon: 'fa-briefcase' },
    { href: '/rihla',        key: 'rihla',        label: n.module_travel,       icon: 'fa-plane' },
    { href: '/mail',         key: 'mail',         label: n.module_mail,         icon: 'fa-envelope' },
    { href: '/pay',          key: 'pay',          label: n.module_payments,     icon: 'fa-wallet' },
    { href: '/apps',         key: 'apps',         label: n.nav_apps,            icon: 'fa-th-large' },
    { href: '/governance',   key: 'governance',   label: n.nav_governance,      icon: 'fa-scale-balanced' },
    { href: '/transparency', key: 'transparency', label: n.nav_transparency,    icon: 'fa-eye' }
  ]

  return (
    <html lang={htmlLang} dir={rtl ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Circle (دواير) — privacy-first AI-native super app. One app, every life. Free forever." />
        <title>{pageTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&family=Cormorant+Garamond:wght@500;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  gold:       '#C2A060',
                  goldDark:   '#8E6E2C',
                  goldLight:  '#E6CC8A',
                  ink:        '#1B1B1B',
                  cream:      '#F8F2E4',
                  parchment:  '#FBF6E9',
                  charcoal:   '#2B2B2B'
                },
                fontFamily: {
                  display: ['Cormorant Garamond','Cairo','serif'],
                  ui:      ['Cairo','Noto Sans SC','system-ui','sans-serif']
                }
              }
            }
          }
        `}} />
      </head>
      <body class="bg-parchment text-ink font-ui antialiased min-h-screen">

        {/* TOP BAR */}
        <header class="bg-ink text-cream shadow-md sticky top-0 z-40">
          <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <a href="/" class="flex items-center gap-3 group">
              <span class="circle-logo">
                <span class="quad q1"></span>
                <span class="quad q2"></span>
                <span class="quad q3"></span>
                <span class="quad q4"></span>
              </span>
              <span class="flex flex-col leading-tight">
                <span class="font-display text-2xl text-gold tracking-wide">{n.brand_name}</span>
                <span class="text-[10px] uppercase tracking-[0.25em] text-cream/60">{n.tagline}</span>
              </span>
            </a>

            <div class="flex-1"></div>

            <form action="/settings" method="get" class="hidden md:flex items-center gap-2 text-xs">
              <span class="text-cream/60"><i class="fas fa-globe mr-1"></i>{ctry}</span>
              <select name="lang" onchange="this.form.submit()" class="bg-charcoal text-cream rounded px-2 py-1 border border-gold/30 text-xs">
                {ALL_LANGS.map(l => (
                  <option value={l.code} selected={l.code === userLang}>{l.label}</option>
                ))}
              </select>
              <select name="country" onchange="this.form.submit()" class="bg-charcoal text-cream rounded px-2 py-1 border border-gold/30 text-xs">
                {['EG','SA','CN','DE','FR','ES','IT','RU','IR','US','VN'].map(cc => (
                  <option value={cc} selected={cc === ctry}>{cc}</option>
                ))}
              </select>
            </form>

            <a href="/id" class="text-xs text-cream/80 hover:text-gold flex items-center gap-1">
              <i class="fas fa-id-card"></i>
              <span class="hidden sm:inline">{n.module_id}</span>
            </a>
          </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

          {/* SIDEBAR NAV */}
          <aside class="lg:sticky lg:top-[80px] lg:self-start">
            <nav class="bg-cream border border-gold/20 rounded-2xl shadow-sm overflow-hidden">
              <ul class="divide-y divide-gold/10">
                {nav.map(item => {
                  const isActive = item.key === active
                  return (
                    <li>
                      <a href={item.href}
                         class={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${isActive ? 'bg-gold/15 text-goldDark font-semibold' : 'hover:bg-gold/5 text-ink'}`}>
                        <i class={`fas ${item.icon} w-5 text-center ${isActive ? 'text-gold' : 'text-gold/70'}`}></i>
                        <span class="flex-1">{item.label}</span>
                        {isActive && <i class="fas fa-circle text-[6px] text-gold"></i>}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <a href="/covenant" class="mt-4 block bg-ink text-cream rounded-2xl p-4 text-xs leading-relaxed border border-gold/20 hover:border-gold/60 transition">
              <span class="block font-display text-gold text-lg mb-1">{n.covenant}</span>
              "$0 forever. No tracking. No targeting. No exit." <span class="block mt-2 text-gold/80 underline">Read →</span>
            </a>
          </aside>

          {/* MAIN */}
          <main class="min-w-0">{children}</main>
        </div>

        <footer class="border-t border-gold/20 bg-cream/60 mt-12">
          <div class="max-w-7xl mx-auto px-4 py-6 text-xs text-charcoal/70 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span class="font-display text-gold text-base">{n.brand_name}</span>
            <span>Apache 2.0 · Open Source · Federated · P2P</span>
            <span><i class="fas fa-shield-halved text-gold"></i> Data stays on your device</span>
            <span><i class="fas fa-network-wired text-gold"></i> {ctry} → {planeFor(ctry).toUpperCase()} plane</span>
            <span class="flex-1"></span>
            <a href="/covenant" class="hover:text-gold">{n.covenant}</a>
            <a href="/governance" class="hover:text-gold">{n.nav_governance}</a>
            <a href="/transparency" class="hover:text-gold">{n.nav_transparency}</a>
          </div>
        </footer>

        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})


