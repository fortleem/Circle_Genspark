// §14 — Pro Network (LinkedIn replacement)
import { PageShell, GlassCard, EmptyState, SectionHeader } from "@/components/shell/PageShell";
import { Briefcase, MapPin } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { Job, ProProfile } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function ProScreen() {
  const { names } = useApp();
  const { data: jobsData, loading: lj } = useApi<{ jobs: Job[] }>("/pro/jobs");
  const { data: profData, loading: lp } = useApi<{ profiles: ProProfile[] }>("/pro/profiles");
  const jobs = jobsData?.jobs ?? [];
  const profiles = profData?.profiles ?? [];
  return (
    <PageShell
      icon={Briefcase}
      title={names.module_professional}
      arabicTitle="الشبكة المهنية"
      section="§14"
      tagline="Hiring & professional network without surveillance or pay-to-play ranking"
      intro="Pro Network is a federated career platform: post jobs, verify credentials via Circle ID, and connect with professionals in your region. No 'social selling' funnel, no engagement bait."
    >
      <SectionHeader title="Open positions" hint={`${jobs.length} listed`} />
      <div className="space-y-3 mb-8">
        {lj ? <EmptyState message="Loading jobs..." /> : jobs.length === 0 ? <EmptyState /> : jobs.map((j) => (
          <GlassCard key={j.id}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h3 className="font-display text-base">{j.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{j.company}</span>
                  <span>·</span>
                  <MapPin className="w-3 h-3" /> {j.location}
                  {j.remote ? <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px]">Remote</span> : null}
                </p>
                {j.description && <p className="text-sm mt-2 line-clamp-2">{j.description}</p>}
                {j.tags && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {j.tags.split(',').slice(0,4).map(t => (
                      <span key={t} className="px-2 py-0.5 text-[10px] rounded-full glass border border-border/40">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
              <button className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground shrink-0">Apply</button>
            </div>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Professionals" hint={`${profiles.length} verified`} />
      <div className="grid sm:grid-cols-2 gap-3">
        {lp ? <EmptyState message="Loading..." /> : profiles.length === 0 ? <EmptyState /> : profiles.map((p) => (
          <GlassCard key={p.id}>
            <h3 className="font-display text-base">{p.display_name}</h3>
            <p className="text-xs text-muted-foreground">@{p.handle} · {p.city ?? "—"}</p>
            {p.headline && <p className="text-sm mt-1.5">{p.headline}</p>}
            {p.skills && (
              <div className="mt-2 flex flex-wrap gap-1">
                {p.skills.split(',').slice(0,5).map(s => <span key={s} className="px-1.5 py-0.5 text-[10px] rounded glass border border-border/30">{s.trim()}</span>)}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default ProScreen;
