// — User Journeys (§35 of CIRCLE BLUEPRINT)
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { BookOpen, MapPin, Sparkles } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

type Beat = { pillar: string; step: string; tag?: string };
type Journey = {
  persona: string;
  city: string;
  signature: string; // What Cirkle uniquely unlocks for them
  arc: Beat[];
};

const JOURNEYS: Journey[] = [
  {
    persona: "Layla — Cairo architecture student",
    city: "Cairo · 22",
    signature: "Vault-protected portfolio, mesh-resilient communications during protests",
    arc: [
      { pillar: "Onboarding", step: "Installs Cirkle from an APK shared on a flash drive — no Play Store needed." },
      { pillar: "Identity",   step: "Creates Dual Identity: @layla.work for clients, @anon-veil for activism.", tag: "Dual Identity" },
      { pillar: "Backup",     step: "Splits portfolio recovery 3-of-5 with her mother, sister, and three studio peers.", tag: "Family Vault" },
      { pillar: "Mashahd",    step: "Publishes a hand-drawn architectural walkthrough; viewers tip her via Pay." },
      { pillar: "Wasl",       step: "During a power outage, mesh routes her group chat 6 hops to an unaffected node.", tag: "Mesh" },
      { pillar: "Whispers",   step: "Sends a self-destruct media to a journalist contact — burns in 24h.", tag: "Whisper" },
      { pillar: "Privacy",    step: "Runs Privacy Sim against 'state authority': score 28 · advised to enable Ghost mode.", tag: "Privacy Sim" },
    ],
  },
  {
    persona: "Ahmed — Riyadh entrepreneur",
    city: "Riyadh · 34",
    signature: "Cryptographically-anchored event passes for his startup launches",
    arc: [
      { pillar: "Identity",   step: "Verifies KYC tier 2 with on-device document scan — no provider sees the file." },
      { pillar: "Tickets",    step: "Issues 200 VIP passes for his demo day; each anchored SHA-256, no Ticketmaster.", tag: "Ticket Wallet" },
      { pillar: "Pay",        step: "Collects deposits via Cirkle Pay NFC; settles into his federated node's bank rail." },
      { pillar: "Maktab",     step: "Runs the pitch deck collaboratively with 4 co-founders, fully E2E encrypted." },
      { pillar: "Mail",       step: "Sends investor outreach via PGP-signed anonymous-from envelope.", tag: "PGP Mail" },
      { pillar: "Constellation", step: "Profile constellation shows his inner orbit clustered around co-founders.", tag: "Constellation" },
      { pillar: "Capsule",    step: "Seals 'Year One' time capsule; unseals exactly 365 days later for retrospective.", tag: "Time Capsule" },
    ],
  },
  {
    persona: "Zhang Wei — Shanghai designer",
    city: "Shanghai · 28",
    signature: "Plane-routed compliance + creator economy without platform tax",
    arc: [
      { pillar: "DRE",        step: "DRE auto-places her on China plane; regional content rules apply silently." },
      { pillar: "Maktab",     step: "Collaborates with overseas clients on E2E design docs — no Adobe lock-in." },
      { pillar: "Lamahat",    step: "Posts hexagonal story tiles; gets 12k impressions across federated instances." },
      { pillar: "Mini Apps",  step: "Sells Procreate brush packs via Cirkle's marketplace — 0% platform fee." },
      { pillar: "AI Consent", step: "Grants on-device only; revokes Mashahd federated; cloud stays off everywhere.", tag: "AI Matrix" },
      { pillar: "Echo",       step: "AI summarises her client thread on demand — playback proves she delivered." },
      { pillar: "Pulse",      step: "Pulse Ribbon shows her work trending in 4 cities — opens 2 new opportunities.", tag: "Pulse" },
    ],
  },
  {
    persona: "Karim — Marrakech imam",
    city: "Marrakech · 51",
    signature: "Pilgrimage logistics + culturally-aware travel guidance",
    arc: [
      { pillar: "Rihla",      step: "Plans a community hajj trip for 47 pilgrims — bookings, lodging, transit all in one." },
      { pillar: "Cultural Interpreter", step: "Lens reveals Saudi etiquette norms relevant to his diverse delegation.", tag: "Cultural Lens" },
      { pillar: "Translate",  step: "Sermons translated to French, English, Urdu, Indonesian — runs on-device." },
      { pillar: "Pay",        step: "Collects pilgrimage dues; auto-zakat 2.5% split to verified charity addresses." },
      { pillar: "Reality Lens", step: "Pins photos from each holy site — pilgrims can re-walk the route in AR a year later.", tag: "Reality Lens" },
      { pillar: "Mashahd",    step: "Live-streams Friday khutba via federated PeerTube; 14k viewers across 11 countries." },
      { pillar: "Backup",     step: "Encrypted backup of his entire sermon archive, distributed IPFS + 3 mesh peers." },
    ],
  },
  {
    persona: "Yousef — Riyadh tech worker",
    city: "Riyadh · 29",
    signature: "Daily-driver Cirkle — replaces 8 closed-source apps with one open identity",
    arc: [
      { pillar: "Onboarding", step: "Onboards via Splash → picks Arabic; DRE auto-applies Saudi plane." },
      { pillar: "Wasl",       step: "First encrypted family group chat with end-to-end Olm/Megolm." },
      { pillar: "Channels",   step: "Joins 3 verified university channels; bookmarks bookmark his college dean." },
      { pillar: "Maps",       step: "Routes a Mecca trip offline — no Google telemetry, no ad-supported POIs." },
      { pillar: "Mail",       step: "On-device AI triages his inbox; spam vanishes; high-priority surfaces." },
      { pillar: "Smart Router", step: "Drafts a long thought — Cirkle suggests it belongs in Channels not Midan.", tag: "Smart Router" },
      { pillar: "Profile",    step: "Trust score 98 · Gold tier · Constellation widget shows 12-person inner orbit." },
    ],
  },
  {
    persona: "Anaïs — Paris doctoral student",
    city: "Paris · 27",
    signature: "Self-hosted full sovereignty + GDPR-grade rights",
    arc: [
      { pillar: "DRE",        step: "Placed on EU plane; Privacy Dashboard exposes full GDPR + Article 22 controls." },
      { pillar: "Selfhost",   step: "Spins up her own node on a €4/mo Hetzner VPS; thesis archive lives there." },
      { pillar: "Mashahd",    step: "French-language lecture series — peer-tube federated, no YouTube takedowns." },
      { pillar: "Translate",  step: "Russian research papers translate on-device — corpus never leaves her laptop." },
      { pillar: "Governance", step: "Votes in Cirkle's quadratic governance ballot on covenant amendment §17.4." },
    ],
  },
  {
    persona: "Tariq — Cairo emergency responder",
    city: "Cairo · 38",
    signature: "Mesh communications when civilization's cell towers fail",
    arc: [
      { pillar: "Mesh",       step: "Building collapse · no cell signal · Bluetooth mesh activates automatically." },
      { pillar: "SOS",        step: "Broadcast reaches 47 peers in 4 hops within 30 seconds — auto-prioritised.", tag: "SOS Beacon" },
      { pillar: "Wasl",       step: "Coordinates triage via mesh-routed messages; presence chip shows 23 responders online." },
      { pillar: "Maps",       step: "Offline tiles guide him through unfamiliar district — no internet required." },
      { pillar: "Pulse",      step: "Cross-pillar Pulse alerts city-wide responders; Cirkle becomes the incident channel." },
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
      section=""
      tagline="Real user stories that demonstrate what Cirkle replaces — and unlocks"
      intro="Five personas across five continents showing how Cirkle's modules combine in practice. Every journey could happen entirely without Big Tech intermediaries."
    >
      <SectionHeader title="Personas" hint={`${JOURNEYS.length} narratives mapped to §35`} />
      <div className="space-y-4">
        {JOURNEYS.map((j) => (
          <GlassCard key={j.persona}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg leading-tight">{j.persona}</h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {j.city}
                </p>
              </div>
            </div>
            <p className="text-xs text-foreground/80 mt-2 flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 text-secondary mt-0.5 shrink-0" />
              <span>{j.signature}</span>
            </p>
            <ol className="mt-3 space-y-2">
              {j.arc.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="font-mono text-[10px] text-secondary mt-1 shrink-0 w-4">{(i + 1).toString().padStart(2, "0")}</span>
                  <span className="flex-1">
                    <span className="text-[10px] uppercase tracking-widest text-foreground/60 mr-1.5">{step.pillar}</span>
                    {step.step}
                    {step.tag && (
                      <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-medium">
                        {step.tag}
                      </span>
                    )}
                  </span>
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
