// §16 — Circle Verify
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { BadgeCheck, ShieldCheck, KeyRound, Globe, FileCheck2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const TIERS = [
  { icon: KeyRound,   tier: "Self-attested",   color: "bg-muted text-muted-foreground",            desc: "Verified email + phone, anti-bot challenge." },
  { icon: FileCheck2, tier: "ID-verified",     color: "bg-secondary/15 text-secondary",             desc: "Government ID hash on-chain (PII never stored)." },
  { icon: Globe,      tier: "Institution",     color: "bg-primary/15 text-primary",                 desc: "Verified domain ownership, public registry record." },
  { icon: ShieldCheck,tier: "Public figure",   color: "bg-accent/15 text-accent",                   desc: "Manual review + multi-source attestation." },
];

export function VerifyScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={BadgeCheck}
      title={names.module_verify}
      arabicTitle="توثيق دواير"
      section="§16"
      tagline="Tiered verification you can trust — and inspect"
      intro="Circle Verify replaces opaque blue checkmarks with a four-tier transparent system. Every badge is cryptographically signed, publicly auditable on the Circle ledger, and revocable by community vote."
    >
      <SectionHeader title="Verification tiers" />
      <div className="grid sm:grid-cols-2 gap-4">
        {TIERS.map((t, i) => (
          <GlassCard key={t.tier}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.color}`}>
                <t.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg">Tier {i+1} — {t.tier}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default VerifyScreen;
