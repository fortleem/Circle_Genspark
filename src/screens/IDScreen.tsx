// §21 — Circle ID (sovereign identity)
import { PageShell, GlassCard, StatTile, SectionHeader } from "@/components/shell/PageShell";
import { KeyRound, Fingerprint, ShieldCheck, Globe } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

export function IDScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={KeyRound}
      title={names.module_id}
      arabicTitle="هوية دواير"
      section="§21"
      tagline="One self-custodial identity, valid across all 31 modules"
      intro="Circle ID is a DID (Decentralized Identifier) you fully own. Your handle, verification badges, payment addresses, and reputation travel with you across federated nodes — no platform can deplatform you, only your local server can."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Public key" value="ed25519" hint="32-byte" />
        <StatTile label="Recovery" value="3-of-5" hint="Shamir secret" />
        <StatTile label="Modules linked" value="31/31" />
        <StatTile label="Federated nodes" value="∞" hint="self-host capable" />
      </div>

      <SectionHeader title="Your identity card" />
      <GlassCard className="bg-gradient-to-br from-secondary/10 to-primary/10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Circle ID</div>
            <div className="font-mono text-sm break-all">did:circle:0x7f2…ae91</div>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Handle</div>
            <div className="font-display text-lg">@yousef</div>
          </div>
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
            <Fingerprint className="w-12 h-12 text-background" />
          </div>
        </div>
      </GlassCard>

      <SectionHeader title="What you can do" />
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { icon: ShieldCheck, t: "Sign in everywhere", d: "Single signature unlocks all 31 modules + federated 3rd-party apps." },
          { icon: Globe,       t: "Migrate freely",     d: "Export your full state and re-import to any other Circle node." },
          { icon: KeyRound,    t: "Recover safely",     d: "3-of-5 Shamir backup — split keys across trusted contacts." },
          { icon: Fingerprint, t: "Biometric local",    d: "Face/fingerprint unlocks the local key vault — never sent anywhere." },
        ].map((x) => (
          <GlassCard key={x.t}>
            <div className="flex items-start gap-3">
              <x.icon className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">{x.t}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{x.d}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default IDScreen;
