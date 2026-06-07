// — Privacy Dashboard
import { PageShell, GlassCard, SectionHeader, StatTile, EmptyState } from "@/components/shell/PageShell";
import { Lock } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useApp } from "@/providers/AppProvider";
import { PrivacySimulator } from "@/components/futuristic/PrivacySimulator";

export function PrivacyScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ privacy: any }>("/privacy/1");
  const p = data?.privacy ?? {};
  return (
    <PageShell
      icon={Lock}
      title={names.module_privacy}
      arabicTitle="الخصوصية"
      section=""
      tagline="See and control every piece of data Circle holds about you"
      intro="The Privacy Dashboard is your single source of truth: granular permissions, consent log, data export, and the right-to-be-forgotten — all immediately actionable. Zero hidden tracking, ever."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Permissions granted" value="7/24" hint="explicit only" />
        <StatTile label="Data on server" value="12 MB" hint="encrypted" />
        <StatTile label="Trackers" value="0" hint="zero policy" />
        <StatTile label="Export" value="JSON+IPFS" hint="anytime" />
      </div>

      {/* Circle-unique Privacy Simulator — see what each viewer kind sees */}
      <SectionHeader title="What can they see?" hint="Circle-unique · viewer simulation" />
      <div className="mb-8">
        <PrivacySimulator />
      </div>

      <SectionHeader title="Active consents" />
      {loading ? <EmptyState message="Loading..." /> : (
        <GlassCard>
          <div className="space-y-3">
            {[
              { k: "ai_training", t: "AI training contribution", d: "Federated learning gradients" },
              { k: "analytics", t: "Anonymous analytics", d: "Crash + feature usage" },
              { k: "location", t: "Coarse location", d: "City-level (for regional content)" },
              { k: "contacts", t: "Contact discovery", d: "Local hash matching only" },
              { k: "notifications", t: "Push notifications", d: "Via your federated node" },
            ].map((row) => {
              const on = p?.[row.k] === 1 || p?.[row.k] === true;
              return (
                <div key={row.k} className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0 border-border/30">
                  <div>
                    <p className="font-medium text-sm">{row.t}</p>
                    <p className="text-xs text-muted-foreground">{row.d}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${on ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"}`}>
                    {on ? "Granted" : "Denied"}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      <SectionHeader title="Your data rights" />
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { t: "Export everything", d: "Download all your data as JSON + IPFS CID" },
          { t: "Delete account", d: "Cryptographic deletion + federation broadcast" },
          { t: "Right to be forgotten", d: "Search index removal across all nodes" },
        ].map((r) => (
          <GlassCard key={r.t}>
            <h3 className="font-medium text-sm">{r.t}</h3>
            <p className="text-xs text-muted-foreground mt-1">{r.d}</p>
            <button className="mt-3 px-3 py-1 text-xs rounded-full glass border border-border/40">Run</button>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default PrivacyScreen;
