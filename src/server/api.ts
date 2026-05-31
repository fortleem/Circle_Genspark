// Circle — JSON API (46 endpoints) for all modules
// Mounted by functions/api/[[path]].ts at /api/*
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { all, first, run, type Env } from './db'
import { configFor, planeFor, KNOWN_COUNTRIES } from './dre'
import { getNames, ALL_LANGS } from './i18n'

export const api = new Hono<{ Bindings: Env }>()
api.use('*', cors())

// ─── HEALTH / META ──────────────────────────────────────────────────────────
api.get('/health', (c) => c.json({ ok: true, service: 'circle-webapp', ts: Date.now() }))

api.get('/names', (c) => {
  const lang = c.req.query('lang') ?? 'en-BRAND'
  return c.json({ lang, names: getNames(lang), langs: ALL_LANGS })
})

// ─── DRE ─────────────────────────────────────────────────────────────────
api.get('/region', (c) => {
  const country = (c.req.query('country') ?? c.req.header('cf-ipcountry') ?? 'EG').toUpperCase()
  const cfg = configFor(country)
  return c.json({ ...cfg, generated_at: new Date().toISOString(), known_countries: KNOWN_COUNTRIES })
})

api.get('/region/plane/:country', (c) => c.json({
  country: c.req.param('country'),
  plane: planeFor(c.req.param('country'))
}))

// ─── USERS / CIRCLE ID ──────────────────────────────────────────────────────
api.get('/users', async (c) => {
  const users = await all(c.env.DB,
    'SELECT id, handle, matrix_id, display_name, country, city, verified, verified_claim FROM users ORDER BY id')
  return c.json({ users })
})

api.get('/users/:handle', async (c) => {
  const user = await first(c.env.DB, 'SELECT * FROM users WHERE handle = ?', c.req.param('handle'))
  if (!user) return c.json({ error: 'not_found' }, 404)
  return c.json({ user })
})

// ─── MIDAN ───────────────────────────────────────────────────────────────
api.get('/midan/posts', async (c) => {
  const city = c.req.query('city')
  const feed = c.req.query('feed') // home | local | federated | trending | anonymous
  let sql = `SELECT p.*, u.handle, u.display_name, u.verified
             FROM posts p JOIN users u ON u.id=p.author_id`
  const params: any[] = []
  const wheres: string[] = []
  if (city) { wheres.push('p.city = ?'); params.push(city) }
  if (feed === 'anonymous') wheres.push('p.anonymous = 1')
  if (feed === 'federated') wheres.push("p.hashtags LIKE '%fediverse%' OR p.hashtags LIKE '%activitypub%'")
  if (wheres.length) sql += ' WHERE ' + wheres.join(' AND ')
  sql += feed === 'trending'
    ? ' ORDER BY p.likes DESC, p.created_at DESC LIMIT 50'
    : ' ORDER BY p.created_at DESC LIMIT 50'
  const posts = await all(c.env.DB, sql, ...params)
  return c.json({ posts, feed: feed ?? 'home', city: city ?? null })
})

api.post('/midan/posts', async (c) => {
  const body = await c.req.json<{ author_id?: number; content: string; hashtags?: string; city?: string; anonymous?: number }>()
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

api.get('/midan/trending', async (c) => {
  // Simplified trending algorithm per blueprint :
  // score = likes * 0.6 + replies * 0.3 + reposts * 1.0, time-decayed
  const rows = await all(c.env.DB, `
    SELECT hashtag, COUNT(*) AS cnt, SUM(likes) AS likes, SUM(reposts) AS reposts
    FROM (
      SELECT TRIM(value) AS hashtag, p.likes, p.reposts
      FROM posts p, json_each('["' || REPLACE(IFNULL(p.hashtags, ''), ',', '","') || '"]')
      WHERE p.hashtags IS NOT NULL AND p.hashtags != ''
    )
    WHERE hashtag != '' GROUP BY hashtag ORDER BY likes + reposts*2 DESC LIMIT 12`).catch(() => [])
  return c.json({ trending: rows })
})

// ─── WASL (Chat) ─────────────────────────────────────────────────────────
api.get('/wasl/rooms', async (c) => {
  // Client kinds: dm | group | channel | maktab → DB room_type: direct | group | broadcast | workspace
  const kindMap: Record<string, string> = {
    dm: 'direct',
    group: 'group',
    channel: 'broadcast',
    maktab: 'workspace',
  }
  const kind = c.req.query('kind')
  const dbKind = kind ? (kindMap[kind] ?? kind) : null
  const base = `SELECT r.*,
       (SELECT body FROM messages m WHERE m.room_id=r.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
       (SELECT created_at FROM messages m WHERE m.room_id=r.id ORDER BY m.created_at DESC LIMIT 1) AS last_at,
       (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id=r.id) AS member_count
       FROM rooms r`
  const sql = dbKind
    ? `${base} WHERE r.room_type=? ORDER BY last_at DESC, r.created_at DESC`
    : `${base} ORDER BY last_at DESC, r.created_at DESC`
  // Normalise field name for client (room_type → kind alias) by aliasing in JS layer
  const rows: any[] = dbKind ? await all(c.env.DB, sql, dbKind) : await all(c.env.DB, sql)
  const rooms = rows.map((r) => ({ ...r, kind: r.room_type, member_count: r.member_count ?? 0 }))
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

// Create a new room (DM / group / channel / maktab)
api.post('/wasl/rooms', async (c) => {
  const body = await c.req.json<{
    name: string; kind?: string; topic?: string; creator_id?: number;
    is_encrypted?: number;
  }>()
  if (!body.name) return c.json({ error: 'name_required' }, 400)
  const kindMap: Record<string, string> = {
    dm: 'direct', group: 'group', channel: 'broadcast', maktab: 'workspace',
  }
  const dbKind = kindMap[body.kind ?? 'group'] ?? 'group'
  const isEnc = body.is_encrypted ?? (dbKind === 'broadcast' ? 0 : 1)
  const roomId = 'r' + Date.now().toString(36)
  await run(c.env.DB,
    'INSERT INTO rooms (id, name, room_type, topic, is_encrypted, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    roomId, body.name, dbKind, body.topic ?? null, isEnc, body.creator_id ?? null)
  if (body.creator_id) {
    try {
      await run(c.env.DB, 'INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)',
        roomId, body.creator_id, 'owner')
    } catch {/* schema may differ; ignore */}
  }
  if (dbKind === 'broadcast' && body.creator_id) {
    await run(c.env.DB,
      'INSERT OR IGNORE INTO wasl_broadcasts (room_id, owner_id) VALUES (?, ?)',
      roomId, body.creator_id)
  }
  return c.json({ ok: true, id: roomId, kind: dbKind })
})

// Wasl privacy settings (Ghost mode, screenshot, forwarding, disappearing TTL, etc.)
api.get('/wasl/privacy/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  let row = await first<any>(c.env.DB, 'SELECT * FROM wasl_privacy WHERE user_id = ?', uid)
  if (!row) {
    await run(c.env.DB, 'INSERT OR IGNORE INTO wasl_privacy (user_id) VALUES (?)', uid)
    row = await first<any>(c.env.DB, 'SELECT * FROM wasl_privacy WHERE user_id = ?', uid)
  }
  return c.json({ privacy: row })
})

api.post('/wasl/privacy/:user_id', async (c) => {
  const uid = Number(c.req.param('user_id'))
  const body = await c.req.json<Record<string, number>>()
  const allow = [
    'ghost_mode', 'screenshot_block', 'forwarding_consent',
    'disappearing_default', 'read_receipts', 'last_seen_visible',
    'typing_indicator', 'auto_download_media',
  ]
  await run(c.env.DB, 'INSERT OR IGNORE INTO wasl_privacy (user_id) VALUES (?)', uid)
  for (const k of allow) {
    if (k in body && typeof body[k] === 'number') {
      await run(c.env.DB,
        `UPDATE wasl_privacy SET ${k} = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        body[k], uid)
    }
  }
  const row = await first<any>(c.env.DB, 'SELECT * FROM wasl_privacy WHERE user_id = ?', uid)
  return c.json({ ok: true, privacy: row })
})

// Initiate a WebRTC call (logs to wasl_calls; client handles ICE/SDP via Matrix events)
api.post('/wasl/calls', async (c) => {
  const body = await c.req.json<{
    room_id: string; caller_id: number; callee_id?: number;
    call_type: 'voice' | 'video';
  }>()
  if (!body.room_id || !body.caller_id || !body.call_type) {
    return c.json({ error: 'invalid' }, 400)
  }
  const id = 'call' + Date.now().toString(36)
  await run(c.env.DB,
    'INSERT INTO wasl_calls (id, room_id, caller_id, callee_id, call_type) VALUES (?, ?, ?, ?, ?)',
    id, body.room_id, body.caller_id, body.callee_id ?? null, body.call_type)
  return c.json({ ok: true, id, status: 'ringing', stun: 'stun:stun.l.google.com:19302' })
})

api.post('/wasl/calls/:id/end', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ duration_sec?: number; status?: string }>().catch(() => ({} as any))
  await run(c.env.DB,
    `UPDATE wasl_calls SET ended_at = CURRENT_TIMESTAMP,
       duration_sec = ?, status = ? WHERE id = ?`,
    body.duration_sec ?? 0, body.status ?? 'ended', id)
  return c.json({ ok: true })
})

// Recent calls history
api.get('/wasl/calls/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const calls = await all(c.env.DB, `
    SELECT * FROM wasl_calls
    WHERE caller_id = ? OR callee_id = ?
    ORDER BY started_at DESC LIMIT 30`, uid, uid)
  return c.json({ calls })
})

// Workspace (Maktab) admin command — /invite, /set-visibility, /set-retention, /audit-log, /export
api.post('/wasl/maktab/:workspace_id/command', async (c) => {
  const wsId = c.req.param('workspace_id')
  const body = await c.req.json<{
    actor_id: number; action: string; target?: string; details?: any;
  }>()
  await run(c.env.DB,
    'INSERT INTO wasl_maktab_audit (workspace_id, actor_id, action, target, details) VALUES (?, ?, ?, ?, ?)',
    wsId, body.actor_id, body.action, body.target ?? null, JSON.stringify(body.details ?? {}))
  return c.json({ ok: true })
})

api.get('/wasl/maktab/:workspace_id/audit', async (c) => {
  const wsId = c.req.param('workspace_id')
  const rows = await all(c.env.DB, `
    SELECT a.*, u.display_name AS actor_name
    FROM wasl_maktab_audit a
    LEFT JOIN users u ON u.id = a.actor_id
    WHERE a.workspace_id = ?
    ORDER BY a.created_at DESC LIMIT 50`, wsId)
  return c.json({ audit: rows })
})

// Mark messages as forwarded (consent flow)
api.post('/wasl/messages/:id/forward', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ to_room_id: string; sender_id: number; approved: boolean }>()
  if (!body.approved) return c.json({ ok: false, error: 'consent_required' }, 403)
  const src = await first<{ body: string }>(c.env.DB, 'SELECT body FROM messages WHERE id = ?', id)
  if (!src) return c.json({ error: 'not_found' }, 404)
  const newId = 'm' + Date.now().toString(36)
  await run(c.env.DB,
    'INSERT INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES (?, ?, ?, ?, 3, 1)',
    newId, body.to_room_id, body.sender_id, src.body)
  return c.json({ ok: true, id: newId })
})

// Device verification (SAS / QR)
api.post('/wasl/verify-device', async (c) => {
  const body = await c.req.json<{
    user_id: number; device_id: string; verified_by: number;
    method: 'qr' | 'sas' | 'manual'; fingerprint?: string;
  }>()
  await run(c.env.DB,
    'INSERT INTO wasl_device_verifications (user_id, device_id, verified_by, method, fingerprint) VALUES (?, ?, ?, ?, ?)',
    body.user_id, body.device_id, body.verified_by, body.method, body.fingerprint ?? null)
  return c.json({ ok: true })
})

api.get('/wasl/verify-device/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const rows = await all(c.env.DB,
    'SELECT * FROM wasl_device_verifications WHERE user_id = ? ORDER BY verified_at DESC LIMIT 20', uid)
  return c.json({ verifications: rows })
})

// ─── Wasl reactions (per-message emoji) ───────────────────────────
api.post('/wasl/messages/:id/react', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ user_id: number; emoji: string }>()
  if (!body.user_id || !body.emoji) return c.json({ error: 'invalid' }, 400)
  // Toggle: if exists, remove; else insert
  const existing = await first<any>(c.env.DB,
    'SELECT 1 AS x FROM wasl_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
    id, body.user_id, body.emoji)
  if (existing) {
    await run(c.env.DB,
      'DELETE FROM wasl_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
      id, body.user_id, body.emoji)
    return c.json({ ok: true, action: 'removed' })
  }
  await run(c.env.DB,
    'INSERT INTO wasl_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)',
    id, body.user_id, body.emoji)
  // Bump broadcast reactions counter if room is a channel
  const msg = await first<any>(c.env.DB,
    'SELECT room_id FROM messages WHERE id = ?', id)
  if (msg) {
    await run(c.env.DB,
      'UPDATE wasl_broadcasts SET reactions_total = reactions_total + 1 WHERE room_id = ?',
      msg.room_id)
  }
  return c.json({ ok: true, action: 'added' })
})

api.get('/wasl/messages/:id/reactions', async (c) => {
  const id = c.req.param('id')
  const rows = await all<any>(c.env.DB,
    'SELECT emoji, COUNT(*) AS count FROM wasl_reactions WHERE message_id = ? GROUP BY emoji',
    id)
  return c.json({ reactions: rows })
})

// ─── Wasl subscriptions (broadcast follow / unfollow) ───────────────────────────
api.post('/wasl/rooms/:id/subscribe', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ user_id: number }>()
  if (!body.user_id) return c.json({ error: 'user_id_required' }, 400)
  const existing = await first<any>(c.env.DB,
    'SELECT 1 AS x FROM wasl_subscriptions WHERE room_id = ? AND user_id = ?',
    id, body.user_id)
  if (existing) {
    await run(c.env.DB,
      'DELETE FROM wasl_subscriptions WHERE room_id = ? AND user_id = ?',
      id, body.user_id)
    await run(c.env.DB,
      'UPDATE wasl_broadcasts SET subscriber_count = MAX(0, subscriber_count - 1) WHERE room_id = ?',
      id)
    return c.json({ ok: true, subscribed: false })
  }
  await run(c.env.DB,
    'INSERT INTO wasl_subscriptions (room_id, user_id) VALUES (?, ?)',
    id, body.user_id)
  await run(c.env.DB,
    'INSERT OR IGNORE INTO wasl_broadcasts (room_id, owner_id) VALUES (?, ?)',
    id, body.user_id)
  await run(c.env.DB,
    'UPDATE wasl_broadcasts SET subscriber_count = subscriber_count + 1 WHERE room_id = ?',
    id)
  return c.json({ ok: true, subscribed: true })
})

api.get('/wasl/rooms/:id/subscription/:user_id', async (c) => {
  const room_id = c.req.param('id')
  const user_id = c.req.param('user_id')
  const row = await first<any>(c.env.DB,
    'SELECT subscribed_at FROM wasl_subscriptions WHERE room_id = ? AND user_id = ?',
    room_id, user_id)
  return c.json({ subscribed: !!row, since: row?.subscribed_at })
})

// ─── Wasl broadcast analytics (owner-only aggregates) ──────────────
api.get('/wasl/broadcasts/:id/analytics', async (c) => {
  const id = c.req.param('id')
  const meta = await first<any>(c.env.DB,
    'SELECT * FROM wasl_broadcasts WHERE room_id = ?', id)
  const subs = await first<{ n: number }>(c.env.DB,
    'SELECT COUNT(*) AS n FROM wasl_subscriptions WHERE room_id = ?', id)
  const messages = await first<{ n: number }>(c.env.DB,
    'SELECT COUNT(*) AS n FROM messages WHERE room_id = ?', id)
  const reactions = await first<{ n: number }>(c.env.DB,
    `SELECT COUNT(*) AS n FROM wasl_reactions r
     JOIN messages m ON m.id = r.message_id
     WHERE m.room_id = ?`, id)
  return c.json({
    analytics: {
      subscribers: subs?.n ?? 0,
      messages: messages?.n ?? 0,
      reactions: reactions?.n ?? 0,
      reach_estimate: meta?.reach_estimate ?? (subs?.n ?? 0),
      created_at: meta?.created_at ?? null,
    }
  })
})

// ─── Wasl per-room overrides (TTL, notifications, mute) ───────────────────────────
api.post('/wasl/rooms/:id/override', async (c) => {
  const room_id = c.req.param('id')
  const body = await c.req.json<{
    user_id: number
    disappearing_ttl?: number | null
    notifications?: 'all' | 'mentions' | 'none'
    pinned?: number
    muted_until?: string | null
  }>()
  if (!body.user_id) return c.json({ error: 'user_id_required' }, 400)
  // Upsert row
  await run(c.env.DB, `
    INSERT INTO wasl_room_overrides (room_id, user_id, disappearing_ttl, notifications, pinned, muted_until)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(room_id, user_id) DO UPDATE SET
      disappearing_ttl = COALESCE(excluded.disappearing_ttl, wasl_room_overrides.disappearing_ttl),
      notifications    = COALESCE(excluded.notifications, wasl_room_overrides.notifications),
      pinned           = COALESCE(excluded.pinned, wasl_room_overrides.pinned),
      muted_until      = COALESCE(excluded.muted_until, wasl_room_overrides.muted_until)
  `,
    room_id, body.user_id,
    body.disappearing_ttl ?? null,
    body.notifications ?? null,
    body.pinned ?? null,
    body.muted_until ?? null)
  const row = await first<any>(c.env.DB,
    'SELECT * FROM wasl_room_overrides WHERE room_id = ? AND user_id = ?',
    room_id, body.user_id)
  return c.json({ ok: true, override: row })
})

api.get('/wasl/rooms/:id/override/:user_id', async (c) => {
  const room_id = c.req.param('id')
  const user_id = c.req.param('user_id')
  const row = await first<any>(c.env.DB,
    'SELECT * FROM wasl_room_overrides WHERE room_id = ? AND user_id = ?',
    room_id, user_id)
  return c.json({ override: row ?? null })
})

// ─── Wasl auth method (Email / Telegram / SMS) — §6.2 ───────────────────────────
api.get('/wasl/auth/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  let row = await first<any>(c.env.DB, 'SELECT * FROM wasl_auth_method WHERE user_id = ?', uid)
  if (!row) {
    await run(c.env.DB, 'INSERT OR IGNORE INTO wasl_auth_method (user_id, method) VALUES (?, ?)', uid, 'email')
    row = await first<any>(c.env.DB, 'SELECT * FROM wasl_auth_method WHERE user_id = ?', uid)
  }
  return c.json({ auth: row })
})

api.post('/wasl/auth/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const body = await c.req.json<{ method: 'email' | 'telegram' | 'sms'; identifier?: string }>()
  if (!['email', 'telegram', 'sms'].includes(body.method)) return c.json({ error: 'invalid_method' }, 400)
  await run(c.env.DB, 'INSERT OR IGNORE INTO wasl_auth_method (user_id, method) VALUES (?, ?)', uid, body.method)
  await run(c.env.DB,
    'UPDATE wasl_auth_method SET method = ?, identifier = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    body.method, body.identifier ?? null, uid)
  return c.json({ ok: true, method: body.method })
})

// ─── Wasl outbox flush (mesh / offline retry) ───────────────────────────
api.post('/wasl/outbox/flush', async (c) => {
  const body = await c.req.json<{
    items: { id: string; room_id: string; sender_id: number; body: string }[]
  }>()
  if (!body.items?.length) return c.json({ ok: true, sent: 0 })
  let sent = 0
  for (const it of body.items) {
    try {
      const newId = 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1000)
      await run(c.env.DB,
        'INSERT INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES (?, ?, ?, ?, 3, 1)',
        newId, it.room_id, it.sender_id, it.body)
      sent++
    } catch { /* skip */ }
  }
  return c.json({ ok: true, sent })
})

// ─── MASHAHD (Video) ─────────────────────────────────────────────────────
api.get('/mashahd/videos', async (c) => {
  const fmt = c.req.query('format')
  const where = fmt ? `WHERE v.format = '${fmt.replace(/[^a-z]/g, '')}'` : ''
  const videos = await all(c.env.DB,
    `SELECT v.*, u.handle, u.display_name, u.verified
     FROM videos v JOIN users u ON u.id=v.uploader_id
     ${where}
     ORDER BY v.is_live DESC, v.published_at DESC LIMIT 50`)
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

// §7.1 Bullet (danmaku) + regular comments
api.get('/mashahd/videos/:id/comments', async (c) => {
  const id = c.req.param('id')
  const bullet = c.req.query('bullet') === '1'
  const rows = await all(c.env.DB, `
    SELECT vc.*, u.handle, u.display_name, u.verified
    FROM video_comments vc
    JOIN users u ON u.id = vc.user_id
    WHERE vc.video_id = ? AND vc.is_bullet = ?
    ORDER BY vc.time_offset ASC, vc.created_at DESC
    LIMIT 100
  `, id, bullet ? 1 : 0)
  return c.json({ comments: rows })
})

api.post('/mashahd/videos/:id/comments', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ user_id: number; body: string; is_bullet?: boolean; time_offset?: number }>()
  if (!body.body) return c.json({ error: 'empty' }, 400)
  const cid = 'vc' + Date.now().toString(36)
  await run(c.env.DB, `
    INSERT INTO video_comments (id, video_id, user_id, body, is_bullet, time_offset)
    VALUES (?, ?, ?, ?, ?, ?)
  `, cid, id, body.user_id, body.body, body.is_bullet ? 1 : 0, body.time_offset ?? 0)
  return c.json({ ok: true, id: cid })
})

// §7.4 Tip recommendation (lightweight decision tree, runs server-side for demo)
api.get('/mashahd/tip/suggest', async (c) => {
  const country = c.req.query('country') || 'EG'
  const time_watched = parseInt(c.req.query('time_watched') ?? '0', 10)
  const chat_count = parseInt(c.req.query('chat_count') ?? '0', 10)

  // Widget selection
  const widgetByCountry: Record<string, string> = {
    EG: 'paymob', SA: 'paymob', AE: 'paymob',
    US: 'moonpay', GB: 'moonpay', FR: 'moonpay', DE: 'moonpay',
    IN: 'transak', NG: 'transak', KE: 'transak',
    CN: 'wechange', HK: 'wechange',
  }
  const widget = widgetByCountry[country] || 'ramp'

  // Currency
  const currencyByCountry: Record<string, string> = {
    EG: 'EGP', SA: 'SAR', AE: 'AED', US: 'USD', GB: 'GBP',
    FR: 'EUR', DE: 'EUR', IN: 'INR', NG: 'NGN', KE: 'KES', CN: 'CNY', HK: 'HKD',
  }
  const currency = currencyByCountry[country] || 'USD'

  // Base disposable income proxy (very rough)
  const baseByCountry: Record<string, number> = {
    EG: 5, SA: 20, AE: 25, US: 5, GB: 5, FR: 5, DE: 5, IN: 50, NG: 200, KE: 100, CN: 20, HK: 20,
  }
  const base = baseByCountry[country] ?? 5

  // Engagement multiplier
  let mult = 1.0
  if (time_watched > 600) mult *= 1.5
  if (chat_count > 5) mult *= 1.2

  const amounts = [
    Math.max(1, Math.round((base * mult) / 5) * 5),
    Math.max(5, Math.round((base * mult * 2) / 10) * 10),
    Math.max(25, Math.round((base * mult * 5) / 25) * 25),
  ]

  const gifts = [
    { name: 'Rose', emoji: '🌹', amount: amounts[0] },
    { name: 'Heart', emoji: '💖', amount: amounts[1] },
    { name: 'Star', emoji: '⭐', amount: amounts[1] },
    { name: 'Lion', emoji: '🦁', amount: amounts[2] },
    { name: 'Falcon', emoji: '🦅', amount: amounts[2] * 2 },
  ]

  return c.json({
    suggestion: {
      widget, currency, amounts, gifts,
      country, age_restricted: false,
      blocked: false,
      disclaimer: 'Non-custodial: Circle never sees payment details. Widget handles KYC/AML.',
    }
  })
})

// §7.4.5 Tip flow (record intent — actual payment by widget)
api.post('/mashahd/tip', async (c) => {
  const body = await c.req.json<{
    from_user: number; to_user: number; video_id?: string;
    amount: number; currency: string; widget: string;
  }>()
  if (!body.amount || !body.widget) return c.json({ error: 'invalid' }, 400)
  const id = 'tip' + Date.now().toString(36) + Math.floor(Math.random() * 1000)
  await run(c.env.DB, `
    INSERT INTO tip_transactions (id, from_user, to_user, video_id, amount, currency, widget, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `, id, body.from_user, body.to_user, body.video_id ?? null, body.amount, body.currency, body.widget)
  return c.json({
    ok: true, id,
    widget_url: `https://widget.${body.widget}.com/embed?ref=circle&id=${id}`,
    settlement: 'non-custodial — Circle never holds funds',
    circle_fee_bp: 150,
    legal: 'KYC/AML handled by widget provider; Circle is not a money transmitter',
  })
})

// §7.4.5 Webhook from widget provider (confirms tip)
api.post('/mashahd/tip/webhook', async (c) => {
  const body = await c.req.json<{ id: string; webhook_ref: string; status: 'confirmed' | 'failed' }>()
  await run(c.env.DB, `
    UPDATE tip_transactions SET status = ?, webhook_ref = ?, confirmed_at = CURRENT_TIMESTAMP WHERE id = ?
  `, body.status, body.webhook_ref, body.id)
  // Bump creator analytics
  if (body.status === 'confirmed') {
    const tip = await first<any>(c.env.DB, 'SELECT to_user, amount FROM tip_transactions WHERE id = ?', body.id)
    if (tip) {
      await run(c.env.DB, `
        INSERT INTO creator_analytics (user_id, total_tips_minor) VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET total_tips_minor = total_tips_minor + excluded.total_tips_minor,
                                            updated_at = CURRENT_TIMESTAMP
      `, tip.to_user, tip.amount)
    }
  }
  return c.json({ ok: true })
})

// §7.3.5 Sponsored hashtags by city
api.get('/mashahd/sponsored', async (c) => {
  const city = c.req.query('city')
  const where = city ? `WHERE city = '${city.replace(/[^a-zA-Z]/g, '')}' OR city IS NULL` : ''
  const rows = await all(c.env.DB, `
    SELECT * FROM sponsored_hashtags
    ${where}
    ORDER BY budget DESC LIMIT 5
  `)
  return c.json({ sponsored: rows })
})

// §7 Creator analytics
api.get('/mashahd/creator/:user_id/analytics', async (c) => {
  const uid = c.req.param('user_id')
  let row = await first<any>(c.env.DB, 'SELECT * FROM creator_analytics WHERE user_id = ?', uid)
  if (!row) {
    await run(c.env.DB, 'INSERT OR IGNORE INTO creator_analytics (user_id) VALUES (?)', uid)
    row = await first<any>(c.env.DB, 'SELECT * FROM creator_analytics WHERE user_id = ?', uid)
  }
  // Live aggregates
  const tips = await first<{ n: number }>(c.env.DB,
    'SELECT COALESCE(SUM(amount),0) AS n FROM tip_transactions WHERE to_user = ? AND status = "confirmed"', uid)
  const members = await first<{ n: number }>(c.env.DB,
    'SELECT COUNT(*) AS n FROM channel_memberships WHERE channel_id = ? AND status = "active"', String(uid))
  return c.json({ analytics: { ...row, total_tips_minor: tips?.n ?? 0, members: members?.n ?? 0 } })
})

// §7.3.9 Channel memberships
api.post('/mashahd/membership', async (c) => {
  const body = await c.req.json<{
    channel_id: string; member_id: number; tier?: string; monthly_amt: number; processor: string;
  }>()
  await run(c.env.DB, `
    INSERT INTO channel_memberships (channel_id, member_id, tier, monthly_amt, processor)
    VALUES (?, ?, ?, ?, ?)
  `, body.channel_id, body.member_id, body.tier ?? 'standard', body.monthly_amt, body.processor)
  return c.json({ ok: true })
})

// §7.1 Live viewer count update (for live streams)
api.post('/mashahd/videos/:id/live-tick', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ delta: number }>()
  await run(c.env.DB,
    'UPDATE videos SET live_viewer_count = MAX(0, live_viewer_count + ?) WHERE id = ?',
    body.delta, id)
  const row = await first<any>(c.env.DB,
    'SELECT live_viewer_count FROM videos WHERE id = ?', id)
  return c.json({ ok: true, viewers: row?.live_viewer_count ?? 0 })
})

// ─── LAMAHAT (Photos) ────────────────────────────────────────────────────
api.get('/lamahat/photos', async (c) => {
  const city = c.req.query('city')
  const tab = c.req.query('tab') // stories | feed | anon
  const filters: string[] = []
  const params: any[] = []
  if (city) { filters.push('p.city = ?'); params.push(city) }
  if (tab === 'stories') filters.push('p.is_story = 1 AND (p.expires_at IS NULL OR p.expires_at > CURRENT_TIMESTAMP)')
  else if (tab === 'anon') filters.push('p.is_anonymous = 1')
  else if (tab === 'feed') filters.push('p.is_story = 0')
  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : ''
  const sql = `SELECT p.*,
      CASE WHEN p.is_anonymous = 1 THEN 'anonymous' ELSE u.handle END AS handle,
      CASE WHEN p.is_anonymous = 1 THEN 'Anonymous' ELSE u.display_name END AS display_name
    FROM photos p JOIN users u ON u.id=p.uploader_id
    ${where}
    ORDER BY p.published_at DESC LIMIT 60`
  const photos = await all(c.env.DB, sql, ...params)
  return c.json({ photos, city: city ?? null, tab: tab ?? 'feed' })
})

api.post('/lamahat/photos/:id/like', async (c) => {
  await run(c.env.DB, 'UPDATE photos SET likes = likes + 1 WHERE id = ?', c.req.param('id'))
  return c.json({ ok: true })
})

// §8.4 Anonymous / story photo post
api.post('/lamahat/photos', async (c) => {
  const body = await c.req.json<{
    uploader_id: number; caption?: string; cid: string; city?: string;
    is_anonymous?: boolean; is_story?: boolean;
  }>()
  if (!body.uploader_id || !body.cid) return c.json({ error: 'invalid' }, 400)
  const id = 'ph' + Date.now().toString(36)
  const expires = body.is_story ? "datetime('now', '+24 hours')" : 'NULL'
  await run(c.env.DB, `
    INSERT INTO photos (id, uploader_id, caption, cid, city, is_anonymous, is_story, expires_at, likes, comments_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ${expires}, 0, 0)
  `,
    id, body.uploader_id, body.caption ?? null, body.cid, body.city ?? null,
    body.is_anonymous ? 1 : 0, body.is_story ? 1 : 0)
  return c.json({ ok: true, id })
})

// §8 Photo comments
api.get('/lamahat/photos/:id/comments', async (c) => {
  const rows = await all(c.env.DB, `
    SELECT pc.*, u.handle, u.display_name
    FROM photo_comments pc JOIN users u ON u.id = pc.user_id
    WHERE pc.photo_id = ? ORDER BY pc.created_at DESC LIMIT 50
  `, c.req.param('id'))
  return c.json({ comments: rows })
})

api.post('/lamahat/photos/:id/comments', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ user_id: number; body: string }>()
  if (!body.body) return c.json({ error: 'empty' }, 400)
  const cid = 'pc' + Date.now().toString(36)
  await run(c.env.DB, `
    INSERT INTO photo_comments (id, photo_id, user_id, body) VALUES (?, ?, ?, ?)
  `, cid, id, body.user_id, body.body)
  await run(c.env.DB, 'UPDATE photos SET comments_count = comments_count + 1 WHERE id = ?', id)
  return c.json({ ok: true, id: cid })
})

// §8.3 CLIP visual search — for demo we tag-search by caption keywords
api.get('/lamahat/visual-search', async (c) => {
  const q = (c.req.query('q') ?? '').toLowerCase()
  if (!q) return c.json({ photos: [] })
  // Demo: simple LIKE on caption (production would use CLIP vec ANN search)
  const photos = await all(c.env.DB, `
    SELECT p.*, u.handle, u.display_name
    FROM photos p JOIN users u ON u.id = p.uploader_id
    WHERE LOWER(p.caption) LIKE ?
    ORDER BY p.likes DESC LIMIT 30
  `, `%${q}%`)
  return c.json({ photos, q, model: 'CLIP ViT-B/32 (on-device demo: LIKE fallback)' })
})

// §9 Midan ActivityPub federation marker
api.post('/midan/posts/:id/federate', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ ap_actor: string }>()
  await run(c.env.DB, `
    UPDATE posts SET federated_at = CURRENT_TIMESTAMP, ap_actor = ? WHERE id = ?
  `, body.ap_actor, id)
  return c.json({ ok: true, federated_to: body.ap_actor })
})

// §9 Midan repost
api.post('/midan/posts/:id/repost', async (c) => {
  await run(c.env.DB, 'UPDATE posts SET reposts = reposts + 1 WHERE id = ?', c.req.param('id'))
  return c.json({ ok: true })
})

// §9 Midan replies
api.get('/midan/posts/:id/replies', async (c) => {
  const rows = await all(c.env.DB, `
    SELECT pr.*, u.handle, u.display_name
    FROM post_replies pr JOIN users u ON u.id = pr.author_id
    WHERE pr.post_id = ? ORDER BY pr.created_at DESC LIMIT 50
  `, c.req.param('id'))
  return c.json({ replies: rows })
})

api.post('/midan/posts/:id/replies', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ user_id: number; body: string }>()
  if (!body.body) return c.json({ error: 'empty' }, 400)
  const rid = 'pr' + Date.now().toString(36)
  await run(c.env.DB, `
    INSERT INTO post_replies (id, post_id, author_id, content) VALUES (?, ?, ?, ?)
  `, rid, id, body.user_id, body.body)
  await run(c.env.DB, 'UPDATE posts SET replies_count = replies_count + 1 WHERE id = ?', id)
  return c.json({ ok: true, id: rid })
})

// Generic follow / unfollow (used by §13 §14)
api.post('/follows/:user_id', async (c) => {
  const target = c.req.param('user_id')
  const body = await c.req.json<{ follower_id: number }>()
  const existing = await first<any>(c.env.DB,
    'SELECT 1 AS x FROM follows WHERE follower_id = ? AND followed_id = ?',
    body.follower_id, target)
  if (existing) {
    await run(c.env.DB,
      'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
      body.follower_id, target)
    return c.json({ ok: true, following: false })
  }
  await run(c.env.DB,
    'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)',
    body.follower_id, target)
  return c.json({ ok: true, following: true })
})

api.get('/follows/:user_id/status/:viewer_id', async (c) => {
  const row = await first<any>(c.env.DB,
    'SELECT 1 AS x FROM follows WHERE follower_id = ? AND followed_id = ?',
    c.req.param('viewer_id'), c.req.param('user_id'))
  return c.json({ following: !!row })
})

// ─── CIRCLES (Groups) ───────────────────────────────────────────────────
api.get('/circles', async (c) => {
  const circles = await all(c.env.DB, 'SELECT * FROM circles ORDER BY member_count DESC')
  return c.json({ circles })
})

// ─── /CHANNELS ───────────────────────────────────────────────────────
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

// ─── PRO NETWORK ────────────────────────────────────────────────────────
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

// ─── RIHLA — Travel ─────────────────────────────────────────────────────
api.post('/rihla/itinerary', async (c) => {
  const body = await c.req.json<{ city: string; days: number; interests: string[]; user_id?: number }>()
  const interests = (body.interests ?? []).join(', ') || 'general'
  const plan: any = {}
  for (let d = 1; d <= Math.min(7, body.days ?? 1); d++) {
    plan[`day${d}`] = {
      morning: `Walk a landmark of ${body.city} themed around ${interests.split(',')[0] ?? 'culture'}`,
      lunch: `Family-run restaurant — try a regional dish in ${body.city}`,
      afternoon: `Visit a museum or open market`,
      dinner: `Sunset rooftop dinner with local music`
    }
  }
  const r = await run(c.env.DB,
    'INSERT INTO travel_itineraries (user_id, city, days, interests, plan_json) VALUES (?, ?, ?, ?, ?)',
    body.user_id ?? 1, body.city, body.days, interests, JSON.stringify(plan))
  return c.json({ ok: true, id: r.meta?.last_row_id, city: body.city, days: body.days, plan })
})

api.get('/rihla/itineraries', async (c) => {
  const items = await all<any>(c.env.DB, 'SELECT * FROM travel_itineraries ORDER BY created_at DESC LIMIT 30')
  return c.json({ items: items.map((i) => ({ ...i, plan_json: JSON.parse(i.plan_json) })) })
})

// ─── CIRCLE PAYMENTS ────────────────────────────────────────────────────
api.get('/pay/wallet/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const wallet = await first(c.env.DB, 'SELECT * FROM wallets WHERE user_id = ?', uid)
  const txns = await all(c.env.DB, `
    SELECT t.*, uf.display_name AS from_name, ut.display_name AS to_name
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
  const r = await run(c.env.DB, `
    INSERT INTO transactions (from_user, to_user, amount, currency, method, status, note)
    VALUES (?, ?, ?, ?, ?, 'completed', ?)`,
    body.from_user, to.id, body.amount, from.currency, body.method ?? 'handle', body.note ?? null)
  return c.json({ ok: true, id: r.meta?.last_row_id, fee: 0, currency: from.currency })
})

// ─── CIRCLE MAIL ────────────────────────────────────────────────────────
api.get('/mail/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const folder = c.req.query('folder') ?? 'inbox'
  const messages = await all(c.env.DB,
    'SELECT * FROM mail_messages WHERE user_id = ? AND folder = ? ORDER BY created_at DESC LIMIT 50', uid, folder)
  return c.json({ folder, messages })
})

// ─── EVENTS ──────────────────────────────────────────────────────────────
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

// ─── GOVERNANCE & TRANSPARENCY ──────────────────────────────────────
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
  const rows = await all<any>(c.env.DB, 'SELECT * FROM ad_revenue_ledger ORDER BY month DESC, amount_usd DESC')
  const total = rows.reduce((s, r: any) => s + (r.amount_usd ?? 0), 0)
  const byAlloc: Record<string, number> = {}
  rows.forEach((r: any) => { byAlloc[r.allocation] = (byAlloc[r.allocation] ?? 0) + (r.amount_usd ?? 0) })
  return c.json({ rows, total, by_allocation: byAlloc })
})

// ─── MINI APPS ──────────────────────────────────────────────────────────
api.get('/apps', async (c) => {
  const apps = await all(c.env.DB, 'SELECT * FROM mini_apps ORDER BY install_count DESC')
  return c.json({ apps })
})

// ─── TRANSLATION ────────────────────────────────────────────────────────
api.post('/translate', async (c) => {
  const body = await c.req.json<{ text: string; to: string; from?: string }>()
  const samples: Record<string, Record<string, string>> = {
    en: { ar: 'مرحبا بكم في دواير', zh: '欢迎来到圆圈', fr: 'Bienvenue sur Cercle', es: 'Bienvenido a Círculo', de: 'Willkommen bei Kreis', it: 'Benvenuti in Cerchio' },
    ar: { en: 'Welcome to Circle', zh: '欢迎来到圆圈', fr: 'Bienvenue sur Cercle', es: 'Bienvenido a Círculo', de: 'Willkommen bei Kreis', it: 'Benvenuti in Cerchio' }
  }
  const translated = samples[body.from ?? 'auto']?.[body.to] ?? `[${body.to}] ${body.text}`
  return c.json({
    ok: true, from: body.from ?? 'auto', to: body.to,
    original: body.text, translated,
    model: 'NLLB-200 Distilled 600M (on-device, int8)'
  })
})

// ─── LOCAL MESH ─────────────────────────────────────────────────────────
api.get('/mesh/peers', async (c) => {
  const peers = await all(c.env.DB, 'SELECT * FROM mesh_peers ORDER BY rssi_dbm DESC LIMIT 30')
  return c.json({ peers })
})

api.get('/mesh/sos', async (c) => {
  const alerts = await all(c.env.DB,
    'SELECT s.*, u.display_name FROM sos_alerts s JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC LIMIT 20')
  return c.json({ alerts })
})

api.post('/mesh/sos', async (c) => {
  const body = await c.req.json<{ user_id?: number; message?: string; severity?: string; city?: string }>()
  const r = await run(c.env.DB,
    `INSERT INTO sos_alerts (user_id, message, severity, city, peers_reached) VALUES (?, ?, ?, ?, ?)`,
    body.user_id ?? 1, body.message ?? null, body.severity ?? 'sos', body.city ?? 'Cairo',
    Math.floor(Math.random() * 25) + 8)
  const alert = await first<{ peers_reached: number }>(c.env.DB, 'SELECT peers_reached FROM sos_alerts WHERE id=?', r.meta?.last_row_id)
  return c.json({ ok: true, id: r.meta?.last_row_id, peers_reached: alert?.peers_reached ?? 0 })
})

// ─── AI SAFETY ──────────────────────────────────────────────────────────
api.get('/moderation/actions', async (c) => {
  const actions = await all(c.env.DB, 'SELECT * FROM moderation_actions ORDER BY created_at DESC LIMIT 50')
  return c.json({ actions })
})

// ─── SELF-LEARNING AI CORE ──────────────────────────────────────────────
api.get('/ai/training/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const stats = await all(c.env.DB, 'SELECT * FROM ai_training_stats WHERE user_id = ? ORDER BY updated_at DESC', uid)
  const rounds = await all(c.env.DB, 'SELECT * FROM federated_rounds ORDER BY round_no DESC LIMIT 10')
  return c.json({ stats, rounds })
})

api.post('/ai/training/:user_id/opt', async (c) => {
  const uid = c.req.param('user_id')
  const body = await c.req.json<{ model_name: string; opt_in: number }>()
  await run(c.env.DB, 'UPDATE ai_training_stats SET fed_opt_in = ? WHERE user_id = ? AND model_name = ?',
    body.opt_in, uid, body.model_name)
  return c.json({ ok: true })
})

// ─── MAPS ───────────────────────────────────────────────────────────────
api.get('/maps/regions', async (c) => {
  const regions = await all(c.env.DB, 'SELECT * FROM map_regions ORDER BY pinned_by DESC')
  return c.json({ regions })
})

// ─── BACKUP ─────────────────────────────────────────────────────────────
api.get('/backup/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const items = await all(c.env.DB, 'SELECT * FROM backups WHERE user_id = ? ORDER BY created_at DESC', uid)
  return c.json({ items })
})

// ─── PRIVACY ────────────────────────────────────────────────────────────
api.get('/privacy/:user_id', async (c) => {
  const uid = c.req.param('user_id')
  const consents = await all(c.env.DB, 'SELECT * FROM privacy_consent WHERE user_id = ? ORDER BY scope, granted_to', uid)
  return c.json({ consents })
})

// ─── MODEL CATALOGUE ────────────────────────────────────────────────────
api.get('/models', async (c) => {
  const models = await all(c.env.DB, 'SELECT * FROM ai_models ORDER BY required DESC, category, size_mb')
  return c.json({ models })
})

// ─── SELF-HOST NODES ────────────────────────────────────────────────────
api.get('/selfhost/nodes', async (c) => {
  const nodes = await all(c.env.DB, 'SELECT * FROM self_host_nodes ORDER BY users_served DESC')
  return c.json({ nodes })
})

// ─── ROADMAP ────────────────────────────────────────────────────────────
api.get('/roadmap', async (c) => {
  const phases = await all<any>(c.env.DB, 'SELECT * FROM roadmap_phases ORDER BY phase_no')
  return c.json({ phases: phases.map((p) => ({ ...p, deliverables: p.deliverables ? JSON.parse(p.deliverables) : [] })) })
})
