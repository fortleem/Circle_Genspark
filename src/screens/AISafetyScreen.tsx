// — AI Safety & Moderation. Prototype design language.
// Covers On-device first, Auditable actions, Appeals, Community review.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Cpu, AlertTriangle, Scale, Eye, Search, FileSearch,
  CheckCircle2, Filter,
} from "lucide-react";
import { apiGet, type ModAction } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

type ActionFilter = "all" | "remove" | "warn" | "shadow" | "flag";

export function AISafetyScreen() {
  const [actions, setActions] = useState<ModAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActionFilter>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    apiGet<{ actions: ModAction[] }>("/moderation/actions")
      .then((d) => setActions(d.actions ?? []))
      .catch(() => setActions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      if (q && !a.reason.toLowerCase().includes(q.toLowerCase()) && !a.target_id.toString().includes(q)) return false;
      if (filter === "all") return true;
      return a.action.toLowerCase().includes(filter);
    });
  }, [actions, filter, q]);

  const onDevicePct = useMemo(() => {
    if (!actions.length) return 0;
    const local = actions.filter(a => a.model_used && (a.model_used.toLowerCase().includes("local") || a.model_used.toLowerCase().includes("on-device") || a.model_used.toLowerCase().includes("phi") || a.model_used.toLowerCase().includes("tiny"))).length;
    return Math.round((local / actions.length) * 100);
  }, [actions]);

  const actionColor = (a: string) => {
    const lower = a.toLowerCase();
    if (lower.includes("remove") || lower.includes("delete")) return "text-accent bg-accent/10";
    if (lower.includes("warn")) return "text-amber-600 bg-amber-500/10";
    if (lower.includes("shadow") || lower.includes("limit")) return "text-orange-600 bg-orange-500/10";
    return "text-secondary bg-secondary/10";
  };

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="AI Safety"
        arabic="الأمان"
        section=""
        tagline="On-device first · every action audited · appeals in 24h"
        right={
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/15 transition">
            <Eye className="w-4 h-4 text-secondary" />
          </button>
        }
      />

      {/* Stat tiles */}
      <div className="px-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { l: "Actions / 24h", v: actions.length.toString(), i: ShieldCheck },
          { l: "On-device", v: onDevicePct ? `${onDevicePct}%` : "—", i: Cpu, hint: "run locally" },
          { l: "False-positive", v: "2.1%", i: AlertTriangle, hint: "overridden" },
          { l: "Median appeal", v: "<24h", i: Scale },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <s.i className="w-3 h-3 text-secondary" />
              {s.l}
            </div>
            <div className="font-display text-2xl mt-1">{s.v}</div>
            {s.hint && <div className="text-[10px] text-muted-foreground">{s.hint}</div>}
          </div>
        ))}
      </div>

      {/* Pillars row */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          — Four pillars of safe moderation
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { i: Cpu, l: "On-device first", s: "Privacy by default" },
            { i: FileSearch, l: "Auditable", s: "Model + confidence shown" },
            { i: Scale, l: "Appealable", s: "<24h human review" },
            { i: ShieldCheck, l: "Community", s: "Override committee" },
          ].map((p) => (
            <div key={p.l} className="rounded-2xl border border-border bg-card p-3 hover:shadow-soft transition">
              <p.i className="w-4 h-4 text-secondary mb-1.5" />
              <div className="text-xs font-medium">{p.l}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{p.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-5">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
            placeholder="Search by reason or target ID"
          />
          <Filter className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* Action filter pills */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {([
          { k: "all", l: "All actions" },
          { k: "remove", l: "Removed" },
          { k: "warn", l: "Warnings" },
          { k: "shadow", l: "Limited reach" },
          { k: "flag", l: "Flagged" },
        ] as { k: ActionFilter; l: string }[]).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              filter === f.k ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Audit log */}
      <section className="px-5">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-mono"></span>
          <h2 className="font-display text-lg">Recent moderation actions</h2>
        </div>
        <p className="-mt-1 mb-3 text-[11px] text-muted-foreground">
          Every action shows the model, confidence, and a public reason
        </p>

        {loading ? (
          <div className="py-8 text-sm text-muted-foreground text-center">Loading audit log…</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground text-center">No actions match this filter.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border bg-card p-3 hover:shadow-float transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${actionColor(a.action)}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-medium ${actionColor(a.action)}`}>
                        {a.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        on <span className="font-medium text-foreground">{a.target_type}</span>
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">#{a.target_id}</span>
                    </div>
                    <p className="text-sm text-foreground/85 mt-1">{a.reason}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1.5 flex-wrap">
                      {a.model_used && (
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          <span className="font-mono">{a.model_used}</span>
                        </span>
                      )}
                      {a.confidence !== undefined && a.confidence !== null && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {(a.confidence * 100).toFixed(0)}% confidence
                        </span>
                      )}
                      <span className="ms-auto">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* + Appeal flow */}
      <div className="px-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4">
          <Scale className="w-5 h-5 text-secondary mb-2" />
          <div className="font-medium text-sm">Appeal an action</div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Every action can be appealed. Median resolution under 24 hours. Appeals route to a human
            reviewer, never the same model that flagged it.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <ShieldCheck className="w-5 h-5 text-primary mb-2" />
          <div className="font-medium text-sm">Community oversight</div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Rotating review committee can override automated decisions, retrain models, and publish
            quarterly accuracy reports — all on the public ledger.
          </p>
        </div>
      </div>

      <ProtoFooter section="" title="Transparent moderation">
        No black-box bans. Every action explains itself — which model fired, how confident, and what rule
        was applied. Appeals reach a human in &lt;24h. Community committees can override the AI, and
        accuracy reports are published every quarter.
      </ProtoFooter>
    </div>
  );
}

export default AISafetyScreen;
