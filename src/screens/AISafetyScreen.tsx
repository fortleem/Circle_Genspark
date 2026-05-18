// §17 — AI Safety & Moderation
import { PageShell, GlassCard, EmptyState, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { ShieldCheck } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { ModAction } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function AISafetyScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ actions: ModAction[] }>("/moderation/actions");
  const actions = data?.actions ?? [];
  return (
    <PageShell
      icon={ShieldCheck}
      title={names.module_aisafety}
      arabicTitle="الأمان والإشراف"
      section="§17"
      tagline="Transparent, auditable moderation — every action explained"
      intro="AI Safety runs on-device when possible. Every moderation action is logged with the model used, confidence score, and full reasoning. Users can appeal, and community review committees can override."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Actions (24h)" value={actions.length.toString()} />
        <StatTile label="On-device"     value="68%" hint="run locally" />
        <StatTile label="False-positive" value="2.1%" hint="overridden" />
        <StatTile label="Appeals"       value="< 24h" hint="median" />
      </div>

      <SectionHeader title="Recent moderation actions" />
      {loading ? <EmptyState message="Loading..." /> : actions.length === 0 ? <EmptyState /> : (
        <div className="space-y-2">
          {actions.map((a) => (
            <GlassCard key={a.id}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium">{a.action} on {a.target_type} <span className="text-muted-foreground font-mono text-xs">#{a.target_id}</span></p>
                  <p className="text-sm text-muted-foreground mt-1">{a.reason}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Model: <span className="font-mono">{a.model_used ?? "—"}</span>
                    {a.confidence ? ` · Confidence ${(a.confidence * 100).toFixed(0)}%` : ""}
                    {" · "}{new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default AISafetyScreen;
