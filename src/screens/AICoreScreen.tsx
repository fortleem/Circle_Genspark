// — Self-Learning AI Core. Prototype design language.
// Covers On-device, Federated learning, Differential privacy, Consent toggles.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot, Cpu, Database, ShieldCheck, Sparkles, Lock, Activity, Zap,
  Brain, Globe, BookOpen, MessageSquare, CircleDot,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";
import { AIConsents } from "@/components/futuristic/AIConsents";

type BrainHealth = {
  ok: boolean; alive_providers: number; orchestrator: string;
  providers: Record<string, { configured: boolean; alive: boolean; latency_ms: number | null; detail?: string }>;
};
type BrainStats = {
  interactions: number; knowledge_facts: number; web_grounded: number;
  avg_latency_ms: number; by_intent: Array<{ intent: string; n: number }>;
};
type BrainFact = { id: number; topic: string; fact: string; confidence: number; source: string };
type BrainInteraction = { id: number; intent: string; module: string; used_web: number; provider: string; question: string; latency_ms: number; created_at: string };

export function AICoreScreen() {
  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [brainHealth, setBrainHealth] = useState<BrainHealth | null>(null);
  const [brainStats, setBrainStats] = useState<BrainStats | null>(null);
  const [facts, setFacts] = useState<BrainFact[]>([]);
  const [interactions, setInteractions] = useState<BrainInteraction[]>([]);

  useEffect(() => {
    apiGet<BrainStats>("/brain/stats").then(setBrainStats).catch(() => {});
    apiGet<{ knowledge: BrainFact[] }>("/brain/knowledge").then((d) => setFacts(d.knowledge ?? [])).catch(() => {});
    apiGet<{ interactions: BrainInteraction[] }>("/brain/interactions").then((d) => setInteractions(d.interactions ?? [])).catch(() => {});
    apiGet<BrainHealth>("/brain/health").then(setBrainHealth).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    apiGet<{ training: any }>("/ai/training/1")
      .then((d) => setTraining(d.training ?? {}))
      .catch(() => setTraining({}))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (field: string, value: number) => {
    try {
      await apiPost("/ai/training/1/opt", { [field]: value });
      load();
    } catch {/* offline ok — keep local state */}
  };

  const prefs = [
    {
      key: "consent_telemetry",
      label: "Anonymous telemetry",
      arabic: "إحصاءات مجهولة",
      desc: "Crash reports + feature usage. Aggregated, anonymized, opt-out anytime.",
      icon: Activity,
    },
    {
      key: "consent_federated",
      label: "Federated learning",
      arabic: "تعلّم موزّع",
      desc: "Share encrypted gradients to improve community models. Your raw data never leaves the device.",
      icon: Database,
    },
    {
      key: "consent_personalization",
      label: "On-device personalization",
      arabic: "تخصيص محلي",
      desc: "Your local model adapts to your taste, language, and habits — without any cloud sync.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="AI Core"
        arabic="الذكاء الذاتي"
        section=""
        tagline="On-device first · federated optional · differential privacy"
        right={
          <div className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
        }
      />

      {/* ─── CIRCLE BRAIN — the platform's working brain ─── */}
      <section id="circle-brain" className="px-5">
        <div className="rounded-3xl border border-secondary/30 bg-gradient-to-br from-secondary/10 via-background to-primary/10 p-5">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-hero text-primary-foreground flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-lg leading-tight">Circle Brain <span className="text-muted-foreground text-sm">عقل دواير</span></h2>
                <p className="text-[11px] text-muted-foreground">Central orchestrator · intent routing · live web grounding · self-learning</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-mono ${brainHealth?.ok ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
              <CircleDot className="w-3 h-3" />
              {brainHealth ? (brainHealth.ok ? "ONLINE" : "DEGRADED") : "…"}
            </span>
          </header>

          {/* Provider mesh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {["groq", "gemini", "openai", "huggingface"].map((p) => {
              const st = brainHealth?.providers?.[p];
              return (
                <div key={p} className="rounded-2xl bg-background/60 border border-border p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{p}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${st?.alive ? "bg-emerald-500" : st?.configured ? "bg-amber-500" : "bg-muted-foreground/40"}`} />
                    <span className="text-sm font-medium">{st?.alive ? "live" : st?.configured ? "down" : "—"}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{st?.latency_ms != null ? `${st.latency_ms}ms` : "probing…"}</div>
                </div>
              );
            })}
          </div>

          {/* Learning stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { l: "Interactions", v: brainStats?.interactions ?? "…", i: MessageSquare },
              { l: "Facts learned", v: brainStats?.knowledge_facts ?? "…", i: BookOpen },
              { l: "Web-grounded", v: brainStats?.web_grounded ?? "…", i: Globe },
              { l: "Avg latency", v: brainStats ? `${(brainStats.avg_latency_ms / 1000).toFixed(1)}s` : "…", i: Zap },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-background/60 border border-border p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <s.i className="w-3 h-3 text-secondary" />{s.l}
                </div>
                <div className="font-display text-xl mt-1">{s.v}</div>
              </div>
            ))}
          </div>

          {/* Knowledge memory */}
          {facts.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">What the Brain has learned</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {facts.slice(0, 8).map((f) => (
                  <div key={f.id} className="flex items-start gap-2 text-[11px] rounded-xl bg-background/60 border border-border px-3 py-2">
                    <span className="shrink-0 mt-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono">{f.topic}</span>
                    <span className="text-muted-foreground">{f.fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orchestrations */}
          {interactions.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Recent orchestrations</div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {interactions.slice(0, 6).map((it) => (
                  <div key={it.id} className="flex items-center gap-2 text-[11px] rounded-xl bg-background/60 border border-border px-3 py-2">
                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{it.intent}</span>
                    {it.used_web === 1 && <Globe className="w-3 h-3 shrink-0 text-secondary" />}
                    <span className="truncate text-muted-foreground flex-1">{it.question}</span>
                    <span className="shrink-0 text-[9px] text-muted-foreground font-mono">{it.provider}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stat tiles */}
      <div className="px-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { l: "Bundled models", v: "14", i: Cpu, hint: "ONNX runtime" },
          { l: "On-device", v: "100%", i: Lock, hint: "default mode" },
          { l: "Federated rounds", v: "247", i: Database, hint: "completed" },
          { l: "Privacy ε", v: "2.1", i: ShieldCheck, hint: "DP guarantee" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <s.i className="w-3 h-3 text-secondary" />
              {s.l}
            </div>
            <div className="font-display text-2xl mt-1">{s.v}</div>
            <div className="text-[10px] text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* / / Pillar cards */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          — How AI Core protects you
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {[
            { i: Cpu, t: "On-device first", d: "Inference + light training runs on your phone (TFLite / ONNX). Cloud is opt-in.", g: "from-secondary/15 to-secondary/5", n: "" },
            { i: Database, t: "Federated optional", d: "Encrypted gradient aggregation. Raw data never leaves the handset.", g: "from-primary/15 to-primary/5", n: "" },
            { i: ShieldCheck, t: "Differential privacy", d: "Calibrated noise (ε=2.1) so no individual pattern can be inverted.", g: "from-accent/15 to-accent/5", n: "" },
          ].map((p) => (
            <div key={p.t} className={`rounded-2xl border border-border bg-gradient-to-br ${p.g} p-3.5`}>
              <div className="flex items-center justify-between">
                <p.i className="w-5 h-5 text-secondary" />
                <span className="text-[9px] uppercase tracking-widest text-secondary font-mono">{p.n}</span>
              </div>
              <div className="font-medium text-sm mt-2">{p.t}</div>
              <p className="text-[11px] text-muted-foreground mt-1">{p.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your training preferences */}
      <section className="px-5">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-mono"></span>
          <h2 className="font-display text-lg">Your training preferences</h2>
        </div>
        <p className="-mt-1 mb-3 text-[11px] text-muted-foreground">
          Explicit consent · per-feature toggles · revoke any time
        </p>

        {loading ? (
          <div className="py-8 text-sm text-muted-foreground text-center">Loading…</div>
        ) : (
          <div className="space-y-2">
            {prefs.map((p, i) => {
              const isOn = training?.[p.key] === 1;
              return (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isOn ? "bg-secondary/15 text-secondary border border-secondary/30" : "bg-muted text-muted-foreground"
                  }`}>
                    <p.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-sm">{p.label}</span>
                      <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                        {p.arabic}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(p.key, isOn ? 0 : 1)}
                    className={`relative w-11 h-6 rounded-full transition shrink-0 ${
                      isOn ? "bg-secondary" : "bg-muted border border-border"
                    }`}
                    aria-pressed={isOn}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-soft transition-all ${
                        isOn ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Federated rounds preview */}
      <div className="px-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="font-medium text-sm">Live federation status</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-display text-xl">247</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Rounds</div>
            </div>
            <div>
              <div className="font-display text-xl">12.4k</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Devices</div>
            </div>
            <div>
              <div className="font-display text-xl">+3.1%</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Accuracy</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Next round opens in ~6h · only ON-device users with charging + Wi-Fi participate.
          </p>
        </div>
      </div>

      {/* Cirkle-unique AI Consent Matrix — per-pillar, per-tier granular control */}
      <div className="mx-4 mt-6 p-4 rounded-2xl glass border border-border/40">
        <AIConsents />
      </div>

      <ProtoFooter section="" title="AI that serves you, not advertisers">
        Models live on your device. The only data leaving is encrypted, aggregated gradients — and only
        if you opt in. Differential privacy guarantees no single person can be reverse-engineered from
        the global model. You can revoke any consent in one tap, any time.
      </ProtoFooter>
    </div>
  );
}

export default AICoreScreen;
