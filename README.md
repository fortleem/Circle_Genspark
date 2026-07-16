# Cirkle (دواير) — AI-Native Social Operating System

> A privacy-first, mesh-native, zero-cost super app for the global majority. Distinctive design identity that stands apart from every incumbent (WhatsApp / IG / X / YouTube / Telegram / TikTok).


## 🧠 Circle Brain AI — Central Orchestrator (NEW)

Circle Brain (عقل دواير) is the working brain of the platform. Every AI request flows through it:

**Pipeline**: intent classification → module data gathering → memory recall → live web grounding (Gemini google_search) → provider-mesh answer (Groq → Gemini → OpenAI failover) → interaction logging → knowledge distillation (self-learning).

| Endpoint | What it does |
|---|---|
| `POST /api/brain/ask` | Ask anything — full orchestration (modules + web + memory) |
| `POST /api/brain/intent` | Intent-only classification for client routing |
| `POST /api/brain/web-search` | Live web grounding with cited sources |
| `GET /api/brain/health` | Live probe of Groq / Gemini / OpenAI / HuggingFace |
| `GET/POST /api/brain/knowledge` | Self-learned memory (read / teach) |
| `GET /api/brain/interactions` + `POST …/:id/feedback` | Orchestration log + training feedback |
| `GET /api/brain/stats` | Learning progress dashboard |
| `GET /api/region/countries` | All 249 country nodes worldwide |
| `GET /api/region/node/:cc` | Per-country legal/compliance/payments/emergency node |

- **Frontend**: floating Brain orb (bottom-right) = real conversation UI with web-source citations; AI Core screen shows the live Brain dashboard (provider mesh, learned facts, recent orchestrations).
- **`/api/sage/chat` is now Brain-powered** — legacy Groq path kept only as failover.
- **Self-learning**: every exchange distils at most one durable, non-sensitive fact into `brain_knowledge` (D1) and is recalled into future prompts.
- **Module authority**: payments/emergency/region questions are answered ONLY from Circle's own country-node data — web results can never override them.

## Project Overview

- **Name**: Cirkle (دواير, *Dawayer*)
- **Goal**: Production-ready blueprint v12.0 implementation — covering §1 to §35 with **Cirkle-unique futuristic features** that have no equivalent in any competitor.
- **Tech Stack**: Vite 5 · React 18 · TypeScript 5 · Hono 4 · D1 SQLite · Tailwind 3 · shadcn/ui · framer-motion · TanStack Query · Cloudflare Pages
- **License**: Apache-2.0 · 100% free · zero ads

## URLs

- **Local Dev**: http://localhost:3000
- **Sandbox (live)**: https://3000-it5nz74mq9tqimweqqnml-c81df28e.sandbox.novita.ai
- **Production**: (deploy pending — see PRODUCTION_CHECKLIST.md)

## Cirkle-Unique Futuristic Features (no incumbent has these)

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
| F10 | **Family Vault** (`/api/vaults`) | ✅ | M-of-N Shamir social-recovery vault · SHA-256 anchored |
| F11 | **Cultural Interpreter** | ✅ | Tipping/etiquette/taboos by destination city |
| F12 | **Ticket Wallet** (`/api/tickets`) | ✅ | Cryptographically-anchored event passes · QR + transfer chain-of-custody |
| F13 | **Universal ⌘K Palette** | ✅ | Server-side fuzzy across rooms/channels/videos/posts/users |
| F14 | **Notifications Inbox** (`/api/notifications/:user`) | ✅ | Cross-pillar inbox w/ priority bands + kind colors |
| F15 | **Privacy Simulator** (`/api/privacy/sim`) | ✅ | "What Can X See?" — viewer-kind picker · 0-100 visibility score · prescriptive recs |
| F16 | **AI Consent Matrix** (`/api/ai/consents`) | ✅ | Per-pillar × per-tier (on-device / federated / cloud) consent toggles · privacy-by-default |
| F17 | **Citizen Shield** (`/api/citizen-shield/*`) | ✅ | National Civic Intelligence Services — incident reporting, evidence lock, witness network, authority routing, SLA escalation |

## Pillar Screens — World-Class Upgrades (Wave 3)

Each pillar now beats its global benchmark on parity AND adds Cirkle uniques:

### Mashahd 🎬 (beats YouTube)
**Full-screen TheaterPlayer** with YouTube parity (quality picker, captions multi-lang, smart speed 0.5-3×, PiP, keyboard shortcuts) + Cirkle uniques:
AI-chaptered timeline · Anchor-share (URL pinned to seconds) · Knowledge graph (people/places/sources) · Live scene poll · Fact-check note · Watch-party invite · Tip-while-watching · Reactions burst · Danmaku bullet comments.

### Wasl 💬 (beats WhatsApp)
**WaslComposerPro** with WhatsApp parity + Cirkle uniques:
On-device voice transcript (Web Speech API · never uploaded) · Scheduled send (local queue) · Inline translate preview (EN/AR/FR/ES/ZH) · Vanish timer (10s→7d) · Slash-command palette (/poll /location /payment /event /quote /ai) · Smart-reply chips · Privacy halo.

### Lamahat 📷 (beats Instagram)
**StoryCraftStudio** with IG parity + Cirkle uniques:
8 CSS filter presets (Saffron/Souq/Nile Dawn/Marble/Ramadan/Noir/Cyan/Original) · Music-sync with BPM auto-suggested by mood · AI auto-tags (offline) · Geo-anchor (None/Hood/City — never precise GPS) · Collaborative albums · On-device NSFW preview · Schedule post.

### Midan 🟢 (beats X/Twitter)
**MidanSignal** suite with X parity + Cirkle uniques:
SignalMeter real-time 0-100 score (rage/noise/signal detection) · AntiRageGate (10s breather + auto-rephrase when rage ≥ 0.4) · ConversationGraph per-post signal:noise:dispute breakdown · CrossPillarQuote (embed Mashahd video / Lamahat photo / Wasl message).

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

### Futuristic (Cirkle-unique)
- `GET /api/presence/mesh` · `POST /api/presence/:user_id`
- `GET /api/pulse` · `POST /api/pulse/event`
- `GET /api/capsules/feed` · `GET /api/capsules/:user_id` · `POST /api/capsules`
- `GET /api/whispers/:user_id` · `POST /api/whispers` · `POST /api/whispers/:id/view`
- `GET /api/lens/:city` · `POST /api/lens`
- `GET /api/echoes/:room_id` · `GET /api/constellation/:user_id`

### Wave 3 (Part 37 · Citizen Shield)
- `GET /api/citizen-shield/dashboard` — national civic intelligence view
- `GET /api/citizen-shield/reports?user_id=1` — list user's cases
- `GET /api/citizen-shield/reports/:id` — case details + evidence + witnesses + updates
- `POST /api/citizen-shield/reports` — submit incident with evidence lock and auto-routing
- `POST /api/citizen-shield/reports/:id/witness` — join as witness
- `POST /api/citizen-shield/reports/:id/escalate` — SLA breach / escalation
- `GET /api/citizen-shield/offices` — public service index

### Wave 2 (F10/F12/F15/F16 · Vault / Tickets / Privacy / AI Consent)
- `GET /api/vaults/:user_id` · `POST /api/vaults` · `POST /api/vaults/:id/consent`
- `GET /api/tickets/:user_id` · `POST /api/tickets` · `POST /api/tickets/:id/validate` · `POST /api/tickets/:id/transfer`
- `GET /api/privacy/sim/:user_id` · `POST /api/privacy/sim`
- `GET /api/ai/consents/:user_id` · `POST /api/ai/consents/:user_id`
- `GET /api/echoes/:room_id` · `POST /api/echoes`
- `GET /api/constellation/:user_id`

## Data Architecture

- **Storage**: Cloudflare D1 (SQLite at edge)
- **DB name**: `cirkle-production`
- **Migrations**: `0001` → `0015` (Citizen Shield applied locally)
- **Tables**: 30+ including `users`, `rooms`, `messages`, `posts`, `videos`, `photos`, `mail_outbox`, `notifications`, `shares`, `presence`, `pulse_events`, `time_capsules`, `whispers`, `reality_lens`, `echoes`, `citizen_reports`, `citizen_evidence`, `citizen_witnesses`, `citizen_office_index`

## User Guide

1. **Universal Command Palette**: Hit `⌘K` (Mac) or `Ctrl+K` (Windows) to instantly jump to any tab, content, or quick action.
2. **Notifications**: Click the bell in the top-right. Filter by all / unread / priority.
3. **Mesh status**: Look at the chip next to the bell — shows online users, mesh nodes (Reticulum), and active E2EE channels.
4. **Share across pillars**: Hit the share button on any video, photo, or post — pick Wasl room / Midan / Mail.
5. **Time Capsule** (Midan): Compose a post sealed today, unsealed at a future date you choose. Each capsule gets a SHA-256 anchor hash.
6. **Whisper** (Midan): Send a self-destruct message that burns after first view (configurable TTL + max-views).
7. **Cultural Interpreter** (Rihla): Pick a city — see local greetings, tipping norms, dress codes, taboos.
8. **Constellation** (Profile): Live 3-orbit visualization of your top connections by message volume.
9. **Citizen Shield** (`/shield`): Report civic incidents, attach hashed evidence, choose identity mode (verified / protected / anonymous), track SLA and routing, and see the national civic dashboard.

## Local Development

```bash
# Apply all migrations
npx wrangler d1 migrations apply cirkle-production --local

# Build + start
npm run build
pm2 start ecosystem.config.cjs

# Test
curl http://localhost:3000/api/health
```

## Production Deploy

Pending. See `PRODUCTION_CHECKLIST.md` for full §1-§35 blueprint mapping.

## Status

- ✅ Migrations 0001–0015 applied
- ✅ 33+ routes 200 OK
- ✅ Zero console errors on /midan /wasl /profile /rihla /home /mail /lamahat /mashahd /shield
- ✅ All 15 futuristic features wired end-to-end (UI + API + DB)
- ✅ Tip webhook hardened (graceful 404 instead of 500)
- ✅ Citizen Shield (Part 37) wired: `/shield` route, nav, API, D1 migration, local preview
- ⏳ Production Cloudflare D1 + Pages deploy (local-only per current directive)
- **Last Updated**: 2026-06-30
