# Circle (دواير) — Web Companion

> AI-native super app · Privacy-first · Federated · $0 forever
>
> A working web companion implementing the **CIRCLE BLUEPRINT v12.0** on Cloudflare Pages.

## Project Overview

- **Name**: Circle / دواير
- **Tagline**: One app, every life — free forever
- **Goal**: Replace WhatsApp, YouTube, Instagram, X, LinkedIn, Trip.com, Gmail, Maps, Zoom, and more — with a single open-source, federated, privacy-first super app.
- **Scope of this web companion**: All 10 core modules from the blueprint are implemented as a server-rendered Hono + Cloudflare Pages app with a D1 database backend. The full production system also requires a Flutter mobile client with Matrix homeservers, IPFS, PeerTube, ONNX on-device models, NFC payments, and mesh networking — those are out of scope here.

## Live URLs

| | URL |
| --- | --- |
| **Web companion (sandbox)** | https://3000-it5nz74mq9tqimweqqnml-c81df28e.sandbox.novita.ai |
| **Local dev** | http://localhost:3000 |
| **API base** | /api |

## Currently Completed Features

### Identity & i18n
- **Dynamic Naming Convention** — 7 languages + 2 English variants (Brand vs US) per blueprint §2:
  `ar / en-BRAND / en / zh / fr / es / de / it`. Switch in the header dropdown.
  E.g. lang=ar shows **دواير / وصل / مشاهد / ميدان**, lang=fr shows **Cercle / Relier / Regards / Place**.
- **RTL layout** auto-applied for Arabic.
- **Visual identity** — golden Circle logo with four quadrants (Cormorant Garamond + Cairo fonts).

### Dynamic Regional Engine (DRE) — blueprint §4
- Six data planes: **global / china / russia / iran / vietnam / eu**.
- Per-country payment methods, compliance flags, blocked domains, cultural events.
- Country selector in header switches the entire app behavior instantly.
- Live config viewer at `/settings`.

### Module pages (server-rendered, D1-backed)

| Path | Module | Blueprint § |
| --- | --- | --- |
| `/` | Home Dashboard (carousel + quick actions + 4 pillars + nearby events + For You + trending + official updates + sponsored) | §5 |
| `/wasl` | Wasl / Connect — E2EE chat with room list, message thread, send | §6 |
| `/mashahd` | Mashahd / Watch — federated video feed with featured + grid | §7 |
| `/lamahat` | Lamahat / Glimpses — photo feed (IPFS-pinned mock) | §8 |
| `/midan` | Midan / Square — ActivityPub-style timeline with compose + like + anonymous toggle | §9 |
| `/circles` | The Circle — groups (public/private/secret) | §10 |
| `/channels` | Official Channels — verified gov/edu/service feeds | §11–12 |
| `/creators` | Creator Channels | §13 |
| `/channels/:slug` | Channel detail with posts | §11 |
| `/pro` | Professional Network — jobs + profiles | §14 |
| `/rihla` | Circle Travel — AI itinerary generator | §24 |
| `/mail` | Circle Mail — inbox/sent/drafts/spam | §22 |
| `/pay` | Circle Payments / Nat — wallet + send (handle / QR / NFC) | §21 |
| `/apps` | Mini App Hub | §26 |
| `/governance` | DAO proposals + voting | §29 |
| `/transparency` | Ad-revenue ledger | §30 |
| `/covenant` | The Circle Covenant (8 promises) | §1 |
| `/id` | Circle ID + Verify | §16, §23 |
| `/events` | All upcoming events | §5 |
| `/settings` | Language + country + DRE viewer | §4 |

### Functional API endpoints

All JSON, served from `/api`:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET`  | `/api/health` | Liveness probe |
| `GET`  | `/api/region?country=XX` | Resolve full DRE config for a country |
| `GET`  | `/api/region/plane/:country` | Just the plane name |
| `GET`  | `/api/names?lang=ar` | Full dynamic naming matrix for a language |
| `GET`  | `/api/users`, `/api/users/:handle` | Circle ID directory |
| `GET`  | `/api/midan/posts?city=Cairo` | List Square posts |
| `POST` | `/api/midan/posts` | Create post `{author_id, content, hashtags?, city?, anonymous?}` |
| `POST` | `/api/midan/posts/:id/like` | Like a post |
| `GET`  | `/api/wasl/rooms` | Wasl rooms with last message |
| `GET`  | `/api/wasl/rooms/:id/messages` | Room thread |
| `POST` | `/api/wasl/rooms/:id/messages` | Send message `{sender_id, body}` |
| `GET`  | `/api/mashahd/videos` | Video feed |
| `POST` | `/api/mashahd/videos/:id/{view,like}` | Engagement |
| `GET`  | `/api/lamahat/photos` | Photo feed |
| `POST` | `/api/lamahat/photos/:id/like` | Like a photo |
| `GET`  | `/api/circles` | Group directory |
| `GET`  | `/api/channels?type=official` | Channel directory |
| `GET`  | `/api/channels/:slug/posts` | Channel posts |
| `GET`  | `/api/pro/jobs`, `/api/pro/profiles` | Pro network |
| `POST` | `/api/rihla/itinerary` | Generate plan `{city, days, interests[]}` |
| `GET`  | `/api/rihla/itineraries` | Saved itineraries |
| `GET`  | `/api/pay/wallet/:user_id` | Wallet + recent transactions |
| `POST` | `/api/pay/send` | Send funds `{from_user, to_handle, amount, method, note}` |
| `GET`  | `/api/mail/:user_id?folder=inbox` | Mail folder listing |
| `GET`  | `/api/events?city=Cairo` | Local events |
| `POST` | `/api/events/:id/interested` | RSVP increment |
| `GET`  | `/api/governance/proposals` | DAO proposals |
| `POST` | `/api/governance/proposals/:id/vote` | Cast vote `{vote:"yes"|"no"}` |
| `GET`  | `/api/transparency/ledger` | Ad-revenue ledger + allocation totals |
| `GET`  | `/api/apps` | Mini-app catalogue |
| `POST` | `/api/translate` | On-device translation stub `{text, to, from?}` |

## Data Architecture

- **Storage service**: Cloudflare D1 (SQLite at the edge).
- **Schema**: 18 tables — users, rooms, room_members, messages, videos, photos, posts, post_replies, circles, channels, channel_posts, pro_profiles, pro_jobs, travel_itineraries, wallets, transactions, mail_messages, events, governance_proposals, ad_revenue_ledger, mini_apps.
- **Seeded with** realistic Egyptian-focused data plus globally relevant samples (Shanghai, Berlin, Riyadh, Chicago).
- **Privacy boundary**: in production the heavy data (E2EE messages, biometric face vectors, recommendation embeddings, personal photos) stays on-device. The D1 tables here mirror only the public/federated parts and demo fixtures.

## User Guide

1. Open the live URL above.
2. Use the **header dropdowns** to switch language (try `العربية` — entire UI flips RTL and shows دواير / وصل / ميدان) and country (try `CN` — payment methods become WeChat/Alipay, plane becomes CHINA).
3. From the **Home Dashboard**, tap any of the four pillars (Wasl / Mashahd / Lamahat / Midan) or any sidebar module.
4. **Midan**: write a post, click ❤️ to like. Anonymous toggle hides identity.
5. **Wasl**: pick a conversation, send a message — it persists in D1.
6. **Rihla**: enter a destination + days + interests, get a generated itinerary (deterministic mock; real client uses GROQ free tier).
7. **Pay**: send EGP from Ahmed → @layla — wallet balance updates, transaction shows in the ledger, fee is **$0.00**.
8. **Governance**: vote yes/no on open proposals. Tallies update.
9. **Transparency**: full ledger of who paid for ads, where, and how the money was allocated.
10. **Settings**: see the resolved DRE config as JSON.

## Features Not Yet Implemented

The blueprint v12.0 includes systems that require a native mobile runtime or external infrastructure. These are **deliberately stubbed** in this web companion:

- **Matrix homeservers** (Synapse) — chat persistence is mocked in D1; no real E2EE Olm/Megolm.
- **IPFS pinning + WebTorrent seeding** — video/photo CIDs are placeholders.
- **ActivityPub federation** — posts are local-only; no real fediverse delivery.
- **PeerTube transcoding** — videos show thumbnails, no real playback.
- **On-device ONNX models** — NSFW blur, NLLB-200 translation, face matching, smart replies (mobile-only).
- **Mailcow** — `/mail` reads D1 fixtures, not real IMAP.
- **ntfy push** — no out-of-app notifications.
- **Local mesh networking** (Wi-Fi Direct / BLE / LoRa).
- **Real-name verification + government ID integrations** (CTID, EG digital ID, Aadhaar).
- **TURN/Coturn voice/video calls**.
- **Self-host installers** (`install-maktab.sh`, `self-host-all.sh`).
- **Real GROQ / Hugging Face inference** — itinerary endpoint returns a deterministic mock.

## Recommended Next Steps

1. **Hook up a real Matrix homeserver** for Wasl. Replace the D1-backed `/api/wasl/*` endpoints with a Matrix Client-Server SDK proxy.
2. **Migrate Mashahd uploads to IPFS + a PeerTube instance** (community-hosted on a $5 VPS).
3. **Wire the real GROQ free tier** behind `/api/rihla/itinerary` for genuine AI itineraries.
4. **Add a Flutter mobile client** that consumes the same `/api/*` endpoints with on-device E2EE.
5. **Add WebAuthn / passkey login** to `/id` — currently Circle ID is a directory only.
6. **Implement the signed region-config delivery** (Ed25519) described in blueprint §4.10.
7. **Add a public Cloudflare D1 deployment** — replace `local-dev-placeholder` in `wrangler.jsonc` with a real database ID.
8. **Wire push notifications via ntfy** for real-time updates on the web companion.
9. **Add MOR/audit dashboards** for community node operators (currently `/transparency` shows the ledger but not node-by-node stats).

## Tech Stack

- **Framework**: Hono 4 (Cloudflare Workers/Pages)
- **Frontend**: Server-rendered JSX (hono/jsx) + Tailwind via CDN + Font Awesome + axios + dayjs
- **Persistence**: Cloudflare D1 (SQLite)
- **Build**: Vite 6 + `@hono/vite-build/cloudflare-pages`
- **Runtime**: Cloudflare Pages (edge), local dev via `wrangler pages dev`
- **Languages**: TypeScript everywhere
- **Process manager**: PM2 (sandbox dev)
- **Fonts**: Cormorant Garamond (display), Cairo (UI / Arabic), Noto Sans SC (Chinese)
- **Identity palette**: gold `#C2A060` · goldDark `#8E6E2C` · ink `#1B1B1B` · cream `#F8F2E4`

## Project Structure

```
webapp/
├── migrations/
│   └── 0001_initial_schema.sql        # 18 tables
├── seed.sql                            # realistic seed data
├── src/
│   ├── index.tsx                       # Hono app + routes
│   ├── renderer.tsx                    # JSX renderer with sidebar + header + footer
│   ├── i18n.ts                         # 8-locale naming matrix
│   ├── dre.ts                          # Dynamic Regional Engine
│   ├── db.ts                           # D1 helpers (all/first/run, timeAgo, fmt)
│   ├── routes/
│   │   └── api.ts                      # All JSON endpoints
│   └── pages/
│       ├── home.tsx
│       ├── wasl.tsx
│       ├── mashahd.tsx
│       ├── lamahat.tsx
│       ├── midan.tsx
│       ├── circles.tsx
│       ├── channels.tsx
│       ├── pro.tsx
│       ├── rihla.tsx
│       ├── mail.tsx
│       ├── pay.tsx
│       ├── apps.tsx
│       ├── governance.tsx
│       ├── transparency.tsx
│       └── static_pages.tsx            # covenant, id, settings, events
├── public/static/
│   ├── style.css                       # golden identity + bubbles + thumbnails
│   └── app.js                          # client-side interactions
├── ecosystem.config.cjs                # PM2 config
├── wrangler.jsonc                      # Cloudflare config + D1 binding
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Local Development

```bash
# One-time setup (already done in this sandbox)
cd /home/user/webapp
npm install
npm run db:migrate:local
npm run db:seed:local

# Build + run
npm run build
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# Logs (non-blocking)
pm2 logs circle-webapp --nostream --lines 50

# Test
curl http://localhost:3000/api/health
curl 'http://localhost:3000/api/region?country=CN'
curl 'http://localhost:3000/api/names?lang=ar'
```

## Deployment

- **Platform**: Cloudflare Pages
- **Status**: ✅ Running in sandbox · ❌ Not yet deployed to public Cloudflare Pages
- **To deploy**: `npm run build && npx wrangler pages deploy dist --project-name circle-webapp`
- **Pre-requisite**: Create the production D1 database (`npx wrangler d1 create circle-production`) and paste the returned `database_id` into `wrangler.jsonc`, then run `npx wrangler d1 migrations apply circle-production`.

## License

Apache 2.0 — per the Circle Covenant, the codebase is open source in perpetuity.

## The Covenant

> $0 forever · No tracking · No targeted ads · Data stays on device · Federated by design · E2EE everywhere · Open source forever · Community governance

— from `/covenant`

**Last updated**: 2026-05-13
