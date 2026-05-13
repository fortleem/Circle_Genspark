// Circle (دواير) — AI-native super app. Web companion.
// Entry point: routes language/country preference cookies, mounts pages + API.

import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { renderer } from './renderer'
import type { Env } from './db'

import { api } from './routes/api'
import { homePage } from './pages/home'
import { waslPage } from './pages/wasl'
import { mashahdPage } from './pages/mashahd'
import { lamahatPage } from './pages/lamahat'
import { midanPage } from './pages/midan'
import { circlesPage } from './pages/circles'
import { channelsPage, channelDetailPage } from './pages/channels'
import { proPage } from './pages/pro'
import { rihlaPage } from './pages/rihla'
import { mailPage } from './pages/mail'
import { payPage } from './pages/pay'
import { appsPage } from './pages/apps'
import { governancePage } from './pages/governance'
import { transparencyPage } from './pages/transparency'
import { covenantPage, idPage, settingsPage, eventsPage } from './pages/static_pages'

const app = new Hono<{ Bindings: Env }>()

// ── Preference middleware (lang + country via cookie/query) ───────────────
app.use('*', async (c, next) => {
  const q = c.req.query()
  let lang = q.lang ?? getCookie(c, 'lang') ?? 'en-BRAND'
  let country = (q.country ?? getCookie(c, 'country') ?? c.req.header('cf-ipcountry') ?? 'EG').toUpperCase()
  // Persist if changed via query
  if (q.lang)    setCookie(c, 'lang', q.lang, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  if (q.country) setCookie(c, 'country', country, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  c.set('lang' as any, lang)
  c.set('country' as any, country)
  await next()
})

app.use(renderer)

// ── API ────────────────────────────────────────────────────────────────────
app.route('/api', api)

// ── Pages ──────────────────────────────────────────────────────────────────
const langOf  = (c: any) => c.get('lang')    as string
const ctryOf  = (c: any) => c.get('country') as string

app.get('/',              (c) => homePage(c, langOf(c), ctryOf(c)))
app.get('/wasl',          (c) => waslPage(c, langOf(c), ctryOf(c)))
app.get('/mashahd',       (c) => mashahdPage(c, langOf(c), ctryOf(c)))
app.get('/lamahat',       (c) => lamahatPage(c, langOf(c), ctryOf(c)))
app.get('/midan',         (c) => midanPage(c, langOf(c), ctryOf(c)))
app.get('/circles',       (c) => circlesPage(c, langOf(c), ctryOf(c)))
app.get('/channels',      (c) => channelsPage(c, langOf(c), ctryOf(c), 'official'))
app.get('/creators',      (c) => channelsPage(c, langOf(c), ctryOf(c), 'creator'))
app.get('/channels/:slug',(c) => channelDetailPage(c, langOf(c), ctryOf(c), c.req.param('slug')))
app.get('/pro',           (c) => proPage(c, langOf(c), ctryOf(c)))
app.get('/rihla',         (c) => rihlaPage(c, langOf(c), ctryOf(c)))
app.get('/mail',          (c) => mailPage(c, langOf(c), ctryOf(c)))
app.get('/pay',           (c) => payPage(c, langOf(c), ctryOf(c)))
app.get('/apps',          (c) => appsPage(c, langOf(c), ctryOf(c)))
app.get('/governance',    (c) => governancePage(c, langOf(c), ctryOf(c)))
app.get('/transparency',  (c) => transparencyPage(c, langOf(c), ctryOf(c)))
app.get('/covenant',      (c) => covenantPage(c, langOf(c), ctryOf(c)))
app.get('/id',            (c) => idPage(c, langOf(c), ctryOf(c)))
app.get('/settings',      (c) => settingsPage(c, langOf(c), ctryOf(c)))
app.get('/events',        (c) => eventsPage(c, langOf(c), ctryOf(c)))

app.notFound((c) => c.render(
  <div class="text-center py-20">
    <div class="circle-logo circle-logo-xl mx-auto"></div>
    <h1 class="font-display text-3xl mt-4">Page not found</h1>
    <p class="text-charcoal/60 text-sm mt-2">The Circle is closed at this point.</p>
    <a href="/" class="inline-block mt-4 bg-ink text-gold px-4 py-2 rounded-lg text-sm font-semibold">Back home</a>
  </div>,
  { title: '404' }
))

export default app
