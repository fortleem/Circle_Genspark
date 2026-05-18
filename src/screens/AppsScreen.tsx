// §25 — Mini Apps
import { PageShell, GlassCard, EmptyState, SectionHeader } from "@/components/shell/PageShell";
import { Grid3X3 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { MiniApp } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function AppsScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ apps: MiniApp[] }>("/apps");
  const apps = data?.apps ?? [];
  return (
    <PageShell
      icon={Grid3X3}
      title={names.nav_apps}
      arabicTitle="التطبيقات المصغّرة"
      section="§25"
      tagline="Sandboxed third-party apps, with permissions you control"
      intro="Mini Apps run in a deno-style WASM sandbox with explicit per-permission grants (contacts, location, mail). Developers publish via IPFS, install counts are public, and any app can be self-hosted."
    >
      <SectionHeader title="Featured" hint={`${apps.length} apps`} />
      {loading ? <EmptyState message="Loading apps..." /> : apps.length === 0 ? <EmptyState /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {apps.map((a) => (
            <GlassCard key={a.id} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-secondary/30 to-primary/20 border border-secondary/30 flex items-center justify-center mb-3">
                <span className="font-display text-2xl">{a.name.charAt(0)}</span>
              </div>
              <h3 className="font-display text-sm truncate">{a.name}</h3>
              <p className="text-[10px] text-muted-foreground">{a.category}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{a.install_count.toLocaleString()} installs</p>
              <button className="mt-2 w-full px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px]">Install</button>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default AppsScreen;
