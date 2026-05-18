// §11 + §13 — Official Channels & Creator Channels
import { PageShell, GlassCard, EmptyState } from "@/components/shell/PageShell";
import { Radio, BadgeCheck } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { Channel } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";
import { useState } from "react";

export function ChannelsScreen() {
  const { names } = useApp();
  const [filter, setFilter] = useState<"all" | "official" | "creator">("all");
  const { data, loading } = useApi<{ channels: Channel[] }>("/channels");
  const channels = (data?.channels ?? []).filter(c => filter === "all" ? true : c.channel_type === filter);
  return (
    <PageShell
      icon={Radio}
      title={names.module_official}
      arabicTitle="القنوات"
      section="§11 + §13"
      tagline="Verified institutions + independent creators, broadcasting without intermediaries"
      intro="Official channels are cryptographically verified government, NGO, and brand accounts. Creator channels are independent voices. Both publish via IPFS and federate through Matrix — no platform gatekeeping."
      actions={
        <div className="flex gap-1 text-xs">
          {(["all", "official", "creator"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full border ${filter === f ? "bg-secondary text-secondary-foreground border-secondary" : "glass border-border/40"}`}>
              {f}
            </button>
          ))}
        </div>
      }
    >
      {loading ? <EmptyState message="Loading channels..." /> : channels.length === 0 ? <EmptyState /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {channels.map((ch) => (
            <GlassCard key={ch.id}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-base truncate">{ch.name}</h3>
                    {ch.verified_at && <BadgeCheck className="w-3.5 h-3.5 text-secondary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">@{ch.slug} · {ch.category ?? "general"} · {ch.country ?? "—"}</p>
                  <p className="text-sm mt-2 line-clamp-2">{ch.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{ch.subscriber_count.toLocaleString()} subs</span>
                    <button className="text-secondary hover:underline">Follow</button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default ChannelsScreen;
