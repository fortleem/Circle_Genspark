// Circle — JSON API for all modules
// Frontend pages render server-side; this layer powers any AJAX interactions
// (likes, posts, payments, RSVPs, region config, name matrix).

import { Hono } from 'hono'
import { all, first, run, type Env } from '../db'
import { configFor, planeFor, KNOWN_COUNTRIES } from '../dre'
import { getNames, ALL_LANGS } from '../i18n'

export const api = new Hono<{ Bindings: Env }>()

// ────────────────────────────────────────────────────────────────────────────
// HEALTH / META
// ────────────────────────────────────────────────────────────────────────────
api.get('/health', (c) => c.json({ ok: true, service: 'circle-webapp', ts: Date.now() }))

api.get('/names', (c) => {
  const lang = c.req.query('lang') ?? 'en-BRAND'
  return c.json({ lang, names: getNames(lang), langs: ALL_LANGS })
})

// ────────────────────────────────────────────────────────────────────────────
// DYNAMIC REGIONAL ENGINE (DRE)
// ────────────────────────────────────────────────────────────────────────────
api.get('/region', (c) => {
  const country = (c.req.query('country') ?? c.req.header('cf-ipcountry') ?? 'EG').toUpperCase()
  const cfg = configFor(country)
  return c.json({ ...cfg, generated_at: new Date().toISOString(), known_countries: KNOWN_COUNTRIES })
})

api.get('/region/plane/:country', (c) => {
  return c.json({ country: c.req.param('country'), plane: planeFor(c.req.param('country')) })
})

// ────────────────────────────────────────────────────────────────────────────
// USERS / CIRCLE ID
// ────────────────────────────────────────────────────────────────────────────
api.get('/users', async (c) => {
  const users = await all(c.env.DB, 'SELECT id, handle, matrix_id, display_name, country, city, verified, verified_claim FROM users ORDER BY id')
  return c.json({ users })
})

api.get('/users/:handle', async (c) => {
  const user = await first(c.env.DB, 'SELECT * FROM users WHERE handle = ?', c.req.param('handle'))
  if (!user) return c.json({ error: 'not_found' }, 404)
  return c.json({ user })
})

// ────────────────────────────────────────────────────────────────────────────
// MIDAN (Square) — posts CRUD
// ────────────────────────────────────────────────────────────────────────────
api.get('/midan/posts', async (c) => {
  const city = c.req.query('city')
  const sql = city
    ? 'SELECT p.*, u.handle, u.display_name, u.verified FROM posts p JOIN users u ON u.id=p.author_id WHERE p.city = ? ORDER BY p.created_at DESC LIMIT 50'
    : 'SELECT p.*, u.handle, u.display_name, u.verified FROM posts p JOIN users u ON u.id=p.author_id ORDER BY p.created_at DESC LIMIT 50'
  const posts = city ? await all(c.env.DB, sql, city) : await all(c.env.DB, sql)
  return c.json({ posts })
})

api.post('/midan/posts', async (c) => {
  const body = await c.req.json<{ author_id: number; content: string; hashtags?: string; city?: string; anonymous?: number }>()
  if (!body.content || body.content.length > 500) return c.json({ error: 'invalid_content' }, 400)
  const r = await run(c.env.DB,
    'INSERT INTO posts (author_id, content, hashtags, city, anonymous) VALUES (?, ?, ?, ?, ?)',
    body.author_id ?? 1, body.content, body.hashtags ?? null, body.city ?? null, body.anonymous ?? 0)
  return c.json({ ok: true, id: r.meta?.last_row_id })
})

api.post('/midan/posts/:id/like', async (c) => {
  const id = c.req.param('id')
  await run(c.env.DB, 'UPDATE posts SET likes = likes + 1 WHERE id = ?', id)
  const post = await first<{ likes: number }>(c.env.DB, 'SELECT likes FROM posts WHERE id = ?', id)
  return c.json({ ok: true, likes: post?.likes ?? 0 })
})

// ────────────────────────────────────────────────────────────────────────────
// WASL (Chat) — rooms + messages
// ────────────────────────────────────────────────────────────────────────────
api.get('/wasl/rooms', async (c) => {
  const rooms = await all(c.env.DB, `
    SELECT r.*, (SELECT body FROM messages m WHERE m.room_id = r.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
           (SELECT created_at FROM messages m WHERE m.room_id = r.id ORDER BY m.created_at DESC LIMIT 1) AS last_at
    FROM rooms r ORDER BY last_at DESC NULLS LAST, r.created_at DESC`)
  return c.json({ rooms })
})

api.get('/wasl/rooms/:id/messages', async (c) => {
  const id = c.req.param('id')
  const messages = await all(c.env.DB, `
    SELECT m.*, u.handle, u.display_name FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.room_id = ? ORDER BY m.created_at ASC LIMIT 200`, id)
  return c.json({ room_id: id, messages })
})

api.post('/wasl/rooms/:id/messages', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ sender_id: number; body: string }>()
  if (!body.body || !body.sender_id) return c.json({ error: 'invalid' }, 400)
  const msgId = 'm' + Date.now().toString(36)
  await run(c.env.DB,
    'INSERT INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES (?, ?, ?, ?, 3, 1)',
    msgId, id, body.sender_id, body.body)
  return c.json({ ok: true, id: msgId })
})

// ────────────────────────────────────────────────────────────────────────────
// MASHAHD (Video)
// ────────────────────────────────────────────────────────────────────────────
api.get('/mashahd/videos', async (c) => {
  const videos = await all(c.env.DB,
    'SELECT v.*, u.handle, u.display_name, u.verified FROM videos v JOIN users u ON u.id=v.uploader_id ORDER BY v.published_at DESC LIMIT 50')
  return c.json({ videos })
})

api.post('/mashahd/videos/:id/view', async (c) => {
  await run(c.env.DB, 'UPDATE videos SET views = views + 1 WHERE id = ?', c.req.param('id'))
  return c.json({ ok: true })
})

api.post('/mashahd/videos/:id/like', async (c) => {
  await run(c.env.DB, 'UPDATE videos SET likes = likes + 1 WHERE id = ?', c.req.param('id'))
  return c.json({ ok: true })
})

// ────────────────────────────────────────────────────────────────────────────
// LAMAHAT (Photos)
// ────────────────────────────────────────────────────────────────────────────
api.get('/lamahat/photos', async (c) => {
  const photos = await all(c.env.DB,
    'SELECT p.*, u.handle, u.display_name FROM photos p JOIN users u ON u.id=p.uploader_id ORDER BY p.published_at DESC LIMIT 60')
  return c.json({ photos })
})

api.post('/lamahat/photos/:id/like', async (c) => {
  await run(c.env.DB, 'UPDATE photos SET likes = likes + 1 WHERE id = ?', c.req.param('id'))
  return c.json({ ok: true })
})

// ────────────────────────────────────────────────────────────────────────────
// CIRCLES (Groups), CHANNELS
// ────────────────────────────────────────────────────────────────────────────
api.get('/circles', async (c) => {
  const circles = await all(c.env.DB, 'SELECT * FROM circles ORDER BY member_count DESC')
  return c.json({ circles })
})

api.get('/channels', async (c) => {
  const type = c.req.query('type')
  const sql = type
    ? 'SELECT * FROM channels WHERE channel_type = ? ORDER BY subscriber_count DESC'
    : 'SELECT * FROM channels ORDER BY subscriber_count DESC'
  const channels = type ? await all(c.env.DB, sql, type) : await all(c.env.DB, sql)
  return c.json({ channels })
})

api.get('/channels/:slug/posts', async (c) => {
  const ch = await first<{ id: number }>(c.env.DB, 'SELECT id FROM channels WHERE slug = ?', c.req.param('slug'))
  if (!ch) return c.json({ error: 'not_found' }, 404)
  const posts = await all(c.env.DB, 'SELECT * FROM channel_posts WHERE channel_id = ? ORDER BY created_at DESC', ch.id)
  return c.json({ posts })
})

// ────────────────────────────────────────────────────────────────────────────
// PRO NETWORK
// ────────────────────────────────────────────────────────────────────────────
api.get('/pro/jobs', async (c) => {
  const jobs = await all(c.env.DB, `
    SELECT j.*, u.display_name AS posted_by_name FROM pro_jobs j
    LEFT JOIN users u ON u.id = j.posted_by ORDER BY j.created_at DESC`)
  return c.json({ jobs })
})

api.get('/pro/profiles', async (c) => {
  const profiles = await all(c.env.DB, `
    SELECT p.*, u.handle, u.display_name, u.city, u.country FROM pro_profiles p
    JOIN users u ON u.id = p.user_id ORDER BY p.user_id`)
  return c.json({ profiles })
})

// ────────────────────────────────────────────────────────────────────────────
// CIRCLE TRAVEL (Rihla) — itinerary stub (would call GROQ on real backend)
// ────────────────────────────────────────────────────────────────────────────
api.post('/rihla/itinerary', async (c) => {
  const body = await c.req.json<{ city: string; days: number; interests: string[]; user_id?: number }>()
  // Deterministic mock plan so the page works without a paid AI key
  const interests = (body.interests ?? []).join(', ') || 'general'
  const plan: any = {}
  for (let d = 1; d <= Math.min(7, body.days ?? 1); d++) {
    plan[`day${d}`] = {
      morning:    `Walk a landmark of ${body.city} themed around ${interests.split(',')[0] ?? 'culture'}`,
      lunch:      `Family-run restaurant — try a regional dish in ${body.city}`,
      afternoon:  `Visit a museum or open market`,
      dinner:     `Sunset rooftop dinner with local music`
    }
  }
  const r = await run(c.env.DB,
    'INSERT INTO travel_itineraries (user_id, city, days, interests, plan_json) VALUES (?, ?, ?, ?, ?)',
    body.user_id ?? 1, body.city, body.days, interests, JSON.stringify(plan))
  return c.json({ ok: true, id: r.meta?.last_row_id, city: body.city, days: body.days, plan })
})

api.get('/rihla/itineraries', async (c) => {
  const items = await all(c.env.DB, 'SELECT * FROM travel_itineraries ORDER BY created_at DESC LIMIT 30')
  return c.json({ items: items.map(i => ({ ...i, plan_json: JSON.parse(i.plan_json) })) })
})

// ────────────────────────────────────────────────────────────────────────────
// CIRCLE PAYMENTS (Nat)
// ────────────────────────────────────────────────────────────────────────────
api.get('/pay/wallet/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const wallet = await first(c.env.DB, 'SELECT * FROM wallets WHERE user_id = ?', uid)
  const txns = await all(c.env.DB,
    `SELECT t.*, uf.display_name AS from_name, ut.display_name AS to_name
     FROM transactions t
     LEFT JOIN users uf ON uf.id=t.from_user
     LEFT JOIN users ut ON ut.id=t.to_user
     WHERE t.from_user = ? OR t.to_user = ? ORDER BY t.created_at DESC LIMIT 30`, uid, uid)
  return c.json({ wallet, transactions: txns })
})

api.post('/pay/send', async (c) => {
  const body = await c.req.json<{ from_user: number; to_handle: string; amount: number; method?: string; note?: string }>()
  const to = await first<{ id: number }>(c.env.DB, 'SELECT id FROM users WHERE handle = ?', body.to_handle)
  if (!to) return c.json({ error: 'recipient_not_found' }, 404)
  const from = await first<{ balance: number; currency: string }>(c.env.DB, 'SELECT balance, currency FROM wallets WHERE user_id = ?', body.from_user)
  if (!from) return c.json({ error: 'no_wallet' }, 404)
  if (from.balance < body.amount) return c.json({ error: 'insufficient_funds' }, 400)
  await run(c.env.DB, 'UPDATE wallets SET balance = balance - ? WHERE user_id = ?', body.amount, body.from_user)
  await run(c.env.DB, 'UPDATE wallets SET balance = balance + ? WHERE user_id = ?', body.amount, to.id)
  const r = await run(c.env.DB,
    `INSERT INTO transactions (from_user, to_user, amount, currency, method, status, note)
     VALUES (?, ?, ?, ?, ?, 'completed', ?)`,
    body.from_user, to.id, body.amount, from.currency, body.method ?? 'handle', body.note ?? null)
  return c.json({ ok: true, id: r.meta?.last_row_id, fee: 0, currency: from.currency })
})

// ────────────────────────────────────────────────────────────────────────────
// CIRCLE MAIL
// ────────────────────────────────────────────────────────────────────────────
api.get('/mail/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const folder = c.req.query('folder') ?? 'inbox'
  const messages = await all(c.env.DB,
    'SELECT * FROM mail_messages WHERE user_id = ? AND folder = ? ORDER BY created_at DESC LIMIT 50', uid, folder)
  return c.json({ folder, messages })
})

// ────────────────────────────────────────────────────────────────────────────
// EVENTS (Home dashboard "Happening Nearby")
// ────────────────────────────────────────────────────────────────────────────
api.get('/events', async (c) => {
  const city = c.req.query('city') ?? 'Cairo'
  const events = await all(c.env.DB,
    'SELECT * FROM events WHERE city = ? ORDER BY priority DESC, start_time ASC LIMIT 20', city)
  return c.json({ city, events })
})

api.post('/events/:id/interested', async (c) => {
  await run(c.env.DB, 'UPDATE events SET interested = interested + 1 WHERE id = ?', c.req.param('id'))
  return c.json({ ok: true })
})

// ────────────────────────────────────────────────────────────────────────────
// GOVERNANCE & TRANSPARENCY
// ────────────────────────────────────────────────────────────────────────────
api.get('/governance/proposals', async (c) => {
  const proposals = await all(c.env.DB, 'SELECT * FROM governance_proposals ORDER BY created_at DESC')
  return c.json({ proposals })
})

api.post('/governance/proposals/:id/vote', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ vote: 'yes' | 'no' }>()
  const col = body.vote === 'no' ? 'votes_no' : 'votes_yes'
  await run(c.env.DB, `UPDATE governance_proposals SET ${col} = ${col} + 1 WHERE id = ?`, id)
  return c.json({ ok: true })
})

api.get('/transparency/ledger', async (c) => {
  const rows = await all(c.env.DB, 'SELECT * FROM ad_revenue_ledger ORDER BY month DESC, amount_usd DESC')
  const total = rows.reduce((s, r: any) => s + r.amount_usd, 0)
  const byAlloc: Record<string, number> = {}
  rows.forEach((r: any) => { byAlloc[r.allocation] = (byAlloc[r.allocation] ?? 0) + r.amount_usd })
  return c.json({ rows, total, by_allocation: byAlloc })
})

// ────────────────────────────────────────────────────────────────────────────
// MINI APPS
// ────────────────────────────────────────────────────────────────────────────
api.get('/apps', async (c) => {
  const apps = await all(c.env.DB, 'SELECT * FROM mini_apps ORDER BY install_count DESC')
  return c.json({ apps })
})

// ────────────────────────────────────────────────────────────────────────────
// UNIVERSAL TRANSLATION (stub — on-device in real client)
// ────────────────────────────────────────────────────────────────────────────
api.post('/translate', async (c) => {
  const body = await c.req.json<{ text: string; to: string; from?: string }>()
  // Deterministic stub: in production this runs on-device with NLLB-200
  return c.json({
    ok: true,
    from: body.from ?? 'auto',
    to: body.to,
    original: body.text,
    translated: `[${body.to}] ${body.text}`,
    model: 'Xenova/nllb-200-distilled-600M (on-device)'
  })
})
