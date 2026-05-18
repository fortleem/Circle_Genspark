// §34 — Roadmap
import { PageShell, GlassCard, EmptyState, SectionHeader } from "@/components/shell/PageShell";
import { ListChecks, Check, Clock, Circle as CircleIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { RoadmapPhase } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

const STATUS_MAP: Record<string, { icon: any; color: string }> = {
  done:        { icon: Check,      color: "text-secondary" },
  "in-progress": { icon: Clock,    color: "text-primary" },
  planned:     { icon: CircleIcon, color: "text-muted-foreground" },
};

export function RoadmapScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ phases: RoadmapPhase[] }>("/roadmap");
  const phases = data?.phases ?? [];
  return (
    <PageShell
      icon={ListChecks}
      title={names.module_roadmap}
      arabicTitle="خارطة الطريق"
      section="§34"
      tagline="Public, dated, voted-on roadmap — no secret backroom planning"
      intro="Every phase is community-reviewed and time-boxed. Deliverables ship to a public branch first; users vote on prioritization at quarterly town halls."
    >
      <SectionHeader title="Phases" />
      {loading ? <EmptyState message="Loading roadmap..." /> : phases.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">
          {phases.map((p) => {
            const meta = STATUS_MAP[p.status] ?? STATUS_MAP.planned;
            const Icon = meta.icon;
            return (
              <GlassCard key={p.id}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${meta.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg">Phase {p.phase_no} · {p.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full bg-muted ${meta.color}`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.months} months</p>
                    {Array.isArray(p.deliverables) && p.deliverables.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {p.deliverables.map((d, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-secondary mt-1">•</span> {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
export default RoadmapScreen;
