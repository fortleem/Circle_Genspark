// §35 — User Journeys
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { BookOpen } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const JOURNEYS = [
  {
    persona: "Yousef — Riyadh tech worker",
    arc: [
      "Onboards via Splash → Onboarding → picks Arabic.",
      "Sends first encrypted Wasl message to family group.",
      "Joins his college's Circle group; bookmarks 3 verified channels.",
      "Plans a Mecca trip in Rihla; pays deposit via Circle Pay NFC.",
      "Receives mail summarized by on-device AI; deletes spam from Maktab inbox.",
    ],
  },
  {
    persona: "Mei — Shanghai designer",
    arc: [
      "Installs Circle via WeChat-shared APK; DRE auto-routes to China plane.",
      "Discovers Maktab for client collaboration (E2E docs + meet).",
      "Posts on Midan with a creator-channel watermark for portfolio.",
      "Sells design templates via Mini Apps marketplace.",
    ],
  },
  {
    persona: "Anaïs — Paris doctoral student",
    arc: [
      "DRE places her on EU plane; Privacy Dashboard shows full GDPR controls.",
      "Mashahd lecture series in French via federated PeerTube.",
      "Translation runs on-device for her Russian-language research papers.",
      "Self-hosts her own node on Hetzner VPS for thesis archive.",
    ],
  },
  {
    persona: "Tariq — Cairo emergency responder",
    arc: [
      "Bluetooth mesh kicks in during a building collapse — no cell signal.",
      "Broadcasts SOS reaching 47 peers in 4 hops within 30 seconds.",
      "Coordinates triage via Wasl mesh-routed messages.",
      "Maps offline tiles guide him through unfamiliar district.",
    ],
  },
  {
    persona: "Lin — Hanoi educator",
    arc: [
      "Uses Maktab to run a 200-student classroom remotely.",
      "Vietnam plane auto-applies regional content filters per gov compliance.",
      "Pays teachers via Circle Pay; settles to local bank via federated node.",
      "Receives Circle Verify Tier 2 (institution) badge for her school.",
    ],
  },
];

export function JourneysScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={BookOpen}
      title={names.module_journeys}
      arabicTitle="رحلات المستخدمين"
      section="§35"
      tagline="Real user stories that demonstrate what Circle replaces — and unlocks"
      intro="Five personas across five continents showing how Circle's modules combine in practice. Every journey could happen entirely without Big Tech intermediaries."
    >
      <SectionHeader title="Personas" />
      <div className="space-y-4">
        {JOURNEYS.map((j) => (
          <GlassCard key={j.persona}>
            <h3 className="font-display text-lg">{j.persona}</h3>
            <ol className="mt-3 space-y-2">
              {j.arc.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="font-mono text-[10px] text-secondary mt-1 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default JourneysScreen;
