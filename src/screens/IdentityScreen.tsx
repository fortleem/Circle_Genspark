// — Brand Identity & Dynamic Naming Convention (full 2.1 → 2.9 coverage)
import { PageShell, GlassCard, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { Sparkles, Palette, Type, Globe, FileJson, MessageCircle, AppWindow, Check } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { ALL_LANGS, getNames } from "@/lib/i18n";
import { CirkleMark } from "@/components/brand/CircleMark";
import { useState } from "react";

const PRIMARY_MODULES = [
  "module_chat", "module_video", "module_photos", "module_square",
  "module_groups", "module_official", "module_creators", "module_maktab",
  "module_professional", "module_travel", "module_payments", "module_mail",
] as const;

// 2.3 Creative & Cultural Adaptation Notes
const CULTURAL_NOTES = [
  { lang: "Arabic (ar)", notes: "Wasl (وصل) = 'to connect' — same root as ittisāl (communication). Midan (ميدان) = public square, has revolutionary resonance from Tahrir." },
  { lang: "Chinese (zh)", notes: "连接 (liánjiē) = 'connect', simple and modern. 广场 (guǎngchǎng) = public square, evokes Tian'anmen — large-scale gathering." },
  { lang: "French (fr)", notes: "Relier means 'to bind together' — stronger than 'connecter'. Place publique used for the social square — civic and historic." },
  { lang: "Spanish (es)", notes: "Conectar is direct; Plaza beats 'cuadrado' for the social square — central gathering space in every Spanish-speaking city." },
  { lang: "German (de)", notes: "Verbinden = to link/connect, technically precise. Platz = public square — central, civic." },
  { lang: "Italian (it)", notes: "Collegare emphasizes the act of connecting. Piazza is iconic — every Italian city is built around one." },
  { lang: "English (US)", notes: "Functional: Connect / Watch / Glimpses / Square — instantly understandable to mainstream users." },
  { lang: "English (Brand)", notes: "Wasl / Mashahd / Lamahat / Midan — preserves Arabic-rooted poetry. Used in docs, global marketing, and by brand enthusiasts." },
];

// 2.4 Visual Identity
const VISUAL = {
  colors: [
    { name: "Gold", hex: "#C2A060", role: "Brand primary, accents, CTAs" },
    { name: "Teal", hex: "#1A4A5A", role: "Secondary, headers, info states" },
    { name: "Rose", hex: "#B16A6C", role: "Highlights, warnings, hearts" },
    { name: "Steel", hex: "#3D4F58", role: "Neutral surfaces, body" },
    { name: "Charcoal", hex: "#1B1F23", role: "Dark theme background" },
    { name: "Cream", hex: "#FAF7F1", role: "Light theme background" },
  ],
  typography: [
    { name: "Fraunces", role: "Display, wordmark, headings (Latin, global)" },
    { name: "Inter", role: "UI body text (Latin)" },
    { name: "Tajawal", role: "Arabic UI + body — pairs with Inter for bilingual screens" },
  ],
};

// 2.5 Domains
const DOMAINS = [
  { tld: "cirkle.app", use: "Global root, English (Brand)" },
  { tld: "cirkle.app/ar", use: "Arabic users → دواير" },
  { tld: "cirkle.app/zh", use: "Chinese users → 圆圈" },
  { tld: "cirkle.app/fr", use: "French users → Cercle" },
  { tld: "dawayer.app", use: "Arabic-region alias" },
  { tld: "cirkle.eg", use: "Egypt ccTLD (DRE-routed)" },
];

// 2.7 Brand Voice
const VOICES = [
  { lang: "Arabic", tone: "Warm, family-oriented. Uses 'we' (نحن) and emphasizes belonging. Avoids slang." },
  { lang: "English (US)", tone: "Direct, friendly, no jargon. Empowering but not preachy. Apple-meets-NPR." },
  { lang: "Chinese", tone: "Respectful, efficient. Highlights performance and reliability." },
  { lang: "European", tone: "Polite, formal opening, then warm. Strong privacy-rights framing." },
];

export function IdentityScreen() {
  const { names, locale, setLocale } = useApp();
  const [showAll, setShowAll] = useState(false);

  return (
    <PageShell
      icon={Sparkles}
      title={names.brand_name}
      arabicTitle="دواير"
      section=""
      tagline="One soul, many voices — eight locales, one cohesive identity"
      intro="Cirkle's identity is rooted in its Arabic origin (Dawayer — cirkles of connection). However, every module dynamically presents localized names based on the user's language preference, creating a uniquely accessible super-app for the world."
    >
      {/* 2.1 Brand mark + tagline */}
      <SectionHeader title="One Soul, Many Voices" />
      <GlassCard className="mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          <CirkleMark size={96} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-4xl">دواير</h2>
            <p className="text-sm text-muted-foreground mt-1">Daw&apos;air — <em>the rings of a connected life</em></p>
            <p className="text-sm mt-3">{names.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VISUAL.colors.slice(0, 4).map((c) => (
                <span key={c.name} className="px-2 py-1 text-[10px] rounded-full glass border border-border/40 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: c.hex }} /> {c.hex} {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Locales" value={ALL_LANGS.length.toString()} />
        <StatTile label="RTL" value="1" hint="Arabic" />
        <StatTile label="Modules" value="31" hint="per locale" />
        <StatTile label="Total names" value={(ALL_LANGS.length * 39).toLocaleString()} />
      </div>

      {/* 2.2 NameMatrix */}
      <SectionHeader title="Dynamic Naming Matrix" hint={`8 locales × 39 fields`} />
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={`px-3 py-1.5 text-xs rounded-full border transition ${
              locale === l.code ? "bg-secondary text-secondary-foreground border-secondary" : "glass border-border/40"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <GlassCard className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2 sticky left-0 bg-background/80">Module</th>
              {ALL_LANGS.slice(0, showAll ? ALL_LANGS.length : 4).map((l) => (
                <th key={l.code} className="text-left py-2 px-2">{l.code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRIMARY_MODULES.map((m) => (
              <tr key={m} className="border-t border-border/30">
                <td className="py-2 px-2 font-mono text-[10px] text-muted-foreground sticky left-0 bg-background/80">{m}</td>
                {ALL_LANGS.slice(0, showAll ? ALL_LANGS.length : 4).map((l) => (
                  <td key={l.code} className="py-2 px-2">{getNames(l.code)[m as keyof ReturnType<typeof getNames>]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setShowAll((s) => !s)}
          className="mt-3 text-xs text-secondary hover:underline">{showAll ? "Show fewer locales" : "Show all 8 locales"}</button>
      </GlassCard>

      {/* 2.3 Cultural notes */}
      <SectionHeader title="Creative & Cultural Adaptation" />
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {CULTURAL_NOTES.map((c) => (
          <GlassCard key={c.lang}>
            <h3 className="font-medium text-sm flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-secondary" /> {c.lang}</h3>
            <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>
          </GlassCard>
        ))}
      </div>

      {/* 2.4 Visual Identity */}
      <SectionHeader title="Visual Identity" hint="Unchanged across languages" />
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <GlassCard>
          <h3 className="font-medium flex items-center gap-2 mb-3"><Palette className="w-4 h-4 text-secondary" /> Palette</h3>
          <div className="space-y-2">
            {VISUAL.colors.map((c) => (
              <div key={c.name} className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-lg border border-border/40 shrink-0" style={{ background: c.hex }} />
                <span className="font-mono w-16">{c.hex}</span>
                <span className="font-medium w-16">{c.name}</span>
                <span className="text-muted-foreground">{c.role}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="font-medium flex items-center gap-2 mb-3"><Type className="w-4 h-4 text-secondary" /> Typography</h3>
          <div className="space-y-3">
            {VISUAL.typography.map((t) => (
              <div key={t.name}>
                <p className="font-display text-lg">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 2.5 Domains */}
      <SectionHeader title="Domains & Subdomains" />
      <GlassCard className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2">URL</th>
              <th className="text-left py-2 px-2">Use case</th>
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => (
              <tr key={d.tld} className="border-t border-border/30">
                <td className="py-2 px-2 font-mono text-xs text-secondary">{d.tld}</td>
                <td className="py-2 px-2 text-muted-foreground">{d.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* 2.6 Implementation */}
      <SectionHeader title="In-App Dynamic Labels" hint="Implementation" />
      <GlassCard className="mb-8">
        <h3 className="font-medium flex items-center gap-2 mb-2"><FileJson className="w-4 h-4 text-secondary" /> Single source of truth</h3>
        <p className="text-sm text-muted-foreground mb-3">All locales live in <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">src/server/i18n.ts</code> as a typed <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">Record&lt;Lang, NameMatrix&gt;</code>. Switching the language re-renders the entire app — including module names in the dock, sidebar, and TopBar — without any reload.</p>
        <pre className="text-[11px] bg-muted/40 rounded-lg p-3 overflow-x-auto"><code>{`import { getNames } from '@/lib/i18n'
const names = getNames(userLocale) // returns full NameMatrix
console.log(names.module_chat) // 'وصل' or 'Connect' or 'Wasl' etc.`}</code></pre>
      </GlassCard>

      {/* 2.7 Brand Voice */}
      <SectionHeader title="Brand Voice by Language" />
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {VOICES.map((v) => (
          <GlassCard key={v.lang}>
            <h3 className="font-medium text-sm flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5 text-secondary" /> {v.lang}</h3>
            <p className="text-xs text-muted-foreground mt-1">{v.tone}</p>
          </GlassCard>
        ))}
      </div>

      {/* 2.8 App store strategy */}
      <SectionHeader title="Dynamic App Store Presence" />
      <GlassCard className="mb-8">
        <p className="text-sm text-muted-foreground mb-3"><AppWindow className="inline w-4 h-4 mr-1 text-secondary" /> Each regional App Store listing uses the localized name for the app title and each featured module.</p>
        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          <div className="px-3 py-2 rounded-lg glass border border-border/40"><strong>🇪🇬 Apple AR</strong><br /><span className="text-muted-foreground">دواير · تطبيق العالم المتصل</span></div>
          <div className="px-3 py-2 rounded-lg glass border border-border/40"><strong>🇺🇸 Apple US</strong><br /><span className="text-muted-foreground">Cirkle · A New Social OS</span></div>
          <div className="px-3 py-2 rounded-lg glass border border-border/40"><strong>🇨🇳 Apple CN</strong><br /><span className="text-muted-foreground">圆圈 · 全新社交操作系统</span></div>
        </div>
      </GlassCard>

      {/* 2.9 Summary */}
      <SectionHeader title="Summary of Part 2" />
      <GlassCard>
        <ul className="space-y-2">
          {[
            "Dynamic naming across 7 languages + 2 English variants",
            "Culturally adapted names (e.g., Plaza for Midan in Spanish)",
            "Dual English strategy (Brand vs US User)",
            "Single typed NameMatrix as source of truth",
            "App Store localization strategy",
            "Visual identity preserved globally",
          ].map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {s}
            </li>
          ))}
        </ul>
      </GlassCard>
    </PageShell>
  );
}

export default IdentityScreen;
