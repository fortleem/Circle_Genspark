// §31 — Tech Stack
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { Cpu } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const STACK = [
  { area: "Web app",       items: ["Vite 5", "React 18", "TypeScript 5", "TailwindCSS 3", "shadcn/ui + Radix", "framer-motion 12"] },
  { area: "Mobile",        items: ["Flutter 3 (Android/iOS)", "ONNX Runtime Mobile", "WebRTC", "BLE peripheral / central"] },
  { area: "Edge",          items: ["Cloudflare Workers", "Cloudflare Pages", "Cloudflare D1 (SQLite)", "Hono 4", "R2 object storage"] },
  { area: "Federation",    items: ["Matrix (Synapse / Dendrite)", "ActivityPub", "IPFS / Kubo", "PeerTube (video)", "CalDAV / CardDAV"] },
  { area: "AI",            items: ["NLLB-200 (translate)", "Whisper (speech)", "DistilBERT (moderation)", "MobileBERT (rank)", "Recommenders v2"] },
  { area: "Cryptography",  items: ["ed25519 (identity)", "X25519 + Olm (E2EE)", "Shamir 3-of-5 backup", "ChaCha20-Poly1305", "BLS sigs (verification)"] },
];

export function TechStackScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={Cpu}
      title={names.module_techstack}
      arabicTitle="مجموعة التقنيات"
      section="§31"
      tagline="An auditable list of every tool that powers Circle"
      intro="Circle is built entirely on open-source software. This page lists every major dependency so users, auditors, and self-hosters know exactly what's under the hood."
    >
      {STACK.map((g) => (
        <div key={g.area} className="mb-6">
          <SectionHeader title={g.area} />
          <div className="flex flex-wrap gap-2">
            {g.items.map((i) => (
              <span key={i} className="px-3 py-1.5 text-xs rounded-full glass border border-border/40">{i}</span>
            ))}
          </div>
        </div>
      ))}
    </PageShell>
  );
}
export default TechStackScreen;
