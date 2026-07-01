// — Governance: DAO voting, live town halls, proposal creation, delegation
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote, Plus, Users, Clock, TrendingUp, MessageCircle, Mic, Video,
  AlertCircle, CheckCircle2, XCircle, Timer, Gavel, Scale, Crown, Shield
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiPost, type Proposal } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";
import { ReputationLedger } from "@/components/futuristic/ReputationLedger";

const TOWN_HALLS = [
  { id: 1, title: "Community Standards v3.0", status: "live", attendees: 234, speakers: 3, startedAt: "12 min ago" },
  { id: 2, title: "Payment Fee Structure Review", status: "scheduled", attendees: 0, speakers: 0, startedAt: "Tomorrow 7 PM" },
  { id: 3, title: "AI Safety Guardrails Update", status: "ended", attendees: 512, speakers: 8, startedAt: "Yesterday" },
];

const DELEGATES = [
  { id: 1, name: "Fatima Al-Zahra", handle: "@fatima", power: 1240, avatar: "F", specialty: "Privacy" },
  { id: 2, name: "Omar Hassan", handle: "@omar_h", power: 890, avatar: "O", specialty: "Finance" },
  { id: 3, name: "Nour El-Din", handle: "@nour", power: 670, avatar: "N", specialty: "Content" },
];

export function GovernanceScreen() {
  const { names } = useApp();
  const { data, loading, refetch } = useApi<{ proposals: Proposal[] }>("/governance/proposals");
  const proposals = data?.proposals ?? [];
  const [tab, setTab] = useState<'proposals' | 'townhall' | 'delegates'>('proposals');
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const vote = async (id: number, choice: 'yes' | 'no') => {
    try { await apiPost(`/governance/proposals/${id}/vote`, { choice }); refetch(); }
    catch (e) { console.error(e); }
  };

  const submitProposal = () => {
    if (newTitle && newDesc) {
      setShowNewProposal(false);
      setNewTitle("");
      setNewDesc("");
      // In real app, this would POST to API
    }
  };

  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-3xl">Governance</h1>
        <p className="text-sm text-muted-foreground mt-1">Community-governed · Every user holds a vote</p>
      </div>

      {/* Governance stats */}
      <div className="grid grid-cols-4 gap-2 px-4 mt-4">
        {[
          { v: "12", l: "Active", icon: Vote },
          { v: "847", l: "Voters", icon: Users },
          { v: "34", l: "Passed", icon: CheckCircle2 },
          { v: "2.4K", l: "Your power", icon: Crown },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-2.5 text-center">
            <s.icon className="w-4 h-4 mx-auto text-secondary" />
            <div className="font-display text-lg mt-1">{s.v}</div>
            <div className="text-[9px] text-muted-foreground uppercase">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 px-4 mt-4 overflow-x-auto scrollbar-hide">
        {(['proposals', 'townhall', 'delegates'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap ${
              tab === t ? 'bg-secondary text-secondary-foreground' : 'glass'
            }`}>
            {t === 'proposals' && '📋 Proposals'}
            {t === 'townhall' && '🎤 Town Halls'}
            {t === 'delegates' && '👥 Delegates'}
          </button>
        ))}
      </div>

      {/* Reputation Ledger */}
      <div className="px-4 mt-4">
        <ReputationLedger />
      </div>

      <AnimatePresence mode="wait">
        {tab === 'proposals' && (
          <motion.div key="proposals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">Active Proposals</h3>
              <button onClick={() => setShowNewProposal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            {/* New proposal modal */}
            <AnimatePresence>
              {showNewProposal && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4">
                  <div className="glass rounded-2xl p-4 border border-secondary/30">
                    <h4 className="font-medium text-sm mb-3">Create Proposal</h4>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                      placeholder="Proposal title"
                      className="w-full bg-background border border-border/40 rounded-lg px-3 py-2 text-sm mb-2" />
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                      placeholder="Describe your proposal in detail..."
                      className="w-full bg-background border border-border/40 rounded-lg px-3 py-2 text-sm min-h-[80px] mb-3" />
                    <div className="flex gap-2">
                      <button onClick={submitProposal} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs">Submit</button>
                      <button onClick={() => setShowNewProposal(false)} className="px-4 py-2 rounded-full glass text-xs">Cancel</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="glass rounded-2xl p-6 text-center text-muted-foreground">Loading proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center text-muted-foreground">No active proposals</div>
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => {
                  const total = p.votes_yes + p.votes_no;
                  const yesPct = total > 0 ? Math.round((p.votes_yes / total) * 100) : 50;
                  const quorum = Math.min(total / 100, 1); // assume 100 needed for quorum
                  return (
                    <div key={p.id} className="glass rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-base">{p.title}</h3>
                            <span className={`px-2 py-0.5 text-[9px] rounded-full ${
                              p.status === "active" ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
                            }`}>{p.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                        </div>
                      </div>

                      {/* Vote bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-emerald-500">Yes {p.votes_yes}</span>
                          <span className="text-muted-foreground">{total} total votes</span>
                          <span className="text-red-400">No {p.votes_no}</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                          <div className="h-full bg-emerald-500/80" style={{ width: `${yesPct}%` }} />
                          <div className="h-full bg-red-400/80" style={{ width: `${100 - yesPct}%` }} />
                        </div>
                        {/* Quorum indicator */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-secondary/60" style={{ width: `${quorum * 100}%` }} />
                          </div>
                          <span className="text-[9px] text-muted-foreground">{Math.round(quorum * 100)}% quorum</span>
                        </div>
                      </div>

                      {/* Vote buttons */}
                      {p.status === "active" && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => vote(p.id, 'yes')}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-medium hover:bg-emerald-500/20 transition">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Vote Yes
                          </button>
                          <button onClick={() => vote(p.id, 'no')}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition">
                            <XCircle className="w-3.5 h-3.5" /> Vote No
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'townhall' && (
          <motion.div key="townhall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mt-4">
            <h3 className="font-display text-lg mb-3">Town Halls</h3>
            <div className="space-y-3">
              {TOWN_HALLS.map(th => (
                <div key={th.id} className={`glass rounded-2xl p-4 ${th.status === 'live' ? 'border border-red-500/30' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {th.status === 'live' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                          </span>
                        )}
                        <h4 className="font-medium text-sm">{th.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {th.status !== 'scheduled' && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {th.attendees}</span>}
                        <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> {th.speakers} speakers</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {th.startedAt}</span>
                      </div>
                    </div>
                    <button className={`px-3 py-1.5 rounded-full text-xs ${
                      th.status === 'live' ? 'bg-red-500 text-white' :
                      th.status === 'scheduled' ? 'bg-secondary text-secondary-foreground' : 'glass'
                    }`}>
                      {th.status === 'live' ? 'Join' : th.status === 'scheduled' ? 'Remind me' : 'Recording'}
                    </button>
                  </div>
                  {th.status === 'live' && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {['F', 'O', 'N', '+'].map((a, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-[9px] text-white border-2 border-background">
                            {a}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">234 listening · Fatima speaking</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'delegates' && (
          <motion.div key="delegates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mt-4">
            <div className="glass rounded-2xl p-4 mb-4 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-secondary" />
                <h4 className="font-medium text-sm">Liquid Democracy</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Delegate your voting power to trusted experts. You can revoke delegation at any time or override on specific proposals.
              </p>
            </div>

            <h3 className="font-display text-lg mb-3">Top Delegates</h3>
            <div className="space-y-2">
              {DELEGATES.map(d => (
                <div key={d.id} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-display">
                    {d.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.handle} · {d.specialty} expert</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-display">{d.power.toLocaleString()}</div>
                    <div className="text-[9px] text-muted-foreground">voting power</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-[10px]">Delegate</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default GovernanceScreen;
