// §1 — Vision dashboard (mission, goals, why-now)
import { PageShell, GlassCard, StatTile } from "@/components/shell/PageShell";
import { Eye } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const GOALS = [
  { y: "2025 Q3", t: "Public beta", n: "Core 4 pillars (Wasl, Mashahd, Lamahat, Midan) + Circle ID" },
  { y: "2025 Q4", t: "Federation v1", n: "Self-host node toolkit, IPFS-pinned content, Matrix bridges" },
  { y: "2026 Q2", t: "AI core ships", n: "On-device translation, mod, recommendations — zero cloud telemetry" },
  { y: "2026 Q4", t: "Sovereign mode", n: "Mesh-only operation, NFC payments, full offline functionality" },
];

export function VisionScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={Eye}
      title={names.module_vision}
      arabicTitle="الرؤية"
      section="§1"
      tagline="A unified, sovereign digital home — not a megacorp's data farm"
      intro="By 2027, one billion people will use a connected, federated platform they control. Circle is the architecture that gets us there: AI-native, privacy-first, community-owned."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Modules" value="31" hint="across 6 groups" />
        <StatTile label="Locales" value="8" hint="incl. RTL Arabic" />
        <StatTile label="Data planes" value="6" hint="DRE-routed" />
        <StatTile label="OSS license" value="AGPLv3" hint="fully open" />
      </div>

      <h2 className="font-display text-xl mb-3">Roadmap</h2>
      <div className="space-y-3">
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
    </PageShell>
  );
}

export default VisionScreen;
