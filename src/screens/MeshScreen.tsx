// §15 — Local Mesh
import { PageShell, GlassCard, EmptyState, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Compass, Siren, Radio } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { MeshPeer, SOSAlert } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function MeshScreen() {
  const { names } = useApp();
  const { data: peers, loading: lp }  = useApi<{ peers: MeshPeer[] }>("/mesh/peers");
  const { data: sos,   loading: ls }  = useApi<{ sos: SOSAlert[] }>("/mesh/sos");
  return (
    <PageShell
      icon={Compass}
      title={names.module_mesh}
      arabicTitle="الشبكة المحلية"
      section="§15"
      tagline="Stay connected when networks fail — Bluetooth & WiFi-direct peer mesh"
      intro="Local Mesh is Circle's offline backbone. Phones automatically discover each other over Bluetooth Low Energy or WiFi Direct, relay messages 4–6 hops, broadcast SOS alerts, and synchronize when one peer regains internet."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Peers nearby" value={(peers?.peers ?? []).length.toString()} />
        <StatTile label="Relaying"     value={(peers?.peers ?? []).filter(p=>p.is_relaying).length.toString()} />
        <StatTile label="Active SOS"   value={(sos?.sos ?? []).length.toString()} />
        <StatTile label="Avg hops"     value="4.2" hint="reach radius" />
      </div>

      <SectionHeader title="Peers nearby" hint="Bluetooth + WiFi Direct" />
      {lp ? <EmptyState message="Scanning..." /> : (peers?.peers ?? []).length === 0 ? <EmptyState /> : (
        <div className="space-y-2 mb-8">
          {peers!.peers.map((p) => (
            <GlassCard key={p.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.display_name}</p>
                    <p className="text-xs text-muted-foreground">{p.transport} · {p.distance_m}m · RSSI {p.rssi_dbm} dBm</p>
                  </div>
                </div>
                {p.is_relaying ? <span className="px-2 py-0.5 text-[10px] rounded-full bg-secondary/15 text-secondary shrink-0">Relaying</span> : null}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <SectionHeader title="SOS broadcasts" hint="Last 24h" />
      {ls ? <EmptyState message="Loading..." /> : (sos?.sos ?? []).length === 0 ? <EmptyState message="No active alerts." /> : (
        <div className="space-y-2">
          {sos!.sos.map((s) => (
            <GlassCard key={s.id} className="border-accent/30">
              <div className="flex items-start gap-3">
                <Siren className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{s.display_name} · {s.severity}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.message ?? "Emergency broadcast"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.city} · {s.peers_reached} peers reached · {new Date(s.created_at).toLocaleString()}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default MeshScreen;
