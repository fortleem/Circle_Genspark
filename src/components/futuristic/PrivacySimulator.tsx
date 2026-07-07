// ╔══════════════════════════════════════════════════════════════════╗
// ║  PrivacySimulator — "What can X see?" (F15)                      ║
// ║                                                                  ║
// ║  Cirkle-unique. Every other platform shows what YOU control —    ║
// ║  Cirkle shows what OTHERS see. Pick a viewer kind (stranger,     ║
// ║  friend, employer, advertiser, state authority), and we render   ║
// ║  the exact surface they would see, with a 0-100 visibility score ║
// ║  and prescriptive recommendations. Auditable; every run logged.  ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { apiGet, apiPost, type PrivacySimRun, type PrivacySimSummary } from "@/lib/api"
import {
  Eye, EyeOff, ShieldAlert, ShieldCheck, Users, Briefcase, BarChart3, Landmark, UserX,
  Sparkles, Loader2, ChevronRight, History,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const ME = 1

type ViewerKind = "stranger" | "friend" | "employer" | "advertiser" | "state"

const VIEWERS: { key: ViewerKind; label: string; sub: string; Icon: any }[] = [
  { key: "stranger",   label: "Stranger",        sub: "Random Cirkle user",         Icon: UserX },
  { key: "friend",     label: "Friend",          sub: "In your inner cirkle",       Icon: Users },
  { key: "employer",   label: "Employer",        sub: "Recruiter or HR system",     Icon: Briefcase },
  { key: "advertiser", label: "Advertiser",      sub: "Ad-tech bidder",             Icon: BarChart3 },
  { key: "state",      label: "State authority", sub: "DRE-compliant request",      Icon: Landmark },
]

type SimResult = { id: number; viewer_kind: string; score: number; fields: string[]; recommendations: string[] }

export function PrivacySimulator() {
  const [picked, setPicked] = useState<ViewerKind>("stranger")
  const [result, setResult] = useState<SimResult | null>(null)
  const [history, setHistory] = useState<PrivacySimRun[]>([])
  const [summary, setSummary] = useState<PrivacySimSummary | null>(null)
  const [busy, setBusy] = useState(false)
  const [loadingHist, setLoadingHist] = useState(true)

  const loadHistory = async () => {
    try {
      const r = await apiGet<{ runs: PrivacySimRun[]; summary: PrivacySimSummary }>(`/privacy/sim/${ME}`)
      setHistory(r.runs ?? [])
      setSummary(r.summary ?? null)
    } catch { /* ignore */ }
    finally { setLoadingHist(false) }
  }
  useEffect(() => { loadHistory() }, [])

  const run = async () => {
    setBusy(true)
    try {
      const r = await apiPost<SimResult & { ok: boolean }>(`/privacy/sim`, { user_id: ME, viewer_kind: picked })
      setResult({
        id: r.id, viewer_kind: r.viewer_kind, score: r.score,
        fields: r.fields ?? [],
        recommendations: r.recommendations ?? [],
      })
      loadHistory()
    } catch (e: any) {
      toast.error("Sim failed", { description: e?.message })
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl anon-veil grid place-items-center">
          <Eye className="w-4 h-4 text-foreground" />
        </div>
        <div>
          <h3 className="font-display text-base leading-tight">Privacy Simulator</h3>
          <p className="text-[11px] text-muted-foreground">
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
            See what each viewer kind actually sees · Cirkle-unique
          </p>
        </div>
      </div>

      {/* Summary stats */}
      {summary && summary.runs_count > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Avg visible" value={`${summary.avg_visible}`} suffix="/100" tone={summary.avg_visible < 30 ? "good" : summary.avg_visible < 60 ? "warn" : "bad"} />
          <Stat label="Most private" value={`${summary.most_private}`} suffix="/100" tone="good" />
          <Stat label="Most exposed" value={`${summary.least_private}`} suffix="/100" tone={summary.least_private < 30 ? "good" : summary.least_private < 60 ? "warn" : "bad"} />
        </div>
      )}

      {/* Viewer picker */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {VIEWERS.map((v) => {
          const active = picked === v.key
          return (
            <button key={v.key} onClick={() => setPicked(v.key)}
              className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-left transition ${
                active ? "anon-veil border-border bg-card/80" : "border-border/40 hover:bg-muted/40"
              }`}>
              <v.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? "text-secondary" : "text-muted-foreground"}`} />
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{v.label}</div>
                <div className="text-[10px] text-muted-foreground truncate">{v.sub}</div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={run} disabled={busy}
        className={`w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 ${
          busy ? "bg-muted text-muted-foreground" : "gold-stroke"
        }`}
      >
        {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Simulating…</> : <><Eye className="w-4 h-4" /> Run simulation</>}
      </button>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur p-4"
          >
            <ResultHeader score={result.score} viewer={result.viewer_kind} />

            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">What they can see</p>
              <div className="flex flex-wrap gap-1.5">
                {result.fields.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Nothing personal · only the @handle envelope</span>
                ) : (
                  result.fields.map((f) => (
                    <span key={f} className="px-2 py-1 rounded-md bg-muted text-[10px] font-mono">{f}</span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Recommendations
              </p>
              <ul className="space-y-1.5">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-secondary shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {!loadingHist && history.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
            <History className="w-3 h-3" /> Recent runs
          </p>
          <div className="rounded-2xl bg-card/60 border border-border/40 divide-y divide-border/30 overflow-hidden">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="px-3 py-2 flex items-center justify-between gap-3 text-xs">
                <span className="capitalize font-medium">{h.viewer_kind}</span>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(h.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={`font-display ${
                  h.visible_score < 30 ? "text-secondary" : h.visible_score < 60 ? "text-foreground" : "text-destructive"
                }`}>
                  {h.visible_score}<span className="text-muted-foreground/60 text-[10px]">/100</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultHeader({ score, viewer }: { score: number; viewer: string }) {
  const tone = score < 30 ? "good" : score < 60 ? "warn" : "bad"
  const Icon = tone === "good" ? ShieldCheck : tone === "warn" ? ShieldAlert : EyeOff
  const label = tone === "good" ? "Private" : tone === "warn" ? "Moderate" : "Exposed"
  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-2xl grid place-items-center ${
        tone === "good" ? "bg-secondary/20 text-secondary" :
        tone === "warn" ? "bg-primary/20 text-primary" :
        "bg-destructive/15 text-destructive"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{viewer} sees</div>
        <div className="flex items-baseline gap-2">
          <div className="font-display text-3xl leading-none">{score}<span className="text-muted-foreground/60 text-base">/100</span></div>
          <span className={`text-xs font-medium ${
            tone === "good" ? "text-secondary" :
            tone === "warn" ? "text-foreground" :
            "text-destructive"
          }`}>{label}</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.7 }}
            className={`h-full ${
              tone === "good" ? "bg-secondary" : tone === "warn" ? "bg-primary" : "bg-destructive"
            }`}
          />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, suffix, tone }: { label: string; value: string; suffix?: string; tone: "good" | "warn" | "bad" }) {
  const color = tone === "good" ? "text-secondary" : tone === "warn" ? "text-foreground" : "text-destructive"
  return (
    <div className="rounded-2xl border border-border/40 p-3 text-center bg-card/60">
      <div className={`font-display text-xl ${color} leading-none`}>
        {value}<span className="text-muted-foreground/60 text-xs">{suffix}</span>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

export default PrivacySimulator
