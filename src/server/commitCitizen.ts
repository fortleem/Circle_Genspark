// ═══════════════════════════════════════════════════════════════════════════
// Wasl Commit Service + Citizen Emergency Witness — API routes
//   A) /wasl/commits            — two-party sealed agreements in chat
//   B) /emergency/incidents     — one-press tamper-evident emergency witness
// Mounted from api.ts via registerCommitCitizen(api).
// ═══════════════════════════════════════════════════════════════════════════
import type { Hono } from 'hono'
import { all, first, run, type Env } from './db'

type Api = Hono<{ Bindings: Env }>

const rid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function notify(db: Env['DB'], userId: number, kind: string, title: string, body: string, link: string, priority = 0) {
  try {
    await run(db, `INSERT INTO notifications (user_id, kind, title, body, link, priority) VALUES (?, ?, ?, ?, ?, ?)`,
      userId, kind, title, body, link, priority)
  } catch { /* best-effort */ }
}

// Escape ICS text values
const icsEsc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function registerCommitCitizen(api: Api) {
  /* ═════════════════════════ A) WASL COMMIT SERVICE ═════════════════════ */

  // Propose a commit (either party presses "Commit" on an agreement)
  api.post('/wasl/rooms/:roomId/commits', async (c) => {
    const roomId = c.req.param('roomId')
    const b = await c.req.json<{
      proposer_id: number; counterparty_id?: number; kind?: string
      title: string; terms: string; amount?: number; currency?: string
      due_at?: string; source_message_id?: string
    }>().catch(() => ({} as any))
    if (!b.title || !b.terms || !b.proposer_id) return c.json({ ok: false, error: 'title, terms, proposer_id required' }, 400)

    const id = rid('cmt')
    await run(c.env.DB, `
      INSERT INTO wasl_commits (id, room_id, proposer_id, counterparty_id, kind, title, terms, amount, currency, due_at, source_message_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, id, roomId, b.proposer_id, b.counterparty_id ?? null, b.kind ?? 'agreement',
      b.title.slice(0, 200), b.terms.slice(0, 4000), b.amount ?? null, b.currency ?? 'EGP', b.due_at ?? null, b.source_message_id ?? null)
    await run(c.env.DB, `INSERT INTO wasl_commit_events (commit_id, actor_id, action, note) VALUES (?, ?, 'proposed', ?)`,
      id, b.proposer_id, `Proposed: ${b.title.slice(0, 100)}`)

    // Post a system message in the room so both parties see the proposal
    try {
      await run(c.env.DB,
        `INSERT INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES (?, ?, ?, ?, 3, 1)`,
        rid('msg'), roomId, b.proposer_id,
        `🤝 COMMIT PROPOSED — "${b.title}"${b.amount ? ` · ${b.amount} ${b.currency ?? 'EGP'}` : ''}. Waiting for confirmation. [commit:${id}]`)
    } catch { /* room may not exist in demo */ }

    if (b.counterparty_id) {
      await notify(c.env.DB, b.counterparty_id, 'wasl', '🤝 Commit proposal',
        `${b.title}${b.amount ? ` — ${b.amount} ${b.currency ?? 'EGP'}` : ''}. Tap to confirm or decline.`, `/wasl`, 50)
    }
    const commit = await first(c.env.DB, 'SELECT * FROM wasl_commits WHERE id = ?', id)
    return c.json({ ok: true, commit })
  })

  // List commits for a room (or all for a user via ?user_id=)
  api.get('/wasl/commits', async (c) => {
    const roomId = c.req.query('room_id')
    const userId = c.req.query('user_id')
    let rows
    if (roomId) {
      rows = await all(c.env.DB, `SELECT * FROM wasl_commits WHERE room_id = ? ORDER BY proposed_at DESC LIMIT 50`, roomId)
    } else if (userId) {
      rows = await all(c.env.DB, `SELECT * FROM wasl_commits WHERE proposer_id = ? OR counterparty_id = ? ORDER BY proposed_at DESC LIMIT 50`, Number(userId), Number(userId))
    } else {
      rows = await all(c.env.DB, `SELECT * FROM wasl_commits ORDER BY proposed_at DESC LIMIT 50`)
    }
    return c.json({ commits: rows })
  })

  api.get('/wasl/commits/:id', async (c) => {
    const commit = await first(c.env.DB, 'SELECT * FROM wasl_commits WHERE id = ?', c.req.param('id'))
    if (!commit) return c.json({ ok: false, error: 'not_found' }, 404)
    const events = await all(c.env.DB, `
      SELECT e.*, u.display_name, u.handle FROM wasl_commit_events e
      LEFT JOIN users u ON u.id = e.actor_id
      WHERE e.commit_id = ? ORDER BY e.created_at ASC`, c.req.param('id'))
    return c.json({ ok: true, commit, events })
  })

  // Confirm (seals the agreement — immutable hash) / decline / cancel / fulfil
  api.post('/wasl/commits/:id/respond', async (c) => {
    const id = c.req.param('id')
    const b = await c.req.json<{ actor_id: number; action: 'confirm' | 'decline' | 'cancel' | 'fulfil' }>().catch(() => ({} as any))
    if (!b.actor_id || !b.action) return c.json({ ok: false, error: 'actor_id + action required' }, 400)

    const cm = await first<any>(c.env.DB, 'SELECT * FROM wasl_commits WHERE id = ?', id)
    if (!cm) return c.json({ ok: false, error: 'not_found' }, 404)

    if (b.action === 'confirm') {
      if (cm.status !== 'proposed') return c.json({ ok: false, error: `cannot confirm from status=${cm.status}` }, 409)
      if (b.actor_id === cm.proposer_id) return c.json({ ok: false, error: 'proposer cannot confirm own commit — the other party must confirm' }, 403)
      const committedAt = new Date().toISOString()
      const seal = await sha256Hex(`${cm.title}|${cm.terms}|${cm.amount ?? ''}|${cm.proposer_id}|${b.actor_id}|${committedAt}`)
      await run(c.env.DB, `
        UPDATE wasl_commits SET status='committed', counterparty_id = COALESCE(counterparty_id, ?), seal_hash = ?, committed_at = ? WHERE id = ?
      `, b.actor_id, seal, committedAt, id)
      await run(c.env.DB, `INSERT INTO wasl_commit_events (commit_id, actor_id, action, note) VALUES (?, ?, 'confirmed', ?)`,
        id, b.actor_id, `Sealed with hash ${seal.slice(0, 16)}…`)
      try {
        await run(c.env.DB,
          `INSERT INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES (?, ?, ?, ?, 3, 1)`,
          rid('msg'), cm.room_id, b.actor_id,
          `✅ COMMIT SEALED — "${cm.title}". Proof: ${seal.slice(0, 16)}… Both parties are now bound. [commit:${id}]`)
      } catch { /* ok */ }
      await notify(c.env.DB, cm.proposer_id, 'wasl', '✅ Commit sealed', `"${cm.title}" was confirmed. Proof hash saved.`, '/wasl', 50)
      const updated = await first(c.env.DB, 'SELECT * FROM wasl_commits WHERE id = ?', id)
      return c.json({ ok: true, commit: updated })
    }

    const map: Record<string, [string, string]> = {
      decline: ['declined', 'declined'], cancel: ['cancelled', 'cancelled'], fulfil: ['fulfilled', 'fulfilled'],
    }
    const [newStatus, action] = map[b.action] ?? []
    if (!newStatus) return c.json({ ok: false, error: 'invalid action' }, 400)
    if (b.action === 'fulfil' && cm.status !== 'committed') return c.json({ ok: false, error: 'only committed agreements can be fulfilled' }, 409)
    await run(c.env.DB, `UPDATE wasl_commits SET status = ?, ${b.action === 'fulfil' ? 'fulfilled_at = CURRENT_TIMESTAMP' : 'committed_at = committed_at'} WHERE id = ?`, newStatus, id)
    await run(c.env.DB, `INSERT INTO wasl_commit_events (commit_id, actor_id, action) VALUES (?, ?, ?)`, id, b.actor_id, action)
    const updated = await first(c.env.DB, 'SELECT * FROM wasl_commits WHERE id = ?', id)
    return c.json({ ok: true, commit: updated })
  })

  // Calendar export — downloads a real .ics file
  api.get('/wasl/commits/:id/calendar.ics', async (c) => {
    const cm = await first<any>(c.env.DB, 'SELECT * FROM wasl_commits WHERE id = ?', c.req.param('id'))
    if (!cm) return c.json({ ok: false, error: 'not_found' }, 404)
    const start = cm.due_at ? new Date(cm.due_at) : new Date(Date.now() + 24 * 3600 * 1000)
    const end = new Date(start.getTime() + 3600 * 1000)
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cirkle//Commit Service//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${cm.id}@cirkle.app`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsEsc(`🤝 ${cm.title}`)}`,
      `DESCRIPTION:${icsEsc(`${cm.terms}\n\nAmount: ${cm.amount ?? '—'} ${cm.currency ?? ''}\nStatus: ${cm.status}\nProof: ${cm.seal_hash ?? 'pending'}\nCommit ID: ${cm.id}`)}`,
      'STATUS:CONFIRMED', 'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY',
      `DESCRIPTION:${icsEsc(cm.title)}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
    try {
      await run(c.env.DB, `INSERT INTO wasl_commit_events (commit_id, actor_id, action) VALUES (?, 0, 'added_calendar')`, cm.id)
    } catch { /* ok */ }
    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="cirkle-commit-${cm.id}.ics"`,
      },
    })
  })

  // Forward to email — queues into the real mail outbox
  api.post('/wasl/commits/:id/email', async (c) => {
    const cm = await first<any>(c.env.DB, 'SELECT * FROM wasl_commits WHERE id = ?', c.req.param('id'))
    if (!cm) return c.json({ ok: false, error: 'not_found' }, 404)
    const b = await c.req.json<{ to: string; from_user?: number }>().catch(() => ({} as any))
    if (!b.to) return c.json({ ok: false, error: 'to (email) required' }, 400)
    const body = [
      `AGREEMENT — ${cm.title}`,
      ``, `Terms:`, cm.terms, ``,
      cm.amount ? `Amount: ${cm.amount} ${cm.currency}` : null,
      cm.due_at ? `Due: ${cm.due_at}` : null,
      `Status: ${cm.status}`,
      cm.seal_hash ? `Cryptographic proof (SHA-256): ${cm.seal_hash}` : `Not yet sealed`,
      `Commit ID: ${cm.id}`, ``,
      `— Sent from Cirkle (دواير) Commit Service. This record is immutable once sealed.`,
    ].filter((x) => x !== null).join('\n')
    const r = await run(c.env.DB, `
      INSERT INTO mail_outbox (from_user, to_addr, subject, body, is_encrypted, state)
      VALUES (?, ?, ?, ?, 1, 'queued')
    `, b.from_user ?? cm.proposer_id, b.to, `🤝 Cirkle Agreement: ${cm.title}`, body)
    await run(c.env.DB, `INSERT INTO wasl_commit_events (commit_id, actor_id, action, note) VALUES (?, ?, 'forwarded_email', ?)`,
      cm.id, b.from_user ?? cm.proposer_id, `→ ${b.to}`)
    return c.json({ ok: true, mail_id: r.meta.last_row_id, to: b.to })
  })

  /* ═══════════════════ B) CITIZEN EMERGENCY WITNESS ═════════════════════ */

  // One-press start — begins tamper-evident recording + area/circle alert
  api.post('/emergency/incidents', async (c) => {
    const b = await c.req.json<{
      reporter_id: number; kind: 'fire' | 'medical' | 'crime' | 'rights_violation'
      mode?: 'video' | 'audio'; scope?: 'public' | 'circle' | 'gov'
      circle_id?: number; lat?: number; lng?: number; city?: string
    }>().catch(() => ({} as any))
    if (!b.reporter_id || !b.kind) return c.json({ ok: false, error: 'reporter_id + kind required' }, 400)

    const id = rid('emg')
    const city = b.city ?? 'Cairo'
    // rights violations ALWAYS route to the government oversight channel
    const scope = b.kind === 'rights_violation' ? 'gov' : (b.scope ?? 'public')
    const govRouted = scope === 'gov' ? 1 : 0

    await run(c.env.DB, `
      INSERT INTO emergency_incidents (id, reporter_id, kind, mode, scope, circle_id, lat, lng, city, gov_channel_routed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, id, b.reporter_id, b.kind, b.mode ?? 'video', scope, b.circle_id ?? null, b.lat ?? null, b.lng ?? null, city, govRouted)

    // Notify: nearby citizens (same city) OR circle members OR gov channel
    let notified = 0
    if (scope === 'circle' && b.circle_id) {
      const members = await all<{ user_id: number }>(c.env.DB,
        `SELECT user_id FROM cirkle_members WHERE cirkle_id = ? AND user_id != ? LIMIT 50`, b.circle_id, b.reporter_id)
        .catch(() => [] as Array<{ user_id: number }>)
      for (const m of members) {
        await notify(c.env.DB, m.user_id, 'mesh', '🆘 FAMILY EMERGENCY',
          `${b.kind.toUpperCase()} reported by a member of your circle — live ${b.mode ?? 'video'} streaming now.`, `/emergency?incident=${id}`, 90)
        notified++
      }
    } else {
      const nearby = await all<{ id: number }>(c.env.DB,
        `SELECT id FROM users WHERE city = ? AND id != ? LIMIT 50`, city, b.reporter_id)
        .catch(() => [] as Array<{ id: number }>)
      for (const u of nearby) {
        await notify(c.env.DB, u.id, 'mesh',
          b.kind === 'rights_violation' ? '⚖️ RIGHTS VIOLATION — witness needed' : `🚨 ${b.kind.toUpperCase()} near you`,
          `Live incident in ${city}. Can you confirm what's happening?`, `/emergency?incident=${id}`, 90)
        notified++
      }
    }
    if (govRouted) {
      // deliver to government oversight channel inbox (channel_id 0 = oversight)
      await notify(c.env.DB, 1, 'gov', '⚖️ Oversight: rights-violation stream started',
        `Incident ${id} in ${city}. Tamper-evident recording in progress.`, `/emergency?incident=${id}`, 90)
    }

    const incident = await first(c.env.DB, 'SELECT * FROM emergency_incidents WHERE id = ?', id)
    return c.json({ ok: true, incident, notified, gov_channel_routed: !!govRouted })
  })

  // Append a recording segment (hash-chained → tamper-evident)
  api.post('/emergency/incidents/:id/segments', async (c) => {
    const id = c.req.param('id')
    const b = await c.req.json<{ media_cid: string; duration_ms?: number }>().catch(() => ({} as any))
    if (!b.media_cid) return c.json({ ok: false, error: 'media_cid required' }, 400)
    const inc = await first<any>(c.env.DB, 'SELECT status FROM emergency_incidents WHERE id = ?', id)
    if (!inc) return c.json({ ok: false, error: 'not_found' }, 404)
    if (inc.status !== 'live') return c.json({ ok: false, error: 'incident is not live — cannot append (immutability guarantee)' }, 409)

    const last = await first<any>(c.env.DB,
      `SELECT seq, seg_hash FROM emergency_segments WHERE incident_id = ? ORDER BY seq DESC LIMIT 1`, id)
    const seq = (last?.seq ?? -1) + 1
    const prevHash = last?.seg_hash ?? 'GENESIS'
    const capturedAt = new Date().toISOString()
    const segHash = await sha256Hex(`${prevHash}|${b.media_cid}|${seq}|${capturedAt}`)
    await run(c.env.DB, `
      INSERT INTO emergency_segments (incident_id, seq, media_cid, duration_ms, prev_hash, seg_hash, captured_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, id, seq, b.media_cid, b.duration_ms ?? 4000, prevHash, segHash, capturedAt)
    return c.json({ ok: true, seq, seg_hash: segHash, prev_hash: prevHash })
  })

  // Verify chain integrity — proves the recording was not edited
  api.get('/emergency/incidents/:id/verify', async (c) => {
    const segs = await all<any>(c.env.DB,
      `SELECT seq, media_cid, prev_hash, seg_hash, captured_at FROM emergency_segments WHERE incident_id = ? ORDER BY seq ASC`, c.req.param('id'))
    let prev = 'GENESIS'
    for (const s of segs) {
      const expect = await sha256Hex(`${prev}|${s.media_cid}|${s.seq}|${s.captured_at}`)
      if (s.prev_hash !== prev || s.seg_hash !== expect) {
        return c.json({ ok: true, intact: false, broken_at_seq: s.seq, segments: segs.length })
      }
      prev = s.seg_hash
    }
    return c.json({ ok: true, intact: true, segments: segs.length, head_hash: prev })
  })

  // Nearby-citizen confirmation
  api.post('/emergency/incidents/:id/confirm', async (c) => {
    const id = c.req.param('id')
    const b = await c.req.json<{ user_id: number; verdict?: 'confirm' | 'cannot_see' | 'dispute'; distance_m?: number; note?: string }>().catch(() => ({} as any))
    if (!b.user_id) return c.json({ ok: false, error: 'user_id required' }, 400)
    await run(c.env.DB, `
      INSERT OR REPLACE INTO emergency_confirmations (incident_id, user_id, verdict, distance_m, note)
      VALUES (?, ?, ?, ?, ?)
    `, id, b.user_id, b.verdict ?? 'confirm', b.distance_m ?? null, b.note ?? null)
    const counts = await first<any>(c.env.DB, `
      SELECT SUM(CASE WHEN verdict='confirm' THEN 1 ELSE 0 END) confirms,
             SUM(CASE WHEN verdict='dispute' THEN 1 ELSE 0 END) disputes,
             COUNT(*) total
      FROM emergency_confirmations WHERE incident_id = ?`, id)
    // auto-mark confirmed at 2+ confirmations
    if ((counts?.confirms ?? 0) >= 2) {
      await run(c.env.DB, `UPDATE emergency_incidents SET status='confirmed' WHERE id = ? AND status='live'`, id)
    }
    return c.json({ ok: true, ...counts })
  })

  // End / resolve the incident
  api.post('/emergency/incidents/:id/end', async (c) => {
    const id = c.req.param('id')
    const b = await c.req.json<{ status?: 'ended' | 'resolved' | 'false_alarm' }>().catch(() => ({} as any))
    await run(c.env.DB, `UPDATE emergency_incidents SET status = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?`, b.status ?? 'ended', id)
    const incident = await first(c.env.DB, 'SELECT * FROM emergency_incidents WHERE id = ?', id)
    return c.json({ ok: true, incident })
  })

  // Share to Midan (creates a real Midan post linked to the evidence)
  api.post('/emergency/incidents/:id/share-midan', async (c) => {
    const id = c.req.param('id')
    const inc = await first<any>(c.env.DB, 'SELECT * FROM emergency_incidents WHERE id = ?', id)
    if (!inc) return c.json({ ok: false, error: 'not_found' }, 404)
    const seg = await first<any>(c.env.DB, `SELECT COUNT(*) n FROM emergency_segments WHERE incident_id = ?`, id)
    const kindLabel: Record<string, string> = { fire: '🔥 Fire', medical: '🏥 Medical emergency', crime: '🚨 Crime', rights_violation: '⚖️ Rights violation' }
    const content = `${kindLabel[inc.kind] ?? inc.kind} — LIVE WITNESS RECORDING (${seg?.n ?? 0} tamper-evident segments) in ${inc.city}. Chain-verified evidence: /api/emergency/incidents/${id}/verify #CitizenWitness #${inc.city}`
    const r = await run(c.env.DB, `
      INSERT INTO posts (author_id, content, hashtags, city, anonymous) VALUES (?, ?, ?, ?, 0)
    `, inc.reporter_id, content, '#CitizenWitness', inc.city)
    await run(c.env.DB, `UPDATE emergency_incidents SET shared_midan_post_id = ? WHERE id = ?`, r.meta.last_row_id, id)
    return c.json({ ok: true, post_id: r.meta.last_row_id })
  })

  // List incidents (feed for nearby confirmations / gov channel / my incidents)
  api.get('/emergency/incidents', async (c) => {
    const city = c.req.query('city')
    const scope = c.req.query('scope')
    const rows = await all<any>(c.env.DB, `
      SELECT i.*, u.display_name reporter_name, u.handle reporter_handle,
        (SELECT COUNT(*) FROM emergency_segments s WHERE s.incident_id = i.id) segments,
        (SELECT COUNT(*) FROM emergency_confirmations cf WHERE cf.incident_id = i.id AND cf.verdict='confirm') confirms
      FROM emergency_incidents i LEFT JOIN users u ON u.id = i.reporter_id
      WHERE 1=1 ${city ? 'AND i.city = ?' : ''} ${scope ? 'AND i.scope = ?' : ''}
      ORDER BY i.started_at DESC LIMIT 30
    `, ...[city, scope].filter(Boolean) as string[])
    return c.json({ incidents: rows })
  })

  api.get('/emergency/incidents/:id', async (c) => {
    const incident = await first<any>(c.env.DB, `
      SELECT i.*, u.display_name reporter_name FROM emergency_incidents i
      LEFT JOIN users u ON u.id = i.reporter_id WHERE i.id = ?`, c.req.param('id'))
    if (!incident) return c.json({ ok: false, error: 'not_found' }, 404)
    const segments = await all(c.env.DB, `SELECT seq, media_cid, duration_ms, seg_hash, captured_at FROM emergency_segments WHERE incident_id = ? ORDER BY seq`, c.req.param('id'))
    const confirmations = await all(c.env.DB, `
      SELECT cf.*, u.display_name FROM emergency_confirmations cf
      LEFT JOIN users u ON u.id = cf.user_id WHERE cf.incident_id = ?`, c.req.param('id'))
    return c.json({ ok: true, incident, segments, confirmations })
  })

  // Emergency circles (e.g. Family Emergency) for a user
  api.get('/emergency/circles/:userId', async (c) => {
    const rows = await all(c.env.DB, `
      SELECT ec.*, g.name circle_name, g.member_count FROM emergency_circles ec
      LEFT JOIN cirkles g ON g.id = ec.circle_id
      WHERE ec.user_id = ?`, Number(c.req.param('userId')))
    return c.json({ circles: rows })
  })

  api.post('/emergency/circles', async (c) => {
    const b = await c.req.json<{ user_id: number; circle_id: number; label?: string }>().catch(() => ({} as any))
    if (!b.user_id || !b.circle_id) return c.json({ ok: false, error: 'user_id + circle_id required' }, 400)
    await run(c.env.DB, `INSERT OR REPLACE INTO emergency_circles (user_id, circle_id, label) VALUES (?, ?, ?)`,
      b.user_id, b.circle_id, b.label ?? 'Family Emergency')
    return c.json({ ok: true })
  })
}
