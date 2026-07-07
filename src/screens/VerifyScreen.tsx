// — Cirkle Verify. Prototype design language.
// Covers Tiers, Cryptographic signing, Public ledger, Revocation.
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck, ShieldCheck, KeyRound, Globe, FileCheck2, ScrollText,
  Lock, Vote, ChevronRight, Search,
} from "lucide-react";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

const TIERS = [
  {
    n: 1,
    tier: "Self-attested",
    arabic: "ذاتي",
    icon: KeyRound,
    grad: "from-muted to-muted/60",
    ring: "border-muted-foreground/20",
    cost: "Free",
    time: "~2 min",
    desc: "Verified email + phone + anti-bot challenge. The minimum any real human can clear.",
    perks: ["Post + chat", "Join Cirkles", "Basic Wasl"],
  },
  {
    n: 2,
    tier: "ID-verified",
    arabic: "هوية",
    icon: FileCheck2,
    grad: "from-secondary/30 to-secondary/10",
    ring: "border-secondary/40",
    cost: "Free · funded by foundation",
    time: "~24h",
    desc: "Government ID hashed on-chain — original PII never leaves your device.",
    perks: ["Sell on Pro", "Receive Pay", "Vote in Maktab"],
  },
  {
    n: 3,
    tier: "Institution",
    arabic: "مؤسسة",
    icon: Globe,
    grad: "from-primary/30 to-primary/10",
    ring: "border-primary/40",
    cost: "$25 / year",
    time: "~3 days",
    desc: "Verified domain ownership + public registry record. For schools, NGOs, ministries, brands.",
    perks: ["Official channel", "Bulk Maktab", "DRE listing"],
  },
  {
    n: 4,
    tier: "Public figure",
    arabic: "موثّق عام",
    icon: ShieldCheck,
    grad: "from-accent/30 to-accent/10",
    ring: "border-accent/40",
    cost: "Free · manual review",
    time: "~7 days",
    desc: "Multi-source attestation by reviewers + community vote. Revocable by Cirkle governance.",
    perks: ["Verified badge", "Anti-impersonation lock", "Priority moderation"],
  },
];

export function VerifyScreen() {
  const [active, setActive] = useState<number>(2);
  const [q, setQ] = useState("");
  const activeTier = TIERS.find((t) => t.n === active)!;

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Verify"
        arabic="توثيق"
        section=""
        tagline="Transparent tiers · cryptographically signed · community-revocable"
        right={
          <button className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
            <BadgeCheck className="w-5 h-5" />
          </button>
        }
      />

      {/* Public registry search */}
      <div className="px-5">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
            placeholder="Look up any badge in the public registry"
          />
          <ScrollText className="w-4 h-4 text-secondary" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 ms-2">
          — every badge is on the public ledger
        </p>
      </div>

      {/* Tier tabs */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {TIERS.map((t) => (
          <button
            key={t.n}
            onClick={() => setActive(t.n)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1.5 ${
              active === t.n ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            <t.icon className="w-3 h-3" />
            Tier {t.n}
          </button>
        ))}
      </div>

      {/* Active tier hero card */}
      <div className="px-5">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border-2 ${activeTier.ring} bg-gradient-to-br ${activeTier.grad} p-5 shadow-float`}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-card/80 backdrop-blur flex items-center justify-center shrink-0">
              <activeTier.icon className="w-7 h-7 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-foreground/70">
                · Tier {activeTier.n}
              </div>
              <h2 className="font-display text-2xl mt-0.5">
                {activeTier.tier}{""}
                <span className="text-base text-foreground/60 tracking-widest uppercase">
                  {activeTier.arabic}
                </span>
              </h2>
              <p className="text-sm text-foreground/80 mt-1.5">{activeTier.desc}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-card/70 text-foreground/80">
                  {activeTier.cost}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-card/70 text-foreground/80">
                  {activeTier.time}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {activeTier.perks.map((p) => (
              <div key={p} className="rounded-xl bg-card/60 backdrop-blur p-2 text-center text-[11px] font-medium">
                {p}
              </div>
            ))}
          </div>

          <button className="mt-4 w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition">
            Apply for Tier {activeTier.n}
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Cryptographic + Revocation */}
      <section className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          + How each badge stays trustworthy
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-secondary" />
              <div className="font-medium text-sm">Cryptographically signed</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Each badge is an Ed25519 signature from Cirkle's verification keys, embedded in your profile
              and rotated yearly. Forging is computationally infeasible.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-secondary" />
              <div className="font-medium text-sm">Community-revocable</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Tier 3 + Tier 4 badges can be revoked by an open governance vote with appeal — no quiet
              decisions, no shadow bans, no platform whim.
            </p>
          </div>
        </div>
      </section>

      {/* All tiers compact list */}
      <section className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          All four tiers
        </div>
        <ul className="space-y-2">
          {TIERS.map((t) => (
            <li
              key={t.n}
              className={`rounded-xl border border-border bg-card p-3 flex items-center gap-3 cursor-pointer transition ${
                active === t.n ? "ring-1 ring-primary/40" : ""
              }`}
              onClick={() => setActive(t.n)}
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <t.icon className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Tier {t.n} — {t.tier}</div>
                <div className="text-[11px] text-muted-foreground truncate">{t.desc}</div>
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0">{t.cost.split(" ")[0]}</div>
            </li>
          ))}
        </ul>
      </section>

      <ProtoFooter section="" title="Trust without theatre">
        No paid-for blue checks. No opaque criteria. Four tiers — Self-attested, ID-verified, Institution,
        Public figure — each cryptographically signed and listed in a public registry every member can
        inspect. Tier 3 + Tier 4 badges are revocable by community vote.
      </ProtoFooter>
    </div>
  );
}

export default VerifyScreen;
