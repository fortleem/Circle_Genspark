// — Zero-Cost Technical Architecture (full 3.1 → 3.12 coverage)
import { PageShell, GlassCard, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Layers, Database, Network, Workflow, Cpu, Bell, Map as MapIcon, Mail, DollarSign, Server, Check } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

// 3.1 Tech stack layers
const TECH_LAYERS = [
  { layer: "Mobile client", tech: "Flutter 3 + Dart 3", cost: "$0", why: "Single codebase, iOS + Android + Web from one binary" },
  { layer: "Web companion", tech: "Vite 5 + React 18 + TypeScript", cost: "$0", why: "Cloudflare Pages free tier covers 100k req/day" },
  { layer: "Edge functions", tech: "Cloudflare Workers + Hono 4", cost: "$0", why: "Free tier 100k req/day; Cloudflare D1 SQLite included" },
  { layer: "Messaging", tech: "Matrix (Synapse / Dendrite)", cost: "$0", why: "Self-host on $5 VPS or use volunteer homeservers" },
  { layer: "Social graph", tech: "ActivityPub + Mastodon-compat", cost: "$0", why: "Federation = no single point of paid storage" },
  { layer: "Media storage", tech: "IPFS (go-ipfs/Kubo)", cost: "$0", why: "Content-addressed, viewers become seeders" },
  { layer: "Video", tech: "PeerTube + WebTorrent + HLS", cost: "$0", why: "P2P streaming eliminates CDN costs" },
  { layer: "Push notifications", tech: "ntfy (self-host)", cost: "$0", why: "Replaces Firebase. Single $5 VPS handles 100k devices" },
  { layer: "Email", tech: "Mailcow (Docker)", cost: "$0", why: "Free @circle.app via volunteer-hosted Mailcow node" },
  { layer: "Maps", tech: "MapLibre + OSM + IPFS tiles", cost: "$0", why: "OSM tiles pinned via IPFS, no Google Maps API" },
  { layer: "AI inference", tech: "ONNX Runtime + Hugging Face FREE", cost: "$0", why: "On-device for users; community VPS for heavy" },
];

// 3.2 Message data flow steps
const DATA_FLOW = [
  { n: 1, t: "Type message" },
  { n: 2, t: "Encrypt with Olm (1:1) or Megolm (group)" },
  { n: 3, t: "Store in local Drift DB (status = pending)" },
  { n: 4, t: "Send encrypted payload to home server" },
  { n: 5, t: "Synapse stores in room" },
  { n: 6, t: "Forward to recipient's home server (federation)" },
  { n: 7, t: "Deliver to recipient device" },
  { n: 8, t: "Decrypt & display" },
  { n: 9, t: "Delivery receipt back to sender" },
  { n: 10, t: "Sender DB updates status = sent" },
];

// 3.3 Drift DB schema
const DB_TABLES = [
  { name: "Messages", cols: ["id", "roomId", "sender", "body", "timestamp", "status", "isEncrypted", "attachmentCid"] },
  { name: "IdentityAttestations", cols: ["id", "userId", "verifiedClaim", "issuedAt", "attestationHash", "revoked"] },
  { name: "Backups", cols: ["backupId", "createdAt", "encryptedData", "encryptionAlgorithm", "signature"] },
  { name: "Contacts", cols: ["matrixId", "displayName", "avatarCid", "lastSeen", "trustLevel"] },
  { name: "MediaCache", cols: ["cid", "mediaType", "size_bytes", "downloadedAt", "expiresAt"] },
];

// 3.4 Maktab installer
const INSTALLER_STEPS = [
  "Install Docker & Docker Compose on Ubuntu 22.04 VPS ($5/mo)",
  "Clone Circle's workspace-stack repository",
  "Generate config from .env template (SERVER_NAME, ADMIN_EMAIL)",
  "Start services: Synapse + Postgres + ntfy + Workspace Manager",
  "Register admin user with secure random password",
  "Issue Let's Encrypt cert and bind https://wasl.<domain>",
];

// 3.5 Mashahd upload flow
const MASHAHD_FLOW = [
  "User records video → temp on device",
  "Compress with ffmpeg (H.264 720p 2 Mbps, AAC)",
  "Add to local IPFS node (bundled go-ipfs)",
  "IPFS returns CID (e.g., QmXo…)",
  "Create ActivityPub Create activity with CID attachment",
  "Publish to community PeerTube inbox",
  "PeerTube transcodes to HLS, makes available",
  "Viewers stream via WebTorrent; HLS fallback if <3 peers",
  "Viewer device seeds video back (opt-out available)",
];

// 3.10 Cost table
const COSTS = [
  { item: "Hosting (per 1M users)", legacy: "$50,000/mo", circle: "$0", why: "Volunteer Matrix + IPFS" },
  { item: "CDN (video)", legacy: "$20,000/mo", circle: "$0", why: "WebTorrent P2P" },
  { item: "Push notifications", legacy: "$5,000/mo", circle: "$60/yr", why: "Single ntfy VPS" },
  { item: "Maps API", legacy: "$10,000/mo", circle: "$0", why: "OSM + IPFS tiles" },
  { item: "Email (1M users)", legacy: "$8,000/mo", circle: "$60/yr", why: "Mailcow VPS" },
  { item: "AI inference", legacy: "$30,000/mo", circle: "$0", why: "On-device ONNX + free HF API" },
  { item: "Translation", legacy: "$15,000/mo", circle: "$0", why: "NLLB on-device" },
  { item: "TOTAL (1M users)", legacy: "$138,000/mo", circle: "≈ $120/yr", why: "VPS for ntfy + mail" },
];

export function ArchitectureScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={Layers}
      title={names.module_architecture}
      arabicTitle="البنية"
      section=""
      tagline="The full open-source stack that powers a $0/year super-app"
      intro="Circle's architecture eliminates all recurring cloud costs through federation, P2P, self-hosting, and free tiers. Every layer is open-source, swappable, and self-hostable. Below is every component, its cost, and the exact data flow."
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Stack layers" value="11" hint="all open" />
        <StatTile label="Cost / 1M users" value="$120/yr" hint="vs $138k" />
        <StatTile label="Vendor lock-in" value="Zero" hint="all forkable" />
        <StatTile label="License" value="Apache 2.0" />
      </div>

      {/* 3.1 Tech Stack */}
      <SectionHeader title="100% Free & Open-Source Stack" />
      <GlassCard className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2">Layer</th>
              <th className="text-left py-2 px-2">Technology</th>
              <th className="text-right py-2 px-2">Cost</th>
              <th className="text-left py-2 px-2">Why</th>
            </tr>
          </thead>
          <tbody>
            {TECH_LAYERS.map((r) => (
              <tr key={r.layer} className="border-t border-border/30">
                <td className="py-2 px-2 font-medium">{r.layer}</td>
                <td className="py-2 px-2 font-mono text-xs text-secondary">{r.tech}</td>
                <td className="py-2 px-2 text-right text-secondary">{r.cost}</td>
                <td className="py-2 px-2 text-muted-foreground text-xs">{r.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* 3.2 Data flow */}
      <SectionHeader title="Personal Mode Data Flow" hint="Wasl Shakhsi message path" />
      <GlassCard className="mb-12">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
          <Workflow className="w-4 h-4" /> User A (Cairo) → A's Homeserver → B's Homeserver → User B (Alexandria)
        </div>
        <ol className="space-y-2">
          {DATA_FLOW.map((s) => (
            <li key={s.n} className="flex items-start gap-3 text-sm">
              <span className="font-mono text-[10px] text-secondary bg-secondary/15 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{s.n}</span>
              <span className="text-muted-foreground">{s.t}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/30">
          <strong>Offline queue</strong>: messages with no internet are saved as <code className="font-mono text-[10px] bg-muted px-1 rounded">pending</code>, retried every 5min with exponential backoff.
        </p>
      </GlassCard>

      {/* 3.3 DB schema */}
      <SectionHeader title="Local Database Schema" hint="Drift / SQLite" />
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {DB_TABLES.map((t) => (
          <GlassCard key={t.name}>
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-secondary" /> {t.name}
            </h3>
            <div className="flex flex-wrap gap-1">
              {t.cols.map((c) => (
                <span key={c} className="px-2 py-0.5 text-[10px] rounded-full glass border border-border/40 font-mono">{c}</span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 3.4 Maktab */}
      <SectionHeader title="Wasl Maktab — Self-Hosted Workspaces" />
      <GlassCard className="mb-12">
        <p className="text-sm text-muted-foreground mb-3">
          Companies, schools, and governments deploy a sovereign workspace on a $5/mo VPS via one command:
        </p>
        <pre className="bg-muted/40 rounded-lg p-3 text-xs overflow-x-auto mb-4"><code>$ curl -sSL https://circle.app/install-maktab.sh | bash</code></pre>
        <p className="text-xs text-muted-foreground mb-2">The installer:</p>
        <ol className="space-y-1.5">
          {INSTALLER_STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-[10px] text-secondary mt-1 shrink-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </GlassCard>

      {/* 3.5 Public content flow */}
      <SectionHeader title="Public Content — Federated & P2P" hint="Mashahd upload flow" />
      <GlassCard className="mb-12">
        <ol className="space-y-2">
          {MASHAHD_FLOW.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="font-mono text-[10px] text-secondary bg-secondary/15 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-muted-foreground">{s}</span>
            </li>
          ))}
        </ol>
      </GlassCard>

      {/* 3.6-3.9 Supporting stacks */}
      <SectionHeader title="→ Supporting infrastructure" />
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        <GlassCard>
          <h3 className="font-medium flex items-center gap-2"><Cpu className="w-4 h-4 text-secondary" /> AI integration</h3>
          <p className="text-sm text-muted-foreground mt-2">Hugging Face free tier for hosting ONNX models, GROQ for optional cloud LLM calls (community-hosted secrets), HF Spaces for fine-tuning research.</p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-medium flex items-center gap-2"><Bell className="w-4 h-4 text-secondary" /> Push without Firebase</h3>
          <p className="text-sm text-muted-foreground mt-2">ntfy self-hosted on $5 VPS replaces FCM/APNs. Topic-based subscriptions, end-to-end encrypted payloads.</p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-medium flex items-center gap-2"><MapIcon className="w-4 h-4 text-secondary" /> Mapping stack</h3>
          <p className="text-sm text-muted-foreground mt-2">MapLibre GL + OpenStreetMap tiles + IPFS-pinned regional mbtiles. Vector style customization, on-device routing via Valhalla.</p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-secondary" /> Email stack</h3>
          <p className="text-sm text-muted-foreground mt-2">Mailcow (Docker) on volunteer VPS hosts @circle.app addresses. SPF, DKIM, DMARC, PGP-by-default.</p>
        </GlassCard>
      </div>

      {/* 3.10 Cost analysis */}
      <SectionHeader title="Cost Analysis — Real Numbers" hint="vs incumbent platforms" />
      <GlassCard className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2">Item</th>
              <th className="text-right py-2 px-2">Big Tech</th>
              <th className="text-right py-2 px-2">Circle</th>
              <th className="text-left py-2 px-2">Why</th>
            </tr>
          </thead>
          <tbody>
            {COSTS.map((r) => (
              <tr key={r.item} className={`border-t border-border/30 ${r.item.startsWith("TOTAL") ? "font-bold bg-secondary/10" : ""}`}>
                <td className="py-2 px-2">{r.item}</td>
                <td className="py-2 px-2 text-right text-accent">{r.legacy}</td>
                <td className="py-2 px-2 text-right text-secondary">{r.circle}</td>
                <td className="py-2 px-2 text-muted-foreground text-xs">{r.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* 3.11 Self-host single script */}
      <SectionHeader title="Self-Host Everything — Single Script" />
      <GlassCard className="mb-12">
        <p className="text-sm text-muted-foreground mb-3">
          Advanced users can deploy the full Circle stack (Synapse + IPFS + PeerTube + ntfy + Mailcow + Pleroma + MapLibre tile server) on a single beefy VPS with:
        </p>
        <pre className="bg-muted/40 rounded-lg p-3 text-xs overflow-x-auto"><code>$ curl -sSL https://circle.app/install-everything.sh | bash --domain mycircle.org</code></pre>
        <p className="text-xs text-muted-foreground mt-3">Recommended specs: 8 vCPU, 16 GB RAM, 200 GB SSD — ~$40/month on Hetzner Cloud.</p>
      </GlassCard>

      {/* 3.12 Summary */}
      <SectionHeader title="Summary of Part 3" />
      <GlassCard>
        <ul className="space-y-2">
          {[
            "Every layer is 100% open-source and self-hostable",
            "Total operational cost for 1M users: ≈ $120/year (vs ~$138,000/month for Big Tech)",
            "Personal mode data flow: end-to-end encrypted, offline-queueable, federated",
            "Work mode (Maktab): one-click Docker installer on $5 VPS",
            "Public content: IPFS + ActivityPub + PeerTube + WebTorrent (zero CDN cost)",
            "Push (), Maps (), Mail (): all self-hosted with single small VPS",
          ].map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {s}
            </li>
          ))}
        </ul>
      </GlassCard>
    </PageShell>
  );
}

export default ArchitectureScreen;
