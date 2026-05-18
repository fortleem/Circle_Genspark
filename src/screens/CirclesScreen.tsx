// §10 — The Circle (groups)
import { PageShell, GlassCard, EmptyState } from "@/components/shell/PageShell";
import { Users } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { CircleGroup } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function CirclesScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ circles: CircleGroup[] }>("/circles");
  const circles = data?.circles ?? [];
  return (
    <PageShell
      icon={Users}
      title={names.module_groups}
      arabicTitle="الدائرة"
      section="§10"
      tagline="Public, private, and federated communities you actually want to belong to"
      intro="Unlike feed-driven platforms, The Circle is where you join groups for the long haul. Bylaws, member voting, IPFS-pinned archives, and full data export — no algorithm-driven engagement traps."
    >
      {loading ? (
        <EmptyState message="Loading circles..." />
      ) : circles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {circles.map((c) => (
            <GlassCard key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">@{c.slug}</p>
                  <p className="text-sm mt-2 line-clamp-2">{c.description}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full ${c.mode === "public" ? "bg-secondary/15 text-secondary" : "bg-accent/15 text-accent"}`}>{c.mode}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.member_count.toLocaleString()} members</span>
                <button className="text-secondary hover:underline">Join</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default CirclesScreen;
