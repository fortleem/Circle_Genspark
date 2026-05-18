// §30 — Transparency / Ledger
import { PageShell, GlassCard, EmptyState, SectionHeader, StatTile } from "@/components/shell/PageShell";
import { BarChart3 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { LedgerRow } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export function TransparencyScreen() {
  const { names } = useApp();
  const { data, loading } = useApi<{ ledger: LedgerRow[] }>("/transparency/ledger");
  const rows = data?.ledger ?? [];
  const total = rows.reduce((a, r) => a + r.amount_usd, 0);
  return (
    <PageShell
      icon={BarChart3}
      title={names.nav_transparency}
      arabicTitle="الشفافية"
      section="§30"
      tagline="Every dollar in, every dollar out — published monthly"
      intro="Circle publishes a full revenue & expenditure ledger each month. Ads, premium subscriptions, federated node fees — all sources and allocations are publicly auditable."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Total ledger" value={`$${total.toLocaleString()}`} hint="all-time" />
        <StatTile label="Entries" value={rows.length.toString()} />
        <StatTile label="Sources" value={new Set(rows.map(r=>r.source)).size.toString()} />
        <StatTile label="Months" value={new Set(rows.map(r=>r.month)).size.toString()} />
      </div>

      <SectionHeader title="Ledger" />
      {loading ? <EmptyState message="Loading ledger..." /> : rows.length === 0 ? <EmptyState /> : (
        <GlassCard className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left py-2 px-2">Month</th>
                <th className="text-left py-2 px-2">Source</th>
                <th className="text-right py-2 px-2">Amount</th>
                <th className="text-left py-2 px-2">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/30">
                  <td className="py-2 px-2 font-mono text-xs">{r.month}</td>
                  <td className="py-2 px-2">{r.source}</td>
                  <td className="py-2 px-2 text-right font-mono">${r.amount_usd.toLocaleString()}</td>
                  <td className="py-2 px-2 text-muted-foreground">{r.allocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </PageShell>
  );
}
export default TransparencyScreen;
