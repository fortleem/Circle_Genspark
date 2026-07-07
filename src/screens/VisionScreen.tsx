// , , deep dive — Vision dashboard
import { PageShell, GlassCard, StatTile, SectionHeader } from "@/components/shell/PageShell";
import { Eye, Target, TrendingUp, Globe2, Users as UsersIcon } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { Link } from "react-router-dom";

// 1.6 Year-1 Quantitative Goals (Egypt) and 5-year markers
const GOALS = [
  { y: "2025 Q3", t: "Public beta", n: "Core 4 pillars (Wasl, Mashahd, Lamahat, Midan) + Cirkle ID" },
  { y: "2025 Q4", t: "Federation v1", n: "Self-host toolkit, IPFS-pinned content, Matrix bridges" },
  { y: "2026 Q1", t: "Egypt GA launch", n: "1M MAU target. 500 self-hosted nodes. Arabic-first interface." },
  { y: "2026 Q2", t: "AI core ships", n: "On-device translation, mod, recommendations — zero telemetry" },
  { y: "2026 Q3", t: "MENA expansion", n: "Saudi, UAE, Morocco, Tunisia. DRE region overlays per country" },
  { y: "2026 Q4", t: "Sovereign mode", n: "Mesh-only operation, NFC payments, full offline functionality" },
  { y: "2027 Q2", t: "Global GA", n: "Web + iOS + Android. EU + Latin America + South Asia rollout" },
  { y: "2027 Q4", t: "1B users vision", n: "200M MAU realistic target. Federation count > 50k nodes." },
];

// 1.5 Target audience deep cuts
const AUDIENCES = [
  { icon: "🌍", who: "Privacy-conscious individuals", why: "Zero data harvesting, full federation, optional anonymity in Midan." },
  { icon: "🌙", who: "MENA & emerging markets", why: "Bluetooth mesh works without strong internet. Arabic-first design, DRE-compliant." },
  { icon: "🛠️", who: "Self-host enthusiasts", why: "Apache 2.0, one-click Docker deployment, federated by design." },
  { icon: "🏫", who: "Schools & businesses", why: "Wasl Maktab gives sovereign Slack/Zoom/Drive on their own infra." },
  { icon: "📹", who: "Creators & journalists", why: "Mashahd PeerTube + IPFS = no deplatforming, viewer-pays tipping." },
  { icon: "🛡️", who: "Activists & vulnerable groups", why: "On-device E2EE, anonymous Midan posts, mesh-network SOS, no IP logging." },
];

// 1.8 Long-term vision (10 years)
const LONG_TERM = [
  { t: "Perpetual open source", d: "Apache 2.0. Anyone can fork, audit, self-host. No proprietary forks ever shipped by Cirkle Foundation." },
  { t: "No enshittification", d: "Future changes require community DAO vote. Ads never target individuals." },
  { t: "Global mesh internet", d: "LoRa, Wi-Fi Direct, BLE — eventually independent of traditional ISPs." },
  { t: "Decentralised identity", d: "Cirkle ID becomes a self-sovereign identity standard, gov-compatible but user-controlled." },
  { t: "Zero marginal cost", d: "As P2P/federation improves, cost per new user → absolute zero." },
];

export function VisionScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={Eye}
      title={names.module_vision}
      arabicTitle="الرؤية"
      section="-"
      tagline="A unified, sovereign digital home — not a megacorp's data farm"
      intro="By 2027, one billion people could be using a connected, federated platform they truly control. Cirkle is the architecture that gets us there: AI-native, privacy-first, community-owned. This page details exactly who Cirkle is for, the year-1 metrics that will measure success, and the 10-year commitments that prevent enshittification."
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatTile label="Modules" value="31" hint="across 6 groups" />
        <StatTile label="Locales" value="8" hint="incl. RTL Arabic" />
        <StatTile label="Data planes" value="6" hint="DRE-routed" />
        <StatTile label="OSS license" value="Apache 2.0" hint="fully open" />
      </div>

      {/* Target audience */}
      <SectionHeader title="Who Cirkle is for" hint="Six core audiences" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
        {AUDIENCES.map((a) => (
          <GlassCard key={a.who}>
            <div className="text-3xl mb-2">{a.icon}</div>
            <h3 className="font-display text-base">{a.who}</h3>
            <p className="text-xs text-muted-foreground mt-1">{a.why}</p>
          </GlassCard>
        ))}
      </div>

      {/* + Roadmap */}
      <SectionHeader title="Quantitative Roadmap" hint="Egypt → MENA → Global" />
      <div className="space-y-3 mb-12">
        {GOALS.map((g) => (
          <GlassCard key={g.y}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-secondary shrink-0">{g.y}</span>
              <div>
                <h3 className="font-display text-base">{g.t}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{g.n}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Long-term vision */}
      <SectionHeader title="Long-Term Vision (10 Years)" hint="The non-enshittification covenant" />
      <div className="space-y-3 mb-12">
        {LONG_TERM.map((l) => (
          <GlassCard key={l.t}>
            <h3 className="font-medium text-sm">{l.t}</h3>
            <p className="text-xs text-muted-foreground mt-1">{l.d}</p>
          </GlassCard>
        ))}
      </div>

      {/* Anchor links */}
      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground mb-3">Read the full vision:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/covenant" className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs"><Target className="w-3 h-3 inline mr-1" /> The Covenant</Link>
          <Link to="/identity" className="px-4 py-2 rounded-full glass border border-border/40 text-xs"><Globe2 className="w-3 h-3 inline mr-1" /> Brand</Link>
          <Link to="/roadmap" className="px-4 py-2 rounded-full glass border border-border/40 text-xs"><TrendingUp className="w-3 h-3 inline mr-1" /> Roadmap</Link>
          <Link to="/journeys" className="px-4 py-2 rounded-full glass border border-border/40 text-xs"><UsersIcon className="w-3 h-3 inline mr-1" /> Journeys</Link>
        </div>
      </div>
    </PageShell>
  );
}

export default VisionScreen;
