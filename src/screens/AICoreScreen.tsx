// §18 — Self-Learning AI Core
import { PageShell, GlassCard, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Bot, Cpu, Database, ShieldCheck } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiPost } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function AICoreScreen() {
  const { names } = useApp();
  const { data, loading, refetch } = useApi<{ training: any }>("/ai/training/1");
  const training = data?.training ?? null;
  const toggle = async (field: string, value: number) => {
    try { await apiPost("/ai/training/1/opt", { [field]: value }); refetch(); }
    catch (e) { console.error(e); }
  };
  return (
    <PageShell
      icon={Bot}
      title={names.module_aicore}
      arabicTitle="الذكاء الذاتي"
      section="§18"
      tagline="On-device learning that adapts to you — without ever sharing your data"
      intro="Circle AI Core uses ONNX models bundled with the app. With explicit opt-in, you can also contribute to federated learning rounds — gradients are anonymized and aggregated; raw data never leaves your phone."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Bundled models" value="14" hint="ONNX" />
        <StatTile label="On-device" value="100%" hint="default mode" />
        <StatTile label="Federated rounds" value="247" hint="completed" />
        <StatTile label="Privacy budget" value="ε=2.1" hint="DP guarantee" />
      </div>

      <SectionHeader title="Your training preferences" />
      <GlassCard>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-3">
            {[
              { key: "consent_telemetry",          label: "Anonymous usage telemetry",    desc: "Crash reports, feature analytics — anonymized." },
              { key: "consent_federated",          label: "Federated learning",            desc: "Contribute gradients to community-trained models." },
              { key: "consent_personalization",    label: "On-device personalization",     desc: "Local model adapts to your preferences." },
            ].map((p) => {
              const isOn = training?.[p.key] === 1;
              return (
                <div key={p.key} className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0 border-border/30">
                  <div>
                    <p className="font-medium text-sm">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <button onClick={() => toggle(p.key, isOn ? 0 : 1)}
                    className={`px-3 py-1 rounded-full text-xs ${isOn ? "bg-secondary text-secondary-foreground" : "glass border border-border/40"}`}>
                    {isOn ? "On" : "Off"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <SectionHeader title="How it works" />
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Cpu, t: "On-device first", d: "Inference & light training happens on your phone (TFLite/ONNX runtime)." },
          { icon: Database, t: "Federated optional", d: "Opt-in to share encrypted gradients — never raw data." },
          { icon: ShieldCheck, t: "Differential privacy", d: "Noise injection ensures personal patterns can't be extracted." },
        ].map((x) => (
          <GlassCard key={x.t}>
            <x.icon className="w-5 h-5 text-secondary mb-2" />
            <h3 className="font-medium">{x.t}</h3>
            <p className="text-xs text-muted-foreground mt-1">{x.d}</p>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default AICoreScreen;
