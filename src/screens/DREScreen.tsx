// — Dynamic Regional Engine & Multi-Data-Plane Compliance (full 4.1 → 4.12)
import { PageShell, GlassCard, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Globe2, ShieldAlert, Plane, RefreshCw, Lock, Megaphone, Check } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { KNOWN_COUNTRIES, configFor, planeFor } from "@/lib/dre";
import { useState } from "react";

const PLANES = [
  { id: "global", flag: "🌍", name: "Global", desc: "Default plane. EG, SA, US, EU, MENA, Africa, Latam, SE Asia.", count: "150+ countries" },
  { id: "china", flag: "🇨🇳", name: "China", desc: "Real-name verification, no anonymous posting, ICP licensing.", count: "1 country" },
  { id: "russia", flag: "🇷🇺", name: "Russia", desc: "Roskomnadzor data localization. Russian-language defaults.", count: "1 country" },
  { id: "iran", flag: "🇮🇷", name: "Iran", desc: "Sanctions compliance, no US-brand imagery in ads.", count: "1 country" },
  { id: "vietnam", flag: "🇻🇳", name: "Vietnam", desc: "Cyber-security law compliance, gov registration required.", count: "1 country" },
  { id: "eu", flag: "🇪🇺", name: "EU", desc: "Full GDPR, cookie disclaimers, right-to-be-forgotten, DSA.", count: "27 countries" },
];

// 4.5 compliance per plane
const COMPLIANCE = [
  { plane: "China (CN)", items: ["Real-name verification (gov ID)", "No anonymous posting", "ICP license required", "Content filtered per CAC", "Payment via Alipay/WeChat Pay"] },
  { plane: "Russia (RU)", items: ["Roskomnadzor data localization", "Russian privacy law", "MIR payment integration", "No specific EN-only content"] },
  { plane: "EU (GDPR)", items: ["Cookie banner", "Data export within 30 days", "Right-to-be-forgotten", "DPA contact in app", "Targeted ads = opt-in only"] },
  { plane: "Iran (IR)", items: ["Sanctions compliance", "No US-brand ads", "Local mirror for content", "Mesh networking encouraged"] },
  { plane: "Vietnam (VN)", items: ["Gov registration of operators", "Cyber-security law", "Local content review board", "VND payment integration"] },
];

// 4.6 Feature toggles by plane
const FEATURE_TOGGLES = [
  { feature: "Anonymous posting", global: "✅", china: "❌", russia: "✅", iran: "✅", eu: "✅", vietnam: "⚠️" },
  { feature: "Federated Matrix", global: "✅", china: "❌", russia: "⚠️", iran: "⚠️", eu: "✅", vietnam: "✅" },
  { feature: "IPFS public content", global: "✅", china: "❌", russia: "✅", iran: "✅", eu: "✅", vietnam: "✅" },
  { feature: "NFC payments", global: "✅", china: "✅", russia: "✅", iran: "❌", eu: "✅", vietnam: "✅" },
  { feature: "Mashahd PeerTube", global: "✅", china: "❌", russia: "✅", iran: "✅", eu: "✅", vietnam: "✅" },
  { feature: "Local mesh (BLE)", global: "✅", china: "✅", russia: "✅", iran: "✅", eu: "✅", vietnam: "✅" },
  { feature: "Voice/Video calls", global: "✅", china: "✅", russia: "✅", iran: "✅", eu: "✅", vietnam: "✅" },
];

export function DREScreen() {
  const { names, region, country, setCountry } = useApp();
  const [showAll, setShowAll] = useState(false);

  return (
    <PageShell
      icon={Globe2}
      title={names.module_dre}
      arabicTitle="محرك المناطق"
      section=""
      tagline="Smart traffic routing across six data planes — stay reachable everywhere"
      intro="Circle operates in a world of conflicting national laws and censorship regimes. Instead of building separate apps or asking users to 'choose a region', the DRE fetches a signed JSON configuration based on IP-derived country and instantly adapts every module — without an app update."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatTile label="Current country" value={country} />
        <StatTile label="Active plane" value={region.plane} />
        <StatTile label="CDN" value={region.cdn ?? "—"} />
        <StatTile label="Default lang" value={region.defaultLang ?? "—"} />
      </div>

      {/* Overview - already in intro */}

      {/* Global data planes */}
      <SectionHeader title="Six Global Data Planes" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
        {PLANES.map((p) => (
          <GlassCard key={p.id}>
            <div className="text-3xl mb-2">{p.flag}</div>
            <h3 className="font-display text-lg">{p.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            <p className="text-[10px] text-secondary mt-2 font-mono">{p.count}</p>
          </GlassCard>
        ))}
      </div>

      {/* Country switcher (DRE in action) */}
      <SectionHeader title="Try the DRE" hint="Pick a country to re-evaluate config" />
      <GlassCard className="mb-12">
        <p className="text-sm text-muted-foreground mb-3">
          Below is the live DRE in action. Click any country — Circle re-routes infrastructure, adjusts feature flags, and reloads UI strings without a single app update.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {KNOWN_COUNTRIES.map((c) => (
            <button key={c} onClick={() => setCountry(c)}
              className={`px-2.5 py-1 rounded-full text-xs border ${country === c ? "bg-secondary text-secondary-foreground border-secondary" : "glass border-border/40"}`}>
              {c} <span className="text-[10px] opacity-60 ml-1">{planeFor(c)}</span>
            </button>
          ))}
        </div>
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-2">Active configuration for <strong>{country}</strong>:</p>
          <pre className="bg-muted/40 rounded-lg p-3 text-[11px] overflow-x-auto"><code>{JSON.stringify(region, null, 2)}</code></pre>
        </div>
      </GlassCard>

      {/* Compliance */}
      <SectionHeader title="Compliance per Plane" hint="What changes where" />
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {COMPLIANCE.map((c) => (
          <GlassCard key={c.plane}>
            <h3 className="font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-secondary" /> {c.plane}</h3>
            <ul className="mt-3 space-y-1.5">
              {c.items.map((i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-secondary mt-0.5">•</span> {i}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>

      {/* Feature toggles */}
      <SectionHeader title="Dynamic Feature Toggling" hint="Which features ship where" />
      <GlassCard className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2">Feature</th>
              <th className="text-center py-2 px-2">🌍</th>
              <th className="text-center py-2 px-2">🇨🇳</th>
              <th className="text-center py-2 px-2">🇷🇺</th>
              <th className="text-center py-2 px-2">🇮🇷</th>
              <th className="text-center py-2 px-2">🇪🇺</th>
              <th className="text-center py-2 px-2">🇻🇳</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_TOGGLES.map((f) => (
              <tr key={f.feature} className="border-t border-border/30">
                <td className="py-2 px-2">{f.feature}</td>
                <td className="text-center py-2 px-2">{f.global}</td>
                <td className="text-center py-2 px-2">{f.china}</td>
                <td className="text-center py-2 px-2">{f.russia}</td>
                <td className="text-center py-2 px-2">{f.iran}</td>
                <td className="text-center py-2 px-2">{f.eu}</td>
                <td className="text-center py-2 px-2">{f.vietnam}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Travelers */}
      <SectionHeader title="Travelers (Roaming)" />
      <GlassCard className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Plane className="inline w-4 h-4 mr-1 text-secondary" />
          When a user travels (e.g., Egypt → Shanghai), the DRE re-evaluates the configuration every 24h or on network change. The user's <strong>home plane stays their primary identity</strong>; they don't get pushed into the local plane.
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <li>• Egyptian user in Shanghai keeps <code className="font-mono bg-muted px-1 rounded">@ahmed:matrix.circle.app</code> (may be slower due to Great Firewall)</li>
          <li>• App offers "temporary local relay" via community node in Hong Kong</li>
          <li>• Payment methods: still Vodafone Cash (if roaming OK) or Alipay for local</li>
          <li>• Chinese citizen abroad: stays on matrix.circle.cn, obeys Chinese law even in EU</li>
        </ul>
      </GlassCard>

      {/* Caching & fallback */}
      <SectionHeader title="Caching & Fallback" />
      <GlassCard className="mb-8">
        <p className="text-sm text-muted-foreground">
          <RefreshCw className="inline w-4 h-4 mr-1 text-secondary" />
          The DRE config is cached locally for offline use. If the config server is unreachable, the app falls back to the last cached version, then to a conservative "Global plane" default.
        </p>
      </GlassCard>

      {/* + 4.10 + 4.11 */}
      <SectionHeader title="→ Operational details" />
      <div className="grid sm:grid-cols-3 gap-3 mb-12">
        <GlassCard>
          <h3 className="font-medium text-sm">Adding a new region</h3>
          <p className="text-xs text-muted-foreground mt-1">A new data plane (e.g., India) needs only: Matrix homeserver + PeerTube + ntfy on local cloud, a new config JSON, and listing the country code. <strong>Zero code changes</strong> in mobile/web apps.</p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-medium text-sm flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-secondary" /> Config integrity</h3>
          <p className="text-xs text-muted-foreground mt-1">Configuration JSON is Ed25519-signed by Circle. The client verifies the signature before applying — prevents MITM attacks that could force a user into a rogue data plane.</p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-medium text-sm flex items-center gap-2"><Megaphone className="w-3.5 h-3.5 text-secondary" /> Advertiser compliance</h3>
          <p className="text-xs text-muted-foreground mt-1">Same campaign worldwide. DRE adds GDPR disclaimer in EU, blocks alcohol in CN if prohibited, swaps US-brand imagery in IR. No region-specific ad creative needed.</p>
        </GlassCard>
      </div>

      {/* Summary */}
      <SectionHeader title="Summary of Part 4" />
      <GlassCard>
        <ul className="space-y-2">
          {[
            "Dynamic configuration enables instant compliance without app updates",
            "Six data planes cover major regulatory regimes (CN, RU, IR, VN, EU, Global)",
            "User's home plane is sticky across travel — no forced re-region",
            "Ed25519-signed configs prevent malicious overrides",
            "New regions can be added in hours (no code change required)",
            "Advertiser campaigns auto-adapt to local laws",
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

export default DREScreen;
