// — Executive Vision & Core Commitments (full sub-section coverage 1.1 → 1.9)
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { BadgeCheck, ShieldCheck, Globe2, Users, Sparkles, Lock, Wifi, Server, Cpu, Network, GitBranch } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { Link } from "react-router-dom";

// 1.2 Core Promises (The Circle Covenant)
const COVENANTS = [
  { icon: ShieldCheck, title: "Privacy First", desc: "End-to-end encrypted by default. No data sold, no surveillance economy. Personal data lives on-device only." },
  { icon: Globe2, title: "Federated & Open", desc: "Matrix + ActivityPub + IPFS + PeerTube. Self-host, migrate, fork — Apache 2.0 license." },
  { icon: Users, title: "Community Governed", desc: "Bylaws, town halls, DAO proposals. Future changes require community vote." },
  { icon: Sparkles, title: "AI-Native", desc: "On-device ONNX models, no cloud telemetry. Federated learning is opt-in only." },
  { icon: Lock, title: "Sovereign Identity", desc: "Circle ID is self-custodial. One identity across all 31 modules, valid even if Circle disappears." },
  { icon: BadgeCheck, title: "Transparent Economics", desc: "Public ad ledger, monthly revenue reports, non-targeted local ads only — paid by invoice." },
];

// 1.3 Problem → Solution Matrix
const PROBLEM_SOLUTIONS = [
  { p: "Juggling 10+ apps", s: "One sovereign super-app replacing WhatsApp, YouTube, IG, X, LinkedIn, Trip.com, Gmail, Maps, Zoom..." },
  { p: "Surveillance ads", s: "Non-targeted local ads, paid by corporate invoice. Public ledger every month." },
  { p: "Escalating subscriptions", s: "$0 forever — no tiers, no premium, no paywalls. Funded by P2P efficiency + non-targeted ads." },
  { p: "Vendor lock-in", s: "Export everything, migrate to any other Circle node, or self-host on your own VPS." },
  { p: "Algorithmic dark patterns", s: "Transparent feeds: chronological + opt-in algo, recommender source code open." },
  { p: "Government / cloud outages", s: "Offline-first design + Bluetooth mesh. Works without internet, syncs when back online." },
];

// 1.4 Zero-Cost Architecture (7 principles)
const ZERO_COST = [
  { id: "1.4.1", icon: Network, t: "Federation Instead of Central Cloud", d: "Matrix for messaging, ActivityPub for feeds. Anyone runs a homeserver — no single company pays for all storage." },
  { id: "1.4.2", icon: Wifi, t: "Peer-to-Peer for Bandwidth-Intensive Content", d: "Mashahd uses WebTorrent + HLS fallback. Photos & video go on IPFS — every viewer becomes a seeder." },
  { id: "1.4.3", icon: Cpu, t: "On-Device AI Inference", d: "NSFW blur, smart replies, translation, face matching run locally via ONNX. Heavy server models live on volunteer VPS." },
  { id: "1.4.4", icon: Server, t: "Community-Hosted Public Nodes", d: "Default Matrix homeserver, PeerTube, ntfy push run by volunteers on $5–10/month VPS, reimbursed from ad revenue." },
  { id: "1.4.5", icon: GitBranch, t: "Self-Hosting for Organisations", d: "Companies, schools, governments run Wasl Maktab on their own hardware. One-click installer included." },
  { id: "1.4.6", icon: Wifi, t: "Offline & Mesh Reduce Server Load", d: "App works offline, syncs later. Bluetooth/WiFi-direct mesh allows device-to-device, bypassing servers entirely." },
  { id: "1.4.7", icon: Server, t: "Free Tiers of Open-Source Services", d: "GitHub Actions CI/CD, Cloudflare DNS, Hugging Face model hosting, ModelScope for China — all free tiers." },
];

// 1.5 Target Audiences
const AUDIENCES = [
  { who: "Privacy-conscious individuals", why: "Zero data harvesting, full federation, optional anonymity in Midan." },
  { who: "MENA & emerging markets", why: "Bluetooth mesh works without strong internet. Arabic-first design, DRE-compliant in Egypt, SA, UAE, etc." },
  { who: "Self-host enthusiasts", why: "Apache 2.0, one-click Docker deployment, federated by design." },
  { who: "Schools & businesses", why: "Wasl Maktab gives sovereign Slack/Zoom/Drive on their own infra." },
  { who: "Creators & journalists", why: "Mashahd PeerTube + IPFS = no deplatforming, viewer-pays tipping." },
  { who: "Activists & vulnerable groups", why: "On-device E2EE, anonymous Midan posts, mesh-network SOS, no IP logging." },
];

// 1.6 Year-1 Goals (Egypt launch)
const YEAR_ONE_GOALS = [
  { metric: "Monthly active users (Egypt)", target: "1,000,000", note: "Beta + GA launch" },
  { metric: "Self-hosted nodes", target: "500+", note: "Schools, businesses, families" },
  { metric: "Federated content peers", target: "50,000", note: "IPFS pinners" },
  { metric: "Server cost per MAU", target: "< $0.001", note: "P2P offloading + community nodes" },
  { metric: "Ad revenue allocation", target: "70% → operators", note: "30% → R&D and translation" },
  { metric: "On-device AI inference", target: "100%", note: "Translation, mod, ranking" },
];

// 1.8 Long-Term Vision (10 Years)
const LONG_TERM = [
  { t: "Perpetual open source", d: "Apache 2.0. Anyone can fork, audit, self-host." },
  { t: "No enshittification", d: "Future changes require community DAO vote. Ads never target individuals." },
  { t: "Global mesh internet", d: "LoRa, Wi-Fi Direct, BLE — eventually independent of traditional ISPs." },
  { t: "Decentralised identity", d: "Circle ID becomes a self-sovereign identity standard, gov-compatible but user-controlled." },
  { t: "Zero marginal cost", d: "As P2P/federation improves, cost per new user → absolute zero." },
];

// 1.9 Summary radicals
const RADICALS = [
  { emoji: "💸", t: "Radical affordability", d: "$0 for users, near-zero for operators." },
  { emoji: "🔒", t: "Radical privacy", d: "Data stays on device, no surveillance ads." },
  { emoji: "🌐", t: "Radical functionality", d: "Replaces 10+ apps in one." },
  { emoji: "🗺️", t: "Radical compliance", d: "Dynamic Regional Engine adapts to any country." },
  { emoji: "🌱", t: "Radical sustainability", d: "Funded by non-targeted local ads, P2P, community hosting." },
];

export function CovenantScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={BadgeCheck}
      title={names.covenant}
      arabicTitle="العهد"
      section=""
      tagline="The non-negotiable promises Circle makes to every user"
      intro="Circle (دواير) is a privacy-first social operating system that replaces a dozen standalone apps with one open-source, offline-first super-app. Every feature is totally free for every user, forever — funded by non-targeted local ads paid via corporate invoice, never by selling user data."
    >
      {/* 1.2 Core Promises */}
      <SectionHeader title="The Circle Covenant" hint="Non-negotiable commitments" />
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {COVENANTS.map((p) => (
          <GlassCard key={p.title}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 1.3 Problem → Solution Matrix */}
      <SectionHeader title="Problem → Solution Matrix" hint="Why Circle exists" />
      <GlassCard className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2 w-1/3">Problem</th>
              <th className="text-left py-2 px-2">Circle's Solution</th>
            </tr>
          </thead>
          <tbody>
            {PROBLEM_SOLUTIONS.map((r) => (
              <tr key={r.p} className="border-t border-border/30">
                <td className="py-3 px-2 font-medium align-top">{r.p}</td>
                <td className="py-3 px-2 text-muted-foreground">{r.s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* 1.4 Zero-Cost Architecture — 7 sub-principles */}
      <SectionHeader title="Zero-Cost Architecture" hint="Seven principles" />
      <p className="text-sm text-muted-foreground mb-4">Circle does not rely on venture capital. Its design eliminates recurring bills through seven principles.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {ZERO_COST.map((z) => (
          <GlassCard key={z.id}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <z.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-primary">§{z.id}</span>
                  <h3 className="font-display text-base">{z.t}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{z.d}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 1.5 Target Audience */}
      <SectionHeader title="Who is Circle for?" hint="Six core audiences" />
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {AUDIENCES.map((a) => (
          <GlassCard key={a.who}>
            <h3 className="font-medium text-sm">{a.who}</h3>
            <p className="text-xs text-muted-foreground mt-1">{a.why}</p>
          </GlassCard>
        ))}
      </div>

      {/* 1.6 Quantitative Year-1 Goals */}
      <SectionHeader title="Year-1 Goals (Egypt launch)" hint="Quantitative targets" />
      <GlassCard className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2">Metric</th>
              <th className="text-right py-2 px-2">Target</th>
              <th className="text-left py-2 px-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {YEAR_ONE_GOALS.map((g) => (
              <tr key={g.metric} className="border-t border-border/30">
                <td className="py-2 px-2">{g.metric}</td>
                <td className="py-2 px-2 text-right font-mono text-secondary">{g.target}</td>
                <td className="py-2 px-2 text-muted-foreground text-xs">{g.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* 1.7 What Circle replaces */}
      <SectionHeader title="What Circle replaces" hint="One app, eleven dethroned" />
      <div className="flex flex-wrap gap-2 mb-12">
        {["WhatsApp → Wasl", "YouTube → Mashahd", "Instagram → Lamahat", "X / Twitter → Midan", "LinkedIn → Pro Network", "Trip.com → Rihla", "Gmail → Circle Mail", "Google Maps → Circle Maps", "Zoom → Wasl Maktab", "Google Translate → Translate", "Facebook Groups → The Circle"].map((x) => (
          <span key={x} className="px-3 py-1.5 text-xs rounded-full glass border border-border/40">{x}</span>
        ))}
      </div>

      {/* 1.8 Long-Term Vision */}
      <SectionHeader title="Long-Term Vision (10 Years)" />
      <div className="space-y-2 mb-12">
        {LONG_TERM.map((l) => (
          <GlassCard key={l.t}>
            <h3 className="font-medium text-sm">{l.t}</h3>
            <p className="text-xs text-muted-foreground mt-1">{l.d}</p>
          </GlassCard>
        ))}
      </div>

      {/* 1.9 Summary */}
      <SectionHeader title="Five Radicals" hint="The summary of Part 1" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {RADICALS.map((r) => (
          <GlassCard key={r.t} className="text-center">
            <div className="text-3xl mb-2">{r.emoji}</div>
            <h3 className="font-display text-sm">{r.t}</h3>
            <p className="text-xs text-muted-foreground mt-1">{r.d}</p>
          </GlassCard>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground mb-3">Continue exploring the blueprint:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/identity" className="px-4 py-2 rounded-full glass border border-border/40 text-xs">Brand</Link>
          <Link to="/architecture" className="px-4 py-2 rounded-full glass border border-border/40 text-xs">Architecture</Link>
          <Link to="/dre" className="px-4 py-2 rounded-full glass border border-border/40 text-xs">DRE</Link>
          <Link to="/vision" className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs">Long-term Vision →</Link>
        </div>
      </div>
    </PageShell>
  );
}

export default CovenantScreen;
