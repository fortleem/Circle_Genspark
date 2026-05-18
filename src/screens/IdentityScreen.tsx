// §2 — Brand identity & NameMatrix (8 locales)
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { Sparkles } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { ALL_LANGS, getNames } from "@/lib/i18n";
import { CircleMark } from "@/components/brand/CircleMark";

const MODULES = [
  "module_chat", "module_video", "module_photos", "module_square",
  "module_groups", "module_official", "module_creators", "module_maktab",
  "module_professional", "module_travel", "module_payments", "module_mail",
  "module_id", "module_verify", "module_mesh", "module_translate", "module_maps",
] as const;

export function IdentityScreen() {
  const { names, locale, setLocale } = useApp();
  return (
    <PageShell
      icon={Sparkles}
      title={names.brand_name}
      arabicTitle="دواير"
      section="§2"
      tagline="One name, eight languages — built for a connected, multilingual world"
      intro="Circle uses a NameMatrix: every module has a canonical name in 8 locales. Switch the language and the entire app — including arabic-native module names like Wasl, Mashahd, Lamahat, Midan — instantly re-renders."
    >
      {/* Brand mark */}
      <div className="flex items-center gap-6 mb-8">
        <CircleMark size={96} />
        <div>
          <h2 className="font-display text-3xl">دواير</h2>
          <p className="text-sm text-muted-foreground mt-1">Daw&apos;air — the rings of a connected life</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["#C2A060 Gold", "#1A4A5A Teal", "#B16A6C Rose", "#3D4F58 Steel"].map((c) => (
              <span key={c} className="px-2 py-1 text-[10px] rounded-full glass border border-border/40">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Locale switcher */}
      <SectionHeader title="Available locales" hint={`${ALL_LANGS.length} languages`} />
      <div className="flex flex-wrap gap-2 mb-8">
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

      {/* NameMatrix table */}
      <SectionHeader title="NameMatrix preview" hint={`Current: ${locale}`} />
      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2">Module</th>
              {ALL_LANGS.slice(0, 4).map((l) => (
                <th key={l.code} className="text-left py-2 px-2">{l.code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m} className="border-t border-border/30">
                <td className="py-2 px-2 font-mono text-[10px] text-muted-foreground">{m}</td>
                {ALL_LANGS.slice(0, 4).map((l) => (
                  <td key={l.code} className="py-2 px-2">{getNames(l.code)[m as keyof ReturnType<typeof getNames>]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </PageShell>
  );
}

export default IdentityScreen;
