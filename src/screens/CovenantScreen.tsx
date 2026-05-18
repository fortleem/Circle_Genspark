// §1 — Executive Vision / Covenant
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { BadgeCheck, ShieldCheck, Globe2, Users, Sparkles, Lock } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const PILLARS = [
  { icon: ShieldCheck, title: "Privacy First",        desc: "End-to-end encrypted by default. No data sold, no surveillance economy." },
  { icon: Globe2,      title: "Federated & Open",     desc: "Matrix + IPFS + PeerTube. Self-host, migrate, fork — your data stays yours." },
  { icon: Users,       title: "Community Governed",   desc: "Bylaws, town halls, on-chain proposals. Users own the platform direction." },
  { icon: Sparkles,    title: "AI-Native",            desc: "On-device ONNX models, no cloud telemetry. Optional federated learning." },
  { icon: Lock,        title: "Sovereign Identity",   desc: "Circle ID is self-custodial. One identity across all 31 modules." },
  { icon: BadgeCheck,  title: "Transparent Economics", desc: "Public ad ledger, monthly revenue allocation reports, no shadow ranking." },
];

export function CovenantScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={BadgeCheck}
      title={names.covenant}
      arabicTitle="العهد"
      section="§1"
      tagline="The non-negotiable promises Circle makes to every user"
      intro="Circle (دواير) is a privacy-first, federated, AI-native super app — the connected world's first user-owned alternative to surveillance social networks. These six covenants govern every decision, feature, and line of code."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {PILLARS.map((p) => (
          <GlassCard key={p.title}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-10">
        <SectionHeader title="What Circle replaces" hint="One sovereign app" />
        <div className="flex flex-wrap gap-2">
          {["WhatsApp", "YouTube", "Instagram", "X / Twitter", "LinkedIn", "Trip.com", "Gmail", "Maps", "Zoom"].map((x) => (
            <span key={x} className="px-3 py-1.5 text-xs rounded-full glass border border-border/40">{x}</span>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export default CovenantScreen;
