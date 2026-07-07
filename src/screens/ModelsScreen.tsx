// — AI Model Catalogue
import { PageShell, GlassCard, EmptyState, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Bot, Download } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { AIModel } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function ModelsScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ models: AIModel[] }>("/models");
  const models = data?.models ?? [];
  const totalMB = models.reduce((a, m) => a + m.size_mb, 0);
  return (
    <PageShell
      icon={Bot}
      title={names.module_models}
      arabicTitle="كتالوج النماذج"
      section=""
      tagline="On-device AI models — open-source, auditable, downloadable separately"
      intro="Cirkle ships a curated catalogue of small, efficient ONNX models. Required models are bundled; optional ones (specialized translation pairs, niche detectors) can be downloaded on demand to keep the base app small."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Total models" value={models.length.toString()} />
        <StatTile label="Total size" value={`${totalMB.toLocaleString()} MB`} />
        <StatTile label="Required" value={models.filter(m => m.required).length.toString()} />
        <StatTile label="Categories" value={new Set(models.map(m => m.category)).size.toString()} />
      </div>

      <SectionHeader title="Catalogue" hint="All ONNX, run on-device" />
      {loading ? <EmptyState message="Loading models..." /> : models.length === 0 ? <EmptyState /> : (
        <div className="space-y-2">
          {models.map((m) => (
            <GlassCard key={m.id}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base">{m.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-secondary/15 text-secondary">{m.category}</span>
                    {m.required ? <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">required</span> : <span className="px-2 py-0.5 text-[10px] rounded-full glass border border-border/40">optional</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.size_mb} MB · {m.precision} · {m.source}</p>
                  {m.description && <p className="text-sm mt-1.5">{m.description}</p>}
                </div>
                {!m.required && (
                  <button className="text-xs px-3 py-1.5 rounded-full glass border border-border/40 flex items-center gap-1 shrink-0">
                    <Download className="w-3 h-3" /> Get
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default ModelsScreen;
