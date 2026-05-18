// §29 — Governance & proposals
import { PageShell, GlassCard, EmptyState, SectionHeader } from "@/components/shell/PageShell";
import { Vote } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiPost, type Proposal } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function GovernanceScreen() {
  const { names } = useApp();
  const { data, loading, refetch } = useApi<{ proposals: Proposal[] }>("/governance/proposals");
  const proposals = data?.proposals ?? [];
  const vote = async (id: number, choice: 'yes' | 'no') => {
    try { await apiPost(`/governance/proposals/${id}/vote`, { choice }); refetch(); }
    catch (e) { console.error(e); }
  };
  return (
    <PageShell
      icon={Vote}
      title={names.nav_governance}
      arabicTitle="الحوكمة"
      section="§29"
      tagline="Bylaws, town halls, and proposals — every user holds a vote"
      intro="Circle is a community-governed platform. Any user can submit a proposal; passing votes trigger a 30-day implementation window. All votes are pseudonymous yet verifiable on-chain."
    >
      <SectionHeader title="Active proposals" hint={`${proposals.length} open`} />
      {loading ? <EmptyState message="Loading proposals..." /> : proposals.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">
          {proposals.map((p) => {
            const total = p.votes_yes + p.votes_no;
            const yesPct = total > 0 ? Math.round((p.votes_yes / total) * 100) : 0;
            return (
              <GlassCard key={p.id}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full ${p.status === "active" ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${yesPct}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Yes {p.votes_yes} · No {p.votes_no} · {yesPct}%</span>
                  {p.status === "active" && (
                    <div className="flex gap-2">
                      <button onClick={() => vote(p.id, 'no')} className="px-2.5 py-1 rounded-full glass border border-border/40">No</button>
                      <button onClick={() => vote(p.id, 'yes')} className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">Yes</button>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
export default GovernanceScreen;
