// §14 — Professional Network. Prototype design language.
// Covers §14 jobs board, profile verification via Circle ID, regional matching,
// no surveillance / no pay-to-play ranking.
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, MapPin, Search, Sparkles, Plus, BadgeCheck, Globe2, Users,
  ShieldCheck, ExternalLink, Building2,
} from "lucide-react";
import { apiGet, type Job, type ProProfile } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

type Tab = "jobs" | "people";

export function ProScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<ProProfile[]>([]);
  const [tab, setTab] = useState<Tab>("jobs");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<{ jobs: Job[] }>("/pro/jobs"),
      apiGet<{ profiles: ProProfile[] }>("/pro/profiles"),
    ])
      .then(([j, p]) => {
        setJobs(j.jobs ?? []);
        setProfiles(p.profiles ?? []);
      })
      .catch(() => { setJobs([]); setProfiles([]); })
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((j) => {
        if (remoteOnly && !j.remote) return false;
        if (q) {
          const s = q.toLowerCase();
          return (
            j.title.toLowerCase().includes(s) ||
            j.company.toLowerCase().includes(s) ||
            (j.city ?? "").toLowerCase().includes(s)
          );
        }
        return true;
      }),
    [jobs, q, remoteOnly]
  );

  const filteredProfiles = useMemo(
    () =>
      profiles.filter((p) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return (
          p.display_name.toLowerCase().includes(s) ||
          (p.headline ?? "").toLowerCase().includes(s) ||
          (p.skills ?? "").toLowerCase().includes(s)
        );
      }),
    [profiles, q]
  );

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Pro"
        arabic="الشبكة المهنية"
        section="§14"
        tagline="Hire & be hired — no surveillance, no pay-to-play"
        right={
          <button className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      {/* Stats */}
      <div className="px-5 grid grid-cols-2 gap-2">
        <div className="glass rounded-2xl p-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-secondary" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Open roles</div>
            <div className="font-display text-lg leading-none">{jobs.length}</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-secondary" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Profiles</div>
            <div className="font-display text-lg leading-none">{profiles.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {([
          { k: "jobs", l: "Jobs" },
          { k: "people", l: "People" },
        ] as { k: Tab; l: string }[]).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              tab === t.k ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {t.l}
          </button>
        ))}
        {tab === "jobs" && (
          <button
            onClick={() => setRemoteOnly((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              remoteOnly ? "bg-secondary text-secondary-foreground" : "glass"
            }`}
          >
            <Globe2 className="inline w-3 h-3 -mt-0.5 me-1" /> Remote only
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-5">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
            placeholder={tab === "jobs" ? "Search title, company, city" : "Search skill, name, headline"}
          />
          <Sparkles className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {loading ? (
        <div className="px-5 py-10 text-sm text-muted-foreground text-center">Loading…</div>
      ) : tab === "jobs" ? (
        <ul className="space-y-3 px-3">
          {filteredJobs.length === 0 ? (
            <li className="text-sm text-muted-foreground text-center py-8">No jobs match these filters</li>
          ) : filteredJobs.map((j, i) => (
            <motion.li key={j.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="rounded-2xl border border-border bg-card p-4 hover:shadow-soft transition">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-display text-base">{j.title}</h3>
                      {j.remote ? (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-secondary/15 text-secondary">Remote</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{j.company}</span>
                      {(j.city || j.location) && (
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {j.city ?? j.location}</span>
                      )}
                      {j.country && <span>· {j.country}</span>}
                    </div>
                    {j.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{j.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {j.apply_url ? (
                        <a
                          href={j.apply_url}
                          target="_blank"
                          rel="noopener"
                          className="text-[11px] px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground flex items-center gap-1"
                        >
                          Apply <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button className="text-[11px] px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">Apply</button>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        Posted {new Date(j.created_at).toLocaleDateString()}
                        {j.posted_by_name && <> · by {j.posted_by_name}</>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2 px-3">
          {filteredProfiles.length === 0 ? (
            <li className="text-sm text-muted-foreground text-center py-8">No profiles match this search</li>
          ) : filteredProfiles.map((p, i) => (
            <motion.li key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="rounded-2xl border border-border bg-card p-3 flex items-start gap-3 hover:bg-muted/30 transition">
                <div className="w-11 h-11 rounded-2xl bg-gradient-mesh flex items-center justify-center text-primary-foreground font-display shrink-0">
                  {p.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium">{p.display_name}</span>
                    <BadgeCheck className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-[10px] text-muted-foreground">@{p.handle}</span>
                  </div>
                  {p.headline && <p className="text-sm text-muted-foreground line-clamp-1">{p.headline}</p>}
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                    {p.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {p.city}</span>}
                    {p.country && <span>· {p.country}</span>}
                    {p.experience_years != null && <span>· {p.experience_years} yrs</span>}
                  </div>
                  {p.skills && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.skills.split(/[,;]/).slice(0, 4).map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button className="text-[11px] px-3 py-1.5 rounded-full bg-secondary/15 text-secondary hover:bg-secondary/25 transition shrink-0">
                  Connect
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Verification footer */}
      <div className="mx-5 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <h3 className="font-display text-sm">§14 + §16 Verification</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Credentials verified via Circle ID (§16/§21). No engagement-bait ranking, no "social selling"
          funnel. Federated via ActivityPub — your profile lives on your own homeserver.
        </p>
      </div>

      <ProtoFooter section="§14 Summary" title="Career platform without surveillance">
        Open job board · skill-verified profiles · regional matching · IPFS-hosted résumés ·
        no recruiter spam. Federation lets professional networks span multiple Circle instances.
      </ProtoFooter>
    </div>
  );
}

export default ProScreen;
