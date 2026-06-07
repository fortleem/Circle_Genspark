// — Maps (Google Maps replacement)
import { PageShell, GlassCard, EmptyState, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Map as MapIcon, Download } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { MapRegion } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";
import { RealityLens } from "@/components/futuristic/RealityLens";

export function MapsScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ regions: MapRegion[] }>("/maps/regions");
  const regions = data?.regions ?? [];
  const totalMB = regions.reduce((a, r) => a + r.tiles_size_mb, 0);
  return (
    <PageShell
      icon={MapIcon}
      title={names.module_maps}
      arabicTitle="الخرائط"
      section=""
      tagline="Offline-first maps that don't track your location"
      intro="Circle Maps uses OpenStreetMap tiles, pinned via IPFS for offline navigation. No telemetry, no ad-supported POIs, full vector style customization, and routing computed entirely on-device."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Regions" value={regions.length.toString()} hint="downloadable" />
        <StatTile label="Total size" value={`${totalMB.toLocaleString()} MB`} />
        <StatTile label="Source" value="OSM" hint="open data" />
        <StatTile label="Routing" value="On-device" hint="no cloud" />
      </div>

      {/* Circle-unique Reality Lens — geo-anchored AR memory layer */}
      <SectionHeader title="Reality Lens" hint="Circle-unique · geo-anchored memory" />
      <div className="mb-8">
        <RealityLens />
      </div>

      <SectionHeader title="Available regions" hint="Pinned via IPFS" />
      {loading ? <EmptyState message="Loading regions..." /> : regions.length === 0 ? <EmptyState /> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {regions.map((r) => (
            <GlassCard key={r.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base">{r.country} <span className="text-muted-foreground text-xs font-mono">({r.region_code})</span></h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.tiles_size_mb} MB · pinned by {r.pinned_by} peers</p>
                </div>
                <button className="px-2.5 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground flex items-center gap-1 shrink-0">
                  <Download className="w-3 h-3" /> Get
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default MapsScreen;
