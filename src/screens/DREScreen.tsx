// §4 — Dynamic Regional Engine
import { PageShell, GlassCard, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Globe2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { KNOWN_COUNTRIES, configFor, planeFor } from "@/lib/dre";

const PLANES = ["global", "china", "russia", "iran", "vietnam", "eu"];

export function DREScreen() {
  const { names, region, country, setCountry } = useApp();
  return (
    <PageShell
      icon={Globe2}
      title={names.module_dre}
      arabicTitle="محرك المناطق"
      section="§4"
      tagline="Smart traffic routing across six data planes — stay reachable everywhere"
      intro="The Dynamic Regional Engine adapts Circle's network behavior to local conditions: which protocols, which CDNs, which AI models. Six planes (global / China / Russia / Iran / Vietnam / EU) ensure compliance with local laws while preserving end-to-end privacy."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Current country" value={country} />
        <StatTile label="Active plane" value={region.plane} />
        <StatTile label="CDN" value={region.cdn ?? "—"} />
        <StatTile label="Default lang" value={region.defaultLang ?? "—"} />
      </div>

      <SectionHeader title="Switch country" />
      <GlassCard className="mb-8">
        <div className="flex flex-wrap gap-1.5">
          {KNOWN_COUNTRIES.map((c) => (
            <button key={c} onClick={() => setCountry(c)}
              className={`px-2.5 py-1 rounded-full text-xs border ${country === c ? "bg-secondary text-secondary-foreground border-secondary" : "glass border-border/40"}`}>
              {c} <span className="text-[10px] opacity-60 ml-1">{planeFor(c)}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      <SectionHeader title="Six data planes" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLANES.map((plane) => {
          const sample = KNOWN_COUNTRIES.find(c => planeFor(c) === plane) ?? "US";
          const cfg = configFor(sample);
          return (
            <GlassCard key={plane}>
              <h3 className="font-display text-lg capitalize">{plane}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">e.g. {sample}</p>
              <ul className="mt-3 text-xs text-muted-foreground space-y-1">
                <li>CDN: <span className="text-foreground">{cfg.cdn ?? "—"}</span></li>
                <li>Lang: <span className="text-foreground">{cfg.defaultLang ?? "—"}</span></li>
                <li>Matrix: <span className="text-foreground">{(cfg as any).matrixHomeserver ?? "default"}</span></li>
              </ul>
            </GlassCard>
          );
        })}
      </div>
    </PageShell>
  );
}
export default DREScreen;
