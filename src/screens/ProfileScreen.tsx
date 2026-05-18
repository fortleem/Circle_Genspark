import { BadgeCheck, ShieldCheck, Sparkles, Languages, Palette, Lock, Database, Globe, ChevronRight } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

export function ProfileScreen() {
  const { theme, toggleTheme, locale, toggleLocale } = useApp();
  return (
    <div className="pb-32">
      {/* Header card */}
      <div className="mx-4 mt-3 rounded-3xl overflow-hidden relative bg-gradient-hero shadow-float" style={{ color: 'hsl(var(--cream))' }}>
        <div className="absolute inset-0 bg-gradient-aurora opacity-60" />
        <div className="relative p-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-gold p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-display text-3xl text-foreground">Y</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-2xl truncate">Yousef Al-Harbi</h2>
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div className="text-xs opacity-80">@yousef · Riyadh</div>
            <div className="flex gap-4 mt-2 text-xs">
              <span><b className="font-display text-base">2.4K</b> followers</span>
              <span><b className="font-display text-base">312</b> following</span>
              <span><b className="font-display text-base">Gold</b> tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        {[
          { v: "98", l: "Trust score" },
          { v: "12", l: "Workspaces" },
          { v: "47", l: "Verified items" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-3 text-center">
            <div className="font-display text-2xl gradient-text-gold">{s.v}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <Section title="Privacy & Identity">
        <Row icon={ShieldCheck} title="Privacy center" sub="Granular controls for every module" />
        <Row icon={Lock} title="Ghost mode" sub="Vanish from presence everywhere" toggle />
        <Row icon={Database} title="Data ownership" sub="Export, delete, or transfer" />
      </Section>

      <Section title="Personalization">
        <Row icon={Sparkles} title="AI personalization" sub="What Circle knows about you" />
        <Row icon={Palette} title="Theme" sub={theme === "dark" ? "Dark · Aurora" : "Light · Cream"} onClick={toggleTheme} />
        <Row icon={Languages} title="Language" sub={locale === "ar" ? "العربية (RTL)" : "English"} onClick={toggleLocale} />
        <Row icon={Globe} title="Region" sub="Saudi Arabia" />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 mt-6">
      <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">{title}</h3>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, title, sub, toggle, onClick }: { icon: any; title: string; sub: string; toggle?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><Icon className="w-4 h-4 text-secondary" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{sub}</div>
      </div>
      {toggle ? (
        <span className="w-9 h-5 rounded-full bg-muted relative">
          <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground" />
        </span>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}
