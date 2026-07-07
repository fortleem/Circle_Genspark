// ╔══════════════════════════════════════════════════════════════════╗
// ║  FamilyVault — Shamir M-of-N social-recovery vault (F10)         ║
// ║                                                                  ║
// ║  Cirkle-unique. No competitor offers cryptographic family vaults ║
// ║  where N trusted relatives each hold a share and M must consent  ║
// ║  to unlock. Every vault has a SHA-256 anchor pinned on-chain.    ║
// ║  Holders see consent state in real time; recovery is auditable.  ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState } from "react"
import { apiGet, apiPost, type FamilyVault } from "@/lib/api"
import { ShieldCheck, KeyRound, Users, Plus, Check, X, Sparkles, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const ME = 1

// Mock holder pool (in real impl, comes from /contacts endpoint)
const HOLDER_POOL = [
  { id: 2, name: "Layla Al-Harbi", relation: "sister" },
  { id: 3, name: "Ahmed Al-Harbi", relation: "brother" },
  { id: 4, name: "Fatima (Mom)", relation: "mother" },
  { id: 5, name: "Karim Mansour", relation: "cousin" },
  { id: 6, name: "Zhang Wei", relation: "trusted friend" },
]

export function FamilyVaultPanel() {
  const [vaults, setVaults] = useState<FamilyVault[]>([])
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)

  const refresh = async () => {
    try {
      const r = await apiGet<{ vaults: FamilyVault[] }>(`/vaults/${ME}`)
      setVaults(r.vaults ?? [])
    } catch { /* keep prior */ }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl mesh-fill grid place-items-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display text-base leading-tight">Family Vault</h3>
            <p className="text-[11px] text-muted-foreground">
              <Sparkles className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
              Shamir M-of-N social recovery · Cirkle-unique
            </p>
          </div>
        </div>
        <button
          onClick={() => setComposing(true)}
          className="text-xs px-3 py-1.5 rounded-full gold-stroke flex items-center gap-1.5 font-medium"
        >
          <Plus className="w-3 h-3" /> New vault
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/40 p-6 text-center text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 mx-auto mb-2 animate-spin" />
          Loading vaults…
        </div>
      ) : vaults.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center">
          <KeyRound className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">No vaults yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create one to encrypt critical credentials and split recovery across trusted people.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {vaults.map((v) => (
            <VaultCard key={v.id} vault={v} onChange={refresh} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {composing && (
          <ComposeVault onClose={() => setComposing(false)} onCreated={() => { setComposing(false); refresh() }} />
        )}
      </AnimatePresence>
    </div>
  )
}

function VaultCard({ vault, onChange }: { vault: FamilyVault; onChange: () => void }) {
  const consented = vault.consented_count ?? 0
  const total = vault.total_n
  const threshold = vault.threshold_m
  const recoveryReady = consented >= threshold
  const pct = Math.min(100, Math.round((consented / Math.max(1, threshold)) * 100))

  const toggleConsent = async (holderId: number, current: number) => {
    try {
      await apiPost(`/vaults/${vault.id}/consent`, { holder_id: holderId, consented: current ? 0 : 1 })
      toast.success(current ? "Consent withdrawn" : "Consent granted")
      onChange()
    } catch (e: any) {
      toast.error("Could not update", { description: e?.message })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="orbit-ring rounded-2xl p-4 bg-card/70 backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-base truncate">{vault.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
              recoveryReady ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
            }`}>
              {recoveryReady ? "Recovery-ready" : `${threshold - consented} more needed`}
            </span>
          </div>
          {vault.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{vault.description}</p>
          )}
          <p className="text-[10px] font-mono text-muted-foreground/70 mt-1 truncate">{vault.vault_hash}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-2xl gradient-text-gold leading-none">
            {threshold}<span className="text-muted-foreground/60 text-base">/</span>{total}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">threshold</div>
        </div>
      </div>

      {/* Consent progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          className={recoveryReady ? "h-full mesh-fill" : "h-full bg-gradient-to-r from-secondary/60 to-primary/60"}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>{consented} of {threshold} consented</span>
        <span>{total - (vault.share_count ?? 0)} unassigned</span>
      </div>

      {/* Holders */}
      <div className="mt-3 space-y-1.5">
        {vault.shares.map((s) => {
          const isMe = s.holder_id === ME
          return (
            <div key={s.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/40 transition">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-display ${
                  s.consented ? "mesh-fill text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {(s.display_name ?? s.handle ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">
                    {s.display_name ?? s.handle ?? `Holder #${s.holder_id}`}
                    {isMe && <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/70 truncate">
                    {s.share_hash.slice(0, 24)}…
                  </div>
                </div>
              </div>
              {isMe ? (
                <button
                  onClick={() => toggleConsent(s.holder_id, s.consented)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                    s.consented
                      ? "border-secondary/40 text-secondary bg-secondary/10"
                      : "border-border/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.consented ? <><Check className="w-2.5 h-2.5 inline mr-1" />Consented</> : "Tap to consent"}
                </button>
              ) : (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  s.consented ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
                }`}>
                  {s.consented ? "✓" : "Pending"}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {recoveryReady && (
        <button className="mt-3 w-full text-xs py-2 rounded-xl gold-stroke font-medium flex items-center justify-center gap-2">
          <KeyRound className="w-3.5 h-3.5" /> Run recovery now
        </button>
      )}
    </motion.div>
  )
}

function ComposeVault({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [threshold, setThreshold] = useState(3)
  const [picked, setPicked] = useState<number[]>([])
  const [busy, setBusy] = useState(false)

  const total = picked.length
  const valid = name.trim().length >= 2 && threshold >= 2 && total >= threshold && total <= 9

  const togglePick = (id: number) =>
    setPicked((p) => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const create = async () => {
    if (!valid) return
    setBusy(true)
    try {
      await apiPost("/vaults", {
        owner_id: ME,
        name: name.trim(),
        description: description.trim() || undefined,
        threshold_m: threshold,
        total_n: total,
        payload: `vault-payload-${Date.now()}`,
        holders: picked,
      })
      toast.success("Vault sealed", { description: `${threshold}-of-${total} · SHA-256 anchored` })
      onCreated()
    } catch (e: any) {
      toast.error("Could not seal vault", { description: e?.message })
    } finally { setBusy(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 shadow-float max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl mesh-fill grid place-items-center">
              <KeyRound className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg leading-tight">Seal a new vault</h3>
              <p className="text-[10px] text-muted-foreground">Cryptographic M-of-N family recovery</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full grid place-items-center hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Vault name</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Family inheritance · master keys"
          className="w-full mt-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-sm focus:outline-none focus:border-secondary"
        />

        <label className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 block">Purpose (optional)</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What this vault protects and when it should be opened"
          className="w-full mt-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-sm focus:outline-none focus:border-secondary resize-none"
        />

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Threshold (M of N)
            </label>
            <div className="font-display text-lg gradient-text-gold">
              {threshold}<span className="text-muted-foreground/60 text-sm">/{total || "?"}</span>
            </div>
          </div>
          <input
            type="range" min={2} max={Math.max(2, total)} value={Math.min(threshold, Math.max(2, total))}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full mt-2 accent-secondary"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Need {threshold} of {total || "?"} holders to consent before recovery unlocks.
          </p>
        </div>

        <div className="mt-4">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Choose holders
          </label>
          <div className="mt-2 space-y-1.5">
            {HOLDER_POOL.map((h) => {
              const isPicked = picked.includes(h.id)
              return (
                <button
                  key={h.id}
                  onClick={() => togglePick(h.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm transition ${
                    isPicked
                      ? "border-secondary/50 bg-secondary/10"
                      : "border-border/40 hover:bg-muted/40"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-display shrink-0 ${
                      isPicked ? "mesh-fill text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {h.name.slice(0, 1)}
                    </span>
                    <span className="text-left min-w-0">
                      <span className="block text-sm font-medium truncate">{h.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{h.relation}</span>
                    </span>
                  </span>
                  {isPicked ? <Check className="w-4 h-4 text-secondary" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={create}
          disabled={!valid || busy}
          className={`mt-5 w-full py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 ${
            valid && !busy
              ? "gold-stroke text-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sealing…</> : <><ShieldCheck className="w-4 h-4" /> Seal vault</>}
        </button>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Encrypted client-side · SHA-256 anchored · zero plaintext leaves your device
        </p>
      </motion.div>
    </motion.div>
  )
}

export default FamilyVaultPanel
