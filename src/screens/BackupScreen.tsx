// §27 — Backup & Recovery
import { PageShell, GlassCard, SectionHeader, StatTile, EmptyState } from "@/components/shell/PageShell";
import { ArchiveRestore, Server, Cloud, HardDrive } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useApp } from "@/providers/AppProvider";

export function BackupScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ backups: any[] }>("/backup/1");
  const backups = data?.backups ?? [];
  return (
    <PageShell
      icon={ArchiveRestore}
      title={names.module_backup}
      arabicTitle="النسخ الاحتياطي"
      section="§27"
      tagline="Your data, your backups — encrypted, federated, recoverable from anywhere"
      intro="Circle Backup creates encrypted snapshots of your full state (Wasl, Lamahat, Mail, Pay, ID, Contacts) and distributes them across IPFS, your own server, or trusted peer-mesh nodes. Restore on any new device with your Circle ID."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Last backup" value="2h ago" hint="auto-daily" />
        <StatTile label="Size" value="312 MB" hint="encrypted" />
        <StatTile label="Locations" value="3" hint="IPFS+peer+self" />
        <StatTile label="Recovery" value="3-of-5" hint="Shamir" />
      </div>

      <SectionHeader title="Backup destinations" />
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: Cloud,     t: "IPFS pinning",          d: "Distributed storage across federated nodes" },
          { icon: Server,    t: "Self-hosted",           d: "Your own Circle node or NAS" },
          { icon: HardDrive, t: "Local + peer mesh",     d: "Encrypted shards across trusted peers" },
        ].map((d) => (
          <GlassCard key={d.t}>
            <d.icon className="w-5 h-5 text-secondary mb-2" />
            <h3 className="font-medium text-sm">{d.t}</h3>
            <p className="text-xs text-muted-foreground mt-1">{d.d}</p>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Backup history" hint={`${backups.length} snapshots`} />
      {loading ? <EmptyState message="Loading..." /> : backups.length === 0 ? <EmptyState /> : (
        <div className="space-y-2">
          {backups.map((b: any) => (
            <GlassCard key={b.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{b.snapshot_name ?? b.kind ?? `Snapshot #${b.id}`}</p>
                  <p className="text-xs text-muted-foreground">{b.size_mb ?? "—"} MB · {new Date(b.created_at ?? Date.now()).toLocaleString()}</p>
                </div>
                <button className="text-xs px-3 py-1 rounded-full glass border border-border/40">Restore</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
export default BackupScreen;
