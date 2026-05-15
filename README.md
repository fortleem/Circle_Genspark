# Circle (دواير) — Web Companion · v12 redesign

> AI-native super app · Privacy-first · Federated · $0 forever
>
> A working web companion implementing the **CIRCLE BLUEPRINT v12.0** on Cloudflare Pages.

## Project Overview

- **Name**: Circle / دواير
- **Tagline**: One app, every life — free forever
- **Stack**: Hono 4 (SSR JSX) · Cloudflare Pages · D1 (SQLite at edge) · Tailwind 3 CDN · Vanilla JS
- **Identity**: Golden four-quadrant circle on parchment/obsidian palette (auto dark mode)
- **Status**: ✅ Active · all 31 pages return 200 · all 41 API endpoints respond

This is a **web companion** that demonstrates the architecture, content, and UX of the planned Flutter native super-app described in the blueprint. The native Matrix/IPFS/Bluetooth/ONNX features are *modelled* in D1 with realistic data and explained in dedicated pages.

## What's new in this turn (v12 redesign)

### UI redesign — premium, modern, dual-theme
- **Dark mode toggle** with pre-paint inline script (no FOUC), preference saved to `localStorage`
- **Glassmorphism + depth shadows** on every card surface via the new design tokens (`--shadow-sm/md/lg/gold`)
- **Animated hero** with conic-gradient golden logo and dual rotating dashed aura rings
- **Stat count-up animations** triggered by `IntersectionObserver`
- **Command palette** (⌘K / Ctrl+K) — fuzzy-search every module and feature
- **Grouped sidebar nav** (Discover · Four Pillars · Community · Life · AI & Privacy · Open Source)
- **Mobile-first off-canvas drawer** with backdrop blur
- **Masonry photo grid** for Lamahat and the home Glimpses section
- **Animated progress bars** with shimmer overlay (governance, AI training, roadmap)
- **Mesh-peer pulsing avatars** with concentric expanding rings
- **CSS variable theme** so the older module pages automatically inherit the new look in both light + dark modes
- **Sticky translucent top bar** with command-palette trigger, language/country selectors, theme toggle, identity link

### Blueprint gap implementation
12 new full-page modules built from the previously un-implemented blueprint sections, plus matching DB tables, seed data and API endpoints:

| § | Page | Implements |
|---|------|------------|
| §15 | `/mesh` | BLE + Wi-Fi Direct + libp2p mesh, live peer table, SOS broadcast (writes to D1) |
| §17 | `/aisafety` | Hybrid moderation pipeline, detector cards, public audit log, jury appeals |
| §18 | `/aicore` | Per-model on-device training stats, federated rounds table, DP parameters (ε/δ) |
| §23 | `/maps` | TileServer GL + Nominatim + OSRM stack, offline region packs catalogue |
| §24 | `/translate` | Live demo against `/api/translate`, modality matrix, multilingual family scenario |
| §26 | `/unique` | All 10 differentiating features (Smart Post Router, Memoir, Knowledge Circles, Vault, Echoes, Danmaku, Smart Notifications, …) |
| §27 | `/backup` | 4 backup methods including Shamir M-of-N Trusted Circle Recovery |
| §28 | `/privacy` | Privacy Score, consent registry table, dual-identity, screenshot/forwarding consent |
| §32 | `/models` | Full AI Model Catalogue grouped by category, sizes, licences, formats |
| §33 | `/selfhost` | One-line installers for every infrastructure piece, live community-node registry |
| §34 | `/roadmap` | 9-phase timeline with vertical-rail layout, status chips, overall progress bar |
| §35 | `/journeys` | 9 end-to-end user stories (Layla, Ahmed, Sara, Mona, Zhang Wei, Karim, Ali, Ezz family, Nour) |

## URLs

- **Local sandbox**: <https://3000-it5nz74mq9tqimweqqnml-c81df28e.sandbox.novita.ai>
- **Local dev**: <http://localhost:3000>
- **Repo path**: `/home/user/webapp`

## Page map (31 routes)

```
Discover         /                  /events           /apps
Four Pillars     /wasl              /mashahd          /lamahat          /midan
Community        /circles           /channels         /creators         /pro
Life             /rihla             /maps             /pay              /mail
AI & Privacy     /aicore            /mesh             /translate        /privacy          /aisafety         /backup
Open Source      /unique            /models           /selfhost         /roadmap          /journeys
                 /governance        /transparency
Misc             /covenant          /id               /settings
```

## API map (41 endpoints)

```
META         GET  /api/health         GET  /api/names              GET  /api/region            GET  /api/region/plane/:c
USERS        GET  /api/users          GET  /api/users/:handle
MIDAN        GET  /api/midan/posts    POST /api/midan/posts        POST /api/midan/posts/:id/like
WASL         GET  /api/wasl/rooms     GET  /api/wasl/rooms/:id/messages    POST /api/wasl/rooms/:id/messages
MASHAHD      GET  /api/mashahd/videos POST /api/mashahd/videos/:id/view    POST /api/mashahd/videos/:id/like
LAMAHAT      GET  /api/lamahat/photos POST /api/lamahat/photos/:id/like
CIRCLES      GET  /api/circles
CHANNELS     GET  /api/channels       GET  /api/channels/:slug/posts
PRO          GET  /api/pro/jobs       GET  /api/pro/profiles
RIHLA        POST /api/rihla/itinerary    GET  /api/rihla/itineraries
PAY          GET  /api/pay/wallet/:user_id  POST /api/pay/send
MAIL         GET  /api/mail/:user_id
EVENTS       GET  /api/events         POST /api/events/:id/interested
GOVERNANCE   GET  /api/governance/proposals    POST /api/governance/proposals/:id/vote
TRANSP       GET  /api/transparency/ledger
APPS         GET  /api/apps
TRANSLATE    POST /api/translate
v12 NEW:
MESH         GET  /api/mesh/peers     GET  /api/mesh/sos           POST /api/mesh/sos
MODERATION   GET  /api/moderation/actions
AI CORE      GET  /api/ai/training/:user_id    POST /api/ai/training/:user_id/opt
MAPS         GET  /api/maps/regions
BACKUP       GET  /api/backup/:user_id
PRIVACY      GET  /api/privacy/:user_id
MODELS       GET  /api/models
SELF-HOST    GET  /api/selfhost/nodes
ROADMAP      GET  /api/roadmap
```

## Data architecture

### D1 schema (29 tables across 2 migrations)
**0001_initial_schema.sql** — 18 tables: `users`, `rooms`, `room_members`, `messages`, `videos`, `photos`, `posts`, `post_replies`, `circles`, `channels`, `channel_posts`, `pro_profiles`, `pro_jobs`, `travel_itineraries`, `wallets`, `transactions`, `mail_messages`, `events`, `governance_proposals`, `ad_revenue_ledger`, `mini_apps`.

**0002_v12_gaps.sql** (new) — 11 tables: `mesh_peers`, `sos_alerts`, `moderation_actions`, `ai_training_stats`, `federated_rounds`, `map_regions`, `backups`, `privacy_consent`, `ai_models`, `self_host_nodes`, `roadmap_phases`.

Seed data: 10 users · 9 posts · 8 videos · 8 photos · 6 circles · 8 channels · 8 events · 3 proposals · 8 ad ledger rows · 8 mini apps · 8 mesh peers · 3 SOS alerts · 7 moderation actions · 5 AI training rows · 5 federated rounds · 8 map regions · 6 backups · 10 consent rows · 14 AI models · 10 self-host nodes · 9 roadmap phases.

### Front-end design system
The new `public/static/style.css` defines a **CSS-variables-first** theme system:

```
--gold / --gold-dark / --gold-light / --gold-glow
--bg / --bg-elev / --bg-soft / --surface / --surface-strong
--ink / --ink-soft / --muted / --muted-2
--border / --border-strong
--shadow-sm / --shadow-md / --shadow-lg / --shadow-gold
```

`html.dark` flips every variable atomically. Older pages get a back-compat shim (`html.dark .bg-cream { … }`) so they auto-adapt without rewrites.

### i18n
8 locales (`ar`, `en-BRAND`, `en`, `zh`, `fr`, `es`, `de`, `it`) with full name matrix now covering 34 fields (added 12 new fields for the gap-section module names). RTL handled at the `<html dir>` level.

## User guide

1. Visit `/` for the launchpad. Quick actions, four pillars, trending hashtags, official channels, sponsored block.
2. Toggle dark mode in the top-right (sun/moon icon). Preference persists across reloads.
3. Press **⌘K** (or **Ctrl+K**) to open the command palette — jump anywhere instantly.
4. Switch language or country from the header selectors — content (city, payment method, AI source) re-renders accordingly.
5. Try the live demos:
   - `/translate` → translate text via the on-device-style NLLB-200 stub
   - `/mesh` → tap "Send SOS broadcast" to simulate a mesh distress beacon
   - `/rihla` → generate a multi-day itinerary
   - `/pay` → send a payment to another seeded user
   - `/midan` → compose a post (anonymous or signed)

## Deployment

- **Platform**: Cloudflare Pages (web companion) · Flutter (target native runtime)
- **Local dev**: `pm2 start ecosystem.config.cjs` then `curl http://localhost:3000`
- **Build**: `npm run build` produces `dist/_worker.js` (~216 KB)
- **Database (local)**: `npm run db:migrate:local && npx wrangler d1 execute circle-production --local --file=./seed.sql && npx wrangler d1 execute circle-production --local --file=./seed_v12.sql`

### Apply migrations from scratch
```bash
cd /home/user/webapp
rm -rf .wrangler/state/v3/d1   # nuke local DB
npx wrangler d1 migrations apply circle-production --local
npx wrangler d1 execute circle-production --local --file=./seed.sql
npx wrangler d1 execute circle-production --local --file=./seed_v12.sql
npm run build
pm2 restart circle-webapp
```

## Project structure

```
webapp/
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_v12_gaps.sql           ← new
├── seed.sql                         (core seed)
├── seed_v12.sql                     ← new (gap-section seed)
├── src/
│   ├── index.tsx                    (router · 31 routes)
│   ├── renderer.tsx                 ← redesigned shell + nav + cmd-palette
│   ├── db.ts                        (D1 helpers)
│   ├── i18n.ts                      (8 locales · 34 keys)
│   ├── dre.ts                       (Dynamic Regional Engine · 6 data planes)
│   ├── routes/api.ts                (41 endpoints)
│   └── pages/
│       ├── home.tsx                 ← redesigned
│       ├── wasl.tsx · mashahd.tsx · lamahat.tsx ← masonry · midan.tsx
│       ├── circles.tsx · channels.tsx · pro.tsx · rihla.tsx
│       ├── mail.tsx · pay.tsx · apps.tsx
│       ├── governance.tsx · transparency.tsx · static_pages.tsx
│       └── (new) mesh.tsx · aicore.tsx · aisafety.tsx · maps.tsx
│                 translate.tsx · unique.tsx · backup.tsx · privacy.tsx
│                 models.tsx · selfhost.tsx · roadmap.tsx · journeys.tsx
├── public/static/
│   ├── style.css                    ← rewritten · dual-theme · glassmorphism
│   └── app.js                       ← rewritten · cmd-palette · theme toggle · counters · mesh demo
├── ecosystem.config.cjs
├── vite.config.ts
└── wrangler.jsonc
```

## What's still mocked (and why)
- Matrix homeserver, IPFS, PeerTube, libp2p, NLLB-200 inference — none actually run; D1 stores the realistic data the native app would produce
- Cloudflare Pages cannot host the long-lived Synapse, IPFS daemons, ML runtimes; the native Flutter binary will. This webapp shows the data model and UX.

## Last updated
2026-05-15
