// — Self-Host Nodes
import { PageShell, GlassCard, EmptyState, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Server, ExternalLink } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { SelfHostNode } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function SelfhostScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ nodes: SelfHostNode[] }>("/selfhost/nodes");
  const nodes = data?.nodes ?? [];
  const users = nodes.reduce((a, n) => a + n.users_served, 0);
  return (
    <PageShell
      icon={Server}
      title={names.module_selfhost}
      arabicTitle="الاستضافة الذاتية"
      section=""
      tagline="Run your own Cirkle node — for one user, your family, or a million"
      intro="Every Cirkle module is fully self-hostable. Download the docker compose, point your domain, and you have a sovereign social platform running on hardware you own. Browse public community-run nodes below."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Public nodes" value={nodes.length.toString()} />
        <StatTile label="Users served" value={users.toLocaleString()} />
        <StatTile label="Avg uptime" value={`${(nodes.reduce((a, n) => a + (n.uptime_pct ?? 0), 0) / Math.max(nodes.length,1)).toFixed(1)}%`} />
        <StatTile label="Countries" value={new Set(nodes.map(n => n.country)).size.toString()} />
      </div>

      <SectionHeader title="Community nodes" />
      {loading ? <EmptyState message="Loading nodes..." /> : nodes.length === 0 ? <EmptyState /> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {nodes.map((n) => (
            <GlassCard key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-base truncate">{n.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.kind} · {n.country ?? "—"}{n.operator ? ` · by ${n.operator}` : ""}</p>
                  <p className="text-xs mt-2">{n.users_served.toLocaleString()} users · {n.uptime_pct ?? "—"}% uptime</p>
                </div>
                {n.url && (
                  <a href={n.url} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1 rounded-full glass border border-border/40 flex items-center gap-1 shrink-0">
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default SelfhostScreen;
