// §3 — Architecture overview
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { Layers } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const LAYERS = [
  { name: "Client",       desc: "iOS/Android/Web apps. ONNX models, Matrix client, IPFS gateway lite, WebRTC."  },
  { name: "Federated nodes", desc: "Matrix homeservers + ActivityPub bridges + IPFS pinning + PeerTube." },
  { name: "Core protocols", desc: "Matrix (chat) · ActivityPub (social) · IPFS (storage) · WebRTC (calls) · NLLB-ONNX (translation)." },
  { name: "Identity",     desc: "DIDs + Verifiable Credentials + Shamir backups. No central key authority." },
  { name: "Data planes",   desc: "Dynamic Regional Engine routes traffic across 6 planes (global/CN/RU/IR/VN/EU)." },
  { name: "Edge",         desc: "Cloudflare Pages + Workers + D1 + R2 for the web companion; self-host nodes for full stack." },
];

export function ArchitectureScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={Layers}
      title={names.module_architecture}
      arabicTitle="البنية"
      section="§3"
      tagline="An open, federated stack — not a black-box silicon valley monoculture"
      intro="Circle's architecture is six interlocking layers of open protocols. Anything can be replaced; the only proprietary bit is the user experience that ties them together."
    >
      <SectionHeader title="Layers" />
      <div className="space-y-3">
        {LAYERS.map((l, i) => (
          <GlassCard key={l.name}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-secondary shrink-0">L{i+1}</span>
              <div>
                <h3 className="font-display text-base">{l.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{l.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default ArchitectureScreen;
