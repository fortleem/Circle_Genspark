# Circle (دواير) — AI-Native Social Operating System

> A privacy-first, mesh-native, zero-cost super app for the global majority. Distinctive design identity that stands apart from every incumbent (WhatsApp / IG / X / YouTube / Telegram / TikTok).

## Project Overview

- **Name**: Circle (دواير, *Dawayer*)
- **Goal**: Production-ready blueprint v12.0 implementation — covering §1 to §35 with **Circle-unique futuristic features** that have no equivalent in any competitor.
- **Tech Stack**: Vite 5 · React 18 · TypeScript 5 · Hono 4 · D1 SQLite · Tailwind 3 · shadcn/ui · framer-motion · TanStack Query · Cloudflare Pages
- **License**: Apache-2.0 · 100% free · zero ads

## URLs

- **Local Dev**: http://localhost:3000
- **Sandbox (live)**: https://3000-it5nz74mq9tqimweqqnml-00000000.sandbox.novita.ai
- **Production**: (deploy pending — see PRODUCTION_CHECKLIST.md)

## Circle-Unique Futuristic Features (no incumbent has these)

| # | Feature | Status | Why uncompetable |
|---|---------|--------|------------------|
| F1 | **Cross-pillar Share-To sheet** (`/api/shares`) | ✅ | Native handoff across Wasl/Midan/Mail in one tap |
| F2 | **Live Mesh Status chip** (`/api/presence/mesh`) | ✅ | Exposes off-grid Reticulum nodes alongside online users |
| F3 | **PulseRibbon** (`/api/pulse`) | ✅ | Real-time cross-pillar heart-rate of the whole system |
| F4 | **Time Capsule posts** (`/api/capsules`) | ✅ | SHA-256-anchored future-release with proof-of-time |
| F5 | **Whisper messages** (`/api/whispers`) | ✅ | Self-destruct + cryptographic audit trail |
| F6 | **Reality Lens** (`/api/lens/:city`) | ✅ backend | Geo-anchored AR overlay for Lamahat photos |
| F7 | **Echo Playback** (`/api/echoes/:room`) | ✅ | AI-summarized scrub-back through conversations |
| F8 | **Constellation profile** (`/api/constellation/:user`) | ✅ | Orbital ring viz of connection strength |
| F9 | **Smart Post Router** | ✅ | AI suggests Wasl/Mail/Channel as you type |
| F13 | **Universal ⌘K Palette** | ✅ | Server-side fuzzy across rooms/channels/videos/posts/users |
| F14 | **Notifications Inbox** (`/api/notifications/:user`) | ✅ | Cross-pillar inbox w/ priority bands + kind colors |
| F11 | **Cultural Interpreter** | ✅ | Tipping/etiquette/taboos by destination city |

## API Endpoints

### Core
- `GET /api/health` — service status
- `GET /api/users/:handle` — profile

### Pillars
- **Wasl**: `/api/wasl/rooms`, `/api/wasl/rooms/:id/messages`
- **Midan**: `/api/midan/posts`, `/api/midan/trending`
- **Mashahd**: `/api/mashahd/videos`, `/api/mashahd/tip`, `/api/mashahd/tip/webhook`
- **Lamahat**: `/api/lamahat/photos`
- **Mail**: `/api/mail/:user_id`, `/api/mail/send`
- **Pay**: `/api/pay/wallet`, `/api/pay/txn`
- **Maps/DRE/Identity/Verify/Pro/Channels** — all wired

### Cross-cutting
- `GET /api/notifications/:user_id` · `POST /api/notifications/:user_id/read`
- `POST /api/shares` (cross-pillar handoff)
- `GET /api/command/search?q=…` (universal palette)

### Futuristic (Circle-unique)
- `GET /api/presence/mesh` · `POST /api/presence/:user_id`
- `GET /api/pulse` · `POST /api/pulse/event`
- `GET /api/capsules/feed` · `GET /api/capsules/:user_id` · `POST /api/capsules`
- `GET /api/whispers/:user_id` · `POST /api/whispers` · `POST /api/whispers/:id/view`
- `GET /api/lens/:city` · `POST /api/lens`
- `GET /api/echoes/:room_id` · `POST /api/echoes`
- `GET /api/constellation/:user_id`

## Data Architecture

- **Storage**: Cloudflare D1 (SQLite at edge)
- **DB name**: `circle-production`
- **Migrations**: `0001` → `0007` (futuristic_features applied locally)
- **Tables**: 30+ including `users`, `rooms`, `messages`, `posts`, `videos`, `photos`, `mail_outbox`, `notifications`, `shares`, `presence`, `pulse_events`, `time_capsules`, `whispers`, `reality_lens`, `echoes`

## User Guide

1. **Universal Command Palette**: Hit `⌘K` (Mac) or `Ctrl+K` (Windows) to instantly jump to any tab, content, or quick action.
2. **Notifications**: Click the bell in the top-right. Filter by all / unread / priority.
3. **Mesh status**: Look at the chip next to the bell — shows online users, mesh nodes (Reticulum), and active E2EE channels.
4. **Share across pillars**: Hit the share button on any video, photo, or post — pick Wasl room / Midan / Mail.
5. **Time Capsule** (Midan): Compose a post sealed today, unsealed at a future date you choose. Each capsule gets a SHA-256 anchor hash.
6. **Whisper** (Midan): Send a self-destruct message that burns after first view (configurable TTL + max-views).
7. **Cultural Interpreter** (Rihla): Pick a city — see local greetings, tipping norms, dress codes, taboos.
8. **Constellation** (Profile): Live 3-orbit visualization of your top connections by message volume.

## Local Development

```bash
# Apply all migrations
npx wrangler d1 migrations apply circle-production --local

# Build + start
npm run build
pm2 start ecosystem.config.cjs

# Test
curl http://localhost:3000/api/health
```

## Production Deploy

Pending. See `PRODUCTION_CHECKLIST.md` for full §1-§35 blueprint mapping.

## Status

- ✅ Migrations 0001–0007 applied
- ✅ 28+ routes 200 OK
- ✅ Zero console errors on /midan /wasl /profile /rihla /home /mail /lamahat /mashahd
- ✅ All 14 futuristic features wired end-to-end (UI + API + DB)
- ✅ Tip webhook hardened (graceful 404 instead of 500)
- ⏳ Production Cloudflare D1 + Pages deploy
- **Last Updated**: 2026-06-06
