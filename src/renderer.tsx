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

  // Grouped navigation — modern apps cluster modules into purposeful sections
  const navGroups = [
    {
      label: 'Discover',
      items: [
        { href: '/',         key: 'home',     label: n.nav_home,        icon: 'fa-house' },
        { href: '/events',   key: 'events',   label: 'Events',          icon: 'fa-calendar-days' },
        { href: '/apps',     key: 'apps',     label: n.nav_apps,        icon: 'fa-grid-2' }
      ]
    },
    {
      label: 'Four Pillars',
      items: [
        { href: '/wasl',     key: 'wasl',     label: n.module_chat,     icon: 'fa-comments' },
        { href: '/mashahd',  key: 'mashahd',  label: n.module_video,    icon: 'fa-circle-play' },
        { href: '/lamahat',  key: 'lamahat',  label: n.module_photos,   icon: 'fa-images' },
        { href: '/midan',    key: 'midan',    label: n.module_square,   icon: 'fa-hashtag' }
      ]
    },
    {
      label: 'Community',
      items: [
        { href: '/circles',  key: 'circles',  label: n.module_groups,       icon: 'fa-circle-nodes' },
        { href: '/channels', key: 'channels', label: n.module_official,     icon: 'fa-tower-broadcast' },
        { href: '/creators', key: 'creators', label: n.module_creators,     icon: 'fa-palette' },
        { href: '/pro',      key: 'pro',      label: n.module_professional, icon: 'fa-briefcase' }
      ]
    },
    {
      label: 'Life',
      items: [
        { href: '/rihla',    key: 'rihla',    label: n.module_travel,   icon: 'fa-plane' },
        { href: '/maps',     key: 'maps',     label: n.module_maps,     icon: 'fa-map-location-dot' },
        { href: '/pay',      key: 'pay',      label: n.module_payments, icon: 'fa-wallet' },
        { href: '/mail',     key: 'mail',     label: n.module_mail,     icon: 'fa-envelope' }
      ]
    },
    {
      label: 'AI & Privacy',
      items: [
        { href: '/aicore',   key: 'aicore',   label: n.module_aicore,     icon: 'fa-microchip' },
        { href: '/mesh',     key: 'mesh',     label: n.module_mesh,       icon: 'fa-tower-cell' },
        { href: '/translate',key: 'translate',label: n.module_translate,  icon: 'fa-language' },
        { href: '/privacy',  key: 'privacy',  label: n.module_privacy,    icon: 'fa-user-shield' },
        { href: '/aisafety', key: 'aisafety', label: n.module_aisafety,   icon: 'fa-shield-virus' },
        { href: '/backup',   key: 'backup',   label: n.module_backup,     icon: 'fa-cloud-arrow-down' }
      ]
    },
    {
      label: 'Open Source',
      items: [
        { href: '/unique',       key: 'unique',       label: n.module_unique,       icon: 'fa-wand-magic-sparkles' },
        { href: '/models',       key: 'models',       label: n.module_models,       icon: 'fa-brain' },
        { href: '/selfhost',     key: 'selfhost',     label: n.module_selfhost,     icon: 'fa-server' },
        { href: '/roadmap',      key: 'roadmap',      label: n.module_roadmap,      icon: 'fa-route' },
        { href: '/journeys',     key: 'journeys',     label: n.module_journeys,     icon: 'fa-shoe-prints' },
        { href: '/governance',   key: 'governance',   label: n.nav_governance,      icon: 'fa-scale-balanced' },
        { href: '/transparency', key: 'transparency', label: n.nav_transparency,    icon: 'fa-eye' }
      ]
    }
  ]

  return (
    <html lang={htmlLang} dir={rtl ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1B1B1B" />
        <meta name="description" content="Circle (دواير) — privacy-first AI-native super app. One app, every life. Free forever." />
        <title>{pageTitle}</title>

        {/* Restore dark-mode preference BEFORE first paint to avoid FOUC */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('circle-theme');
              if (!t) { t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
              if (t === 'dark') document.documentElement.classList.add('dark');
            } catch(e){}
          })();
        `}} />

        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&family=Cormorant+Garamond:wght@500;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  gold:       '#C2A060',
                  goldDark:   '#8E6E2C',
                  goldLight:  '#E6CC8A',
                  ink:        '#1B1B1B',
                  cream:      '#F8F2E4',
                  parchment:  '#FBF6E9',
                  charcoal:   '#2B2B2B',
                  obsidian:   '#0D0D0F'
                },
                fontFamily: {
                  display: ['Cormorant Garamond','Cairo','serif'],
                  ui:      ['Inter','Cairo','Noto Sans SC','system-ui','sans-serif']
                }
              }
            }
          }
        `}} />
      </head>
      <body class="font-ui antialiased text-[14.5px]">
        <a href="#main" class="skip-link">Skip to content</a>

        {/* ── TOP BAR ──────────────────────────────────────────────────── */}
        <header class="sticky top-0 z-40 backdrop-blur-xl no-print" style="background: rgba(251,246,233,0.78);" id="top-bar">
          <div class="absolute inset-x-0 bottom-0 h-px" style="background: linear-gradient(90deg, transparent, var(--border-strong), transparent);"></div>
          <div class="max-w-[1400px] mx-auto px-4 lg:px-6 py-3 flex items-center gap-3">

            {/* Mobile menu button */}
            <button id="mobile-menu-btn" class="btn-icon lg:hidden" aria-label="Menu">
              <i class="fas fa-bars"></i>
            </button>

            {/* Brand */}
            <a href="/" class="flex items-center gap-3 group min-w-0">
              <span class="circle-logo circle-aura"></span>
              <span class="hidden sm:flex flex-col leading-tight">
                <span class="font-display text-2xl text-gradient-gold tracking-wide">{n.brand_name}</span>
                <span class="text-[10px] uppercase tracking-[0.22em]" style="color: var(--muted);">{n.tagline}</span>
              </span>
            </a>

            <span class="flex-1"></span>

            {/* Command palette / search */}
            <button id="cmd-trigger" class="cmd-search hidden md:flex" aria-label="Search">
              <i class="fas fa-magnifying-glass text-[12px]"></i>
              <span class="flex-1 text-start">Search Circle…</span>
              <kbd>⌘K</kbd>
            </button>

            {/* Language / Country switcher */}
            <form action="/settings" method="get" class="hidden md:flex items-center gap-2">
              <select name="lang" onchange="this.form.submit()" class="input input-sm" aria-label="Language">
                {ALL_LANGS.map(l => (
                  <option value={l.code} selected={l.code === userLang}>{l.label}</option>
                ))}
              </select>
              <select name="country" onchange="this.form.submit()" class="input input-sm" aria-label="Country">
                {['EG','SA','CN','DE','FR','ES','IT','RU','IR','US','VN'].map(cc => (
                  <option value={cc} selected={cc === ctry}>{cc}</option>
                ))}
              </select>
            </form>

            {/* Dark mode toggle */}
            <button id="theme-toggle" class="btn-icon" aria-label="Toggle theme" title="Toggle theme">
              <i class="fas fa-sun" id="icon-sun"></i>
              <i class="fas fa-moon hidden" id="icon-moon"></i>
            </button>

            {/* Identity */}
            <a href="/id" class="btn-icon" aria-label="Circle ID" title={n.module_id}>
              <i class="fas fa-id-card"></i>
            </a>
          </div>
        </header>

        {/* ── LAYOUT ────────────────────────────────────────────────────── */}
        <div class="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

          {/* SIDEBAR */}
          <aside class="sidebar-desktop lg:sticky lg:top-[80px] lg:self-start lg:max-h-[calc(100vh-100px)] overflow-y-auto pb-4">
            <nav class="glass rounded-2xl py-2">
              {navGroups.map(g => (
                <div>
                  <div class="nav-group-label">{g.label}</div>
                  <ul>
                    {g.items.map(item => {
                      const isActive = item.key === active
                      return (
                        <li>
                          <a href={item.href} class={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
                            <i class={`fas ${item.icon} w-4 text-center text-[13px] ${isActive ? 'text-gold' : ''}`} style={isActive ? '' : 'color: var(--muted);'}></i>
                            <span class="flex-1 truncate">{item.label}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <a href="/covenant" class="mt-4 block card-dark p-4 text-xs leading-relaxed group">
              <div class="relative flex items-start gap-3">
                <i class="fas fa-scroll text-gold text-xl"></i>
                <div class="flex-1 min-w-0">
                  <span class="block font-display text-gold text-lg leading-tight">{n.covenant}</span>
                  <p class="text-cream/80 mt-1">$0 forever. No tracking. No targeting. No exit.</p>
                  <span class="block mt-2 text-gold/90 underline group-hover:text-gold-light">Read the eight promises →</span>
                </div>
              </div>
            </a>
          </aside>

          {/* MOBILE NAV OVERLAY */}
          <div id="mobile-nav-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden lg:hidden"></div>
          <aside id="mobile-nav" class="fixed top-0 bottom-0 start-0 w-[85%] max-w-[320px] z-50 overflow-y-auto lg:hidden" style="background: var(--bg-elev); border-inline-end: 1px solid var(--border);">
            <div class="p-4 flex items-center justify-between border-b" style="border-color: var(--border);">
              <a href="/" class="flex items-center gap-3">
                <span class="circle-logo"></span>
                <span class="font-display text-xl text-gradient-gold">{n.brand_name}</span>
              </a>
              <button id="mobile-close-btn" class="btn-icon" aria-label="Close menu"><i class="fas fa-xmark"></i></button>
            </div>
            <nav class="py-2">
              {navGroups.map(g => (
                <div>
                  <div class="nav-group-label">{g.label}</div>
                  <ul>
                    {g.items.map(item => {
                      const isActive = item.key === active
                      return (
                        <li>
                          <a href={item.href} class={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
                            <i class={`fas ${item.icon} w-4 text-center text-[13px]`} style={isActive ? 'color: var(--gold);' : 'color: var(--muted);'}></i>
                            <span class="flex-1">{item.label}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* MAIN */}
          <main id="main" class="min-w-0">{children}</main>
        </div>

        {/* ── COMMAND PALETTE MODAL ───────────────────────────────────── */}
        <div id="cmd-palette" class="fixed inset-0 z-50 hidden items-start justify-center pt-[12vh] px-4 no-print" style="background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);">
          <div class="glass-strong w-full max-w-xl overflow-hidden" style="background: var(--bg-elev);">
            <div class="flex items-center gap-3 p-4 border-b" style="border-color: var(--border);">
              <i class="fas fa-magnifying-glass text-gold"></i>
              <input id="cmd-input" type="text" placeholder="Jump to a page or feature…" class="flex-1 bg-transparent outline-none text-base" autocomplete="off" />
              <kbd class="text-[10px] px-2 py-1 rounded border" style="border-color: var(--border); color: var(--muted);">ESC</kbd>
            </div>
            <ul id="cmd-results" class="max-h-[60vh] overflow-y-auto p-2 text-sm"></ul>
            <div class="px-4 py-2 text-[11px] flex items-center gap-3 border-t" style="border-color: var(--border); color: var(--muted);">
              <span><kbd class="text-[10px]">↑↓</kbd> navigate</span>
              <span><kbd class="text-[10px]">↵</kbd> open</span>
              <span class="ms-auto">Local search · nothing is logged</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer class="mt-12 border-t no-print" style="border-color: var(--border); background: var(--surface);">
          <div class="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="circle-logo-sm circle-logo"></span>
                <span class="font-display text-xl text-gradient-gold">{n.brand_name}</span>
              </div>
              <p style="color: var(--muted);">A single binary, federated by design. Free in perpetuity, owned by no one, governed by everyone.</p>
            </div>
            <div>
              <div class="eyebrow mb-2">Architecture</div>
              <ul class="space-y-1" style="color: var(--muted);">
                <li>Matrix · Olm/Megolm E2EE</li>
                <li>ActivityPub federation</li>
                <li>IPFS · WebTorrent</li>
                <li>On-device ONNX AI</li>
              </ul>
            </div>
            <div>
              <div class="eyebrow mb-2">Region</div>
              <ul class="space-y-1" style="color: var(--muted);">
                <li><i class="fas fa-globe text-gold"></i> {ctry} → <strong>{planeFor(ctry).toUpperCase()}</strong> plane</li>
                <li><i class="fas fa-shield-halved text-gold"></i> Data stays on your device</li>
                <li><i class="fas fa-dollar-sign text-gold"></i> $0 forever · no billing</li>
              </ul>
            </div>
            <div>
              <div class="eyebrow mb-2">Open</div>
              <ul class="space-y-1">
                <li><a href="/covenant" class="hover:text-gold">{n.covenant}</a></li>
                <li><a href="/governance" class="hover:text-gold">{n.nav_governance}</a></li>
                <li><a href="/transparency" class="hover:text-gold">{n.nav_transparency}</a></li>
                <li><a href="/selfhost" class="hover:text-gold">{n.module_selfhost}</a></li>
                <li><a href="/roadmap" class="hover:text-gold">{n.module_roadmap}</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t py-3 text-[11px] text-center" style="border-color: var(--border); color: var(--muted);">
            Apache 2.0 · Open Source · Federated · P2P · &copy; {new Date().getFullYear()} the community
          </div>
        </footer>

        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
