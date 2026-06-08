// ╔══════════════════════════════════════════════════════════════════╗
// ║  JuryPanel — Community appeal review with real votes (§16)        ║
// ║                                                                  ║
// ║  Empanelled jurors vote overturn/uphold/abstain on flagged       ║
// ║  content. At 5 votes the appeal auto-finalises by majority.      ║
// ║  Every vote persists in `jury_votes`; tally updates in real time.║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { apiGet, apiPost, type JuryAppeal, type JuryVote, type JuryPanelist } from "@/lib/api"
import { Scale, Gavel, Users, Check, X, MinusCircle, Loader2, Sparkles, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

const ME = 2 // current user — Layla is empanelled in seed

export function JuryPanelComp() {
  const [appeals, setAppeals] = useState<JuryAppeal[]>([])
  const [panel, setPanel] = useState<JuryPanelist[]>([])
  const [selected, setSelected] = useState<JuryAppeal | null>(null)
  const [votes, setVotes] = useState<JuryVote[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const [a, p] = await Promise.all([
        apiGet<{ appeals: JuryAppeal[] }>("/jury/appeals"),
        apiGet<{ jurors: JuryPanelist[] }>("/jury/panel"),
      ])
      setAppeals(a.appeals ?? [])
      setPanel(p.jurors ?? [])
    } catch { /* keep prior */ }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  const open = async (a: JuryAppeal) => {
    setSelected(a)
    try {
      const r = await apiGet<{ action: any; votes: JuryVote[] }>(`/jury/appeals/${a.id}`)
      setVotes(r.votes ?? [])
    } catch { setVotes([]) }
  }

  const vote = async (choice: 'overturn'|'uphold'|'abstain') => {
    if (!selected) return
    setBusy(true)
    try {
      const r = await apiPost(`/jury/appeals/${selected.id}/vote`, {
        juror_id: ME, vote: choice, reputation_at_vote: 145,
      })
      toast.success(`Vote recorded: ${choice}`)
      await refresh()
      await open(selected)
    } catch (e: any) {
      toast.error("Vote failed", { description: e?.message })
    } finally { setBusy(false) }
  }

  const isEmpanelled = panel.some((p) => p.juror_id === ME)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gold-stroke grid place-items-center">
          <Scale className="w-4 h-4 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base leading-tight">Community Jury</h3>
          <p className="text-[11px] text-muted-foreground">
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
            Real votes · finalise at 5 · public ledger
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-lg leading-none">{panel.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">jurors</div>
        </div>
      </div>

      {!isEmpanelled && (
        <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldAlert className="w-3 h-3 text-secondary shrink-0" />
          You're not currently empanelled — view-only mode. Empanel from /governance.
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border/40 p-6 text-center text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 mx-auto mb-2 animate-spin" /> Loading…
        </div>
      ) : appeals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 p-6 text-center text-xs text-muted-foreground">
          No open appeals. The system runs clean.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {appeals.map((a) => (
            <button key={a.id} onClick={() => open(a)}
              className={`text-left rounded-2xl border p-3 transition ${
                selected?.id === a.id ? "border-secondary/50 bg-secondary/5" : "border-border/40 hover:bg-muted/40"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {a.content_kind} #{a.content_id}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  a.appeal_status === 'pending' ? 'bg-secondary/15 text-secondary' :
                  a.appeal_status === 'overturned' ? 'bg-primary/15 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>{a.appeal_status ?? "pending"}</span>
              </div>
              <p className="text-xs text-foreground/80 line-clamp-2">{a.reason ?? "No reason logged."}</p>
              <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                <span><Check className="w-2.5 h-2.5 inline mr-0.5" />{a.overturn_count}</span>
                <span><X className="w-2.5 h-2.5 inline mr-0.5" />{a.uphold_count}</span>
                <span><MinusCircle className="w-2.5 h-2.5 inline mr-0.5" />{a.abstain_count}</span>
                <span className="ml-auto font-mono">{a.detector}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">Appeal #{selected.id} · {selected.content_kind}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{selected.reason}</p>

          {isEmpanelled && selected.appeal_status === 'pending' && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['overturn','uphold','abstain'] as const).map((choice) => (
                <button key={choice} onClick={() => vote(choice)} disabled={busy}
                  className={`py-2 rounded-xl text-[11px] font-medium border transition ${
                    choice === 'overturn' ? "border-primary/40 hover:bg-primary/10 text-primary" :
                    choice === 'uphold'   ? "border-destructive/40 hover:bg-destructive/10 text-destructive" :
                                            "border-border/40 hover:bg-muted text-muted-foreground"
                  }`}>
                  {busy ? <Loader2 className="w-3 h-3 mx-auto animate-spin" /> : choice}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Votes cast ({votes.length})
            </p>
            {votes.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">No votes yet — be the first.</div>
            ) : votes.map((v) => (
              <div key={v.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-muted/30">
                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-medium ${
                  v.vote === 'overturn' ? "bg-primary/15 text-primary" :
                  v.vote === 'uphold'   ? "bg-destructive/15 text-destructive" :
                                          "bg-muted text-muted-foreground"
                }`}>{v.vote}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium truncate">{v.display_name ?? v.handle ?? `Juror #${v.juror_id}`}</div>
                  {v.rationale && <p className="text-[10px] text-muted-foreground line-clamp-2">{v.rationale}</p>}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground/70 shrink-0">RT{v.reputation_at_vote}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Roster */}
      <details className="rounded-2xl border border-border/40 p-3">
        <summary className="text-[11px] uppercase tracking-widest text-muted-foreground cursor-pointer flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Active jurors ({panel.length})
        </summary>
        <div className="mt-2 space-y-1">
          {panel.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-xs py-1">
              <span>{p.display_name ?? p.handle ?? `#${p.juror_id}`}</span>
              <span className="text-[10px] text-muted-foreground">{p.cases_heard} cases heard</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

export default JuryPanelComp
