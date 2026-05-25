// — Unique Features
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { Star, Bluetooth, CreditCard, Languages, FileText, ShieldCheck, Globe2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const FEATURES = [
  { icon: Bluetooth, t: "Bluetooth mesh", d: "Wasl messages travel peer-to-peer when offline. SOS broadcasts reach 4–6 hops over 200m+ ranges." },
  { icon: CreditCard, t: "NFC payments", d: "Tap-to-pay between phones using Circle Pay. Works offline, settles when back online via federated nodes." },
  { icon: Languages, t: "On-device translation", d: "40+ languages, no text leaves your phone. Real-time speech-to-speech across conversations." },
  { icon: FileText, t: "AI mail summaries", d: "Inbox prioritization runs locally — no ad scanning of email content, ever." },
  { icon: ShieldCheck, t: "Privacy dashboard", d: "See every permission, every federation, every byte: full data transparency by default." },
  { icon: Globe2, t: "DRE (Dynamic Regional Engine)", d: "Smart routing across 6 data planes (global/CN/RU/IR/VN/EU) so you stay reachable everywhere." },
];

export function UniqueScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={Star}
      title={names.module_unique}
      arabicTitle="المميزات الفريدة"
      section=""
      tagline="What no other super app can do"
      intro="Circle ships six capabilities that no centralized competitor can match — because they require user sovereignty, on-device AI, and federated infrastructure."
    >
      <SectionHeader title="Six superpowers" />
      <div className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <GlassCard key={f.t}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-lg">{f.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default UniqueScreen;
