// MadrasaWorkspace — Full educational workspace (Blueprint §12) — Cirkle's school module
// NOT just schools — covers classrooms, attendance, grading, timetables,
// assignments, parents, resources, announcements. Self-hosted Matrix HQ
// for any educational org: K-12 schools, universities, hifz cirkles,
// language schools, training academies.
//
// Tabs: Overview · Classes · People · Schedule · Assignments · Grades ·
//       Resources · Announcements · Admin (audit + commands)
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, Plus, Users, GraduationCap, Building2, BookOpen, Calendar,
  ClipboardList, Award, FileText, Megaphone, ShieldCheck, ScrollText,
  Check, AlertCircle, UserPlus, Library, Clock,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

const ME = 1;

type Tab = "overview" | "classes" | "people" | "schedule" | "assignments" | "grades" | "resources" | "announcements" | "admin";

type Summary = {
  classes: number; students: number; teachers: number; parents: number;
  attendance_today: { present: number; absent: number; late: number; excused: number };
  upcoming_assignments: number;
};

type Klass = {
  id: number; name: string; subject: string; grade_level: string;
  teacher_id: number; teacher_name?: string; enrolled: number; capacity: number;
  schedule?: string;
};

type Person = {
  id: number; user_id?: number; role: string; display_name: string;
  email?: string; phone?: string; meta?: string; status: string;
};

type AttRow = { person_id: number; display_name: string; status?: string; note?: string };

type Assignment = {
  id: number; class_id: number; class_name: string; subject: string;
  title: string; description?: string; kind: string;
  due_at?: string; max_points: number; graded_count: number;
};

type Resource = {
  id: number; class_id?: number; class_name?: string; title: string; kind: string;
  ipfs_cid?: string; url?: string; tags?: string; uploaded_at: string;
};

type Announcement = {
  id: number; title: string; body: string; audience: string;
  class_name?: string; posted_by_name?: string; posted_at: string;
};

type ScheduleSlot = {
  id: number; name: string; subject: string; grade_level: string;
  day: string; start: string; end: string;
};

export function MadrasaWorkspace({
  workspaceId, workspaceName, onClose,
}: {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4"
    >
      <motion.div
        initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-card border border-border shadow-float overflow-hidden"
      >
        {/* Header */}
        <div className="glass-strong px-4 py-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-brand-charcoal" />
            </div>
            <div>
              <h2 className="font-display text-lg leading-tight">Madrasa · {workspaceName}</h2>
              <p className="text-[10px] uppercase tracking-widest text-secondary">
                Educational Workspace · Matrix-self-hosted · §12
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-3 py-2 border-b border-border overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {([
              ["overview",      "Overview",      Building2],
              ["classes",       "Classes",       BookOpen],
              ["people",        "People",        Users],
              ["schedule",      "Schedule",      Calendar],
              ["assignments",   "Assignments",   ClipboardList],
              ["grades",        "Grades",        Award],
              ["resources",     "Resources",     Library],
              ["announcements", "Announcements", Megaphone],
              ["admin",         "Admin",         ScrollText],
            ] as [Tab, string, any][]).map(([k, l, Icon]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition ${
                  tab === k ? "bg-gradient-hero text-primary-foreground" : "hover:bg-muted/60"
                }`}
              >
                <Icon className="w-3 h-3" /> {l}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "overview"      && <OverviewTab      wsId={workspaceId} />}
              {tab === "classes"       && <ClassesTab       wsId={workspaceId} />}
              {tab === "people"        && <PeopleTab        wsId={workspaceId} />}
              {tab === "schedule"      && <ScheduleTab      wsId={workspaceId} />}
              {tab === "assignments"   && <AssignmentsTab   wsId={workspaceId} />}
              {tab === "grades"        && <GradesTab        wsId={workspaceId} />}
              {tab === "resources"     && <ResourcesTab     wsId={workspaceId} />}
              {tab === "announcements" && <AnnouncementsTab wsId={workspaceId} />}
              {tab === "admin"         && <AdminTab         wsId={workspaceId} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Overview tab ─────────────────────────── */
function OverviewTab({ wsId }: { wsId: string }) {
  const [s, setS] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiGet<Summary>(`/wasl/maktab/${wsId}/summary`).then(setS).catch(() => setS(null)).finally(() => setLoading(false));
  }, [wsId]);
  if (loading) return <div className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;
  if (!s) return <div className="text-center text-muted-foreground py-10">No summary available</div>;

  const totalAtt = (s.attendance_today.present + s.attendance_today.absent + s.attendance_today.late + s.attendance_today.excused) || 1;
  const presentPct = Math.round((s.attendance_today.present / totalAtt) * 100);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric icon={BookOpen}  label="Classes"  value={s.classes} />
        <Metric icon={GraduationCap} label="Students" value={s.students} />
        <Metric icon={Users}     label="Teachers" value={s.teachers} />
        <Metric icon={UserPlus}  label="Parents"  value={s.parents} />
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Today's attendance
          </span>
          <span className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
          <div className="h-full bg-emerald-500" style={{ width: `${(s.attendance_today.present/totalAtt)*100}%` }} />
          <div className="h-full bg-amber-500"  style={{ width: `${(s.attendance_today.late/totalAtt)*100}%` }} />
          <div className="h-full bg-rose-500"   style={{ width: `${(s.attendance_today.absent/totalAtt)*100}%` }} />
          <div className="h-full bg-sky-500"    style={{ width: `${(s.attendance_today.excused/totalAtt)*100}%` }} />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-[11px]">
          <Pill color="emerald" label="Present" v={s.attendance_today.present} />
          <Pill color="amber"   label="Late"    v={s.attendance_today.late} />
          <Pill color="rose"    label="Absent"  v={s.attendance_today.absent} />
          <Pill color="sky"     label="Excused" v={s.attendance_today.excused} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          {presentPct}% on-time today across all classes
        </p>
      </div>

      <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4 flex items-center gap-3">
        <ClipboardList className="w-5 h-5 text-secondary shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-medium">{s.upcoming_assignments} upcoming assignment{s.upcoming_assignments !== 1 ? "s" : ""}</div>
          <div className="text-[11px] text-muted-foreground">Visit the Assignments tab to review or grade</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-4">
        <div className="text-[10px] uppercase tracking-widest text-secondary mb-2">Capabilities</div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {[
            ["Classroom rooms",        BookOpen],
            ["Attendance tracker",     ShieldCheck],
            ["Assignments + grading",  Award],
            ["Parent portal",          UserPlus],
            ["IPFS resource library",  Library],
            ["School announcements",   Megaphone],
            ["Audit log + retention",  ScrollText],
            ["Matrix self-hosted HQ",  Building2],
          ].map(([l, Icon]) => (
            <div key={String(l)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/40">
              <Icon className="w-3 h-3 text-secondary" />
              <span>{l as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-secondary">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function Pill({ color, label, v }: { color: string; label: string; v: number }) {
  const cls: Record<string,string> = {
    emerald: "bg-emerald-500/15 text-emerald-600",
    amber:   "bg-amber-500/15 text-amber-600",
    rose:    "bg-rose-500/15 text-rose-600",
    sky:     "bg-sky-500/15 text-sky-600",
  };
  return (
    <div className={`text-center rounded-lg px-2 py-1 ${cls[color]}`}>
      <div className="font-semibold">{v}</div>
      <div className="text-[9px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

/* ─────────────────────────── Classes tab ─────────────────────────── */
function ClassesTab({ wsId }: { wsId: string }) {
  const [list, setList] = useState<Klass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [n, setN] = useState({ name: "", subject: "", grade_level: "", capacity: 30 });

  const load = () => {
    setLoading(true);
    apiGet<{ classes: Klass[] }>(`/wasl/maktab/${wsId}/classes`)
      .then((d) => setList(d.classes ?? [])).catch(() => setList([])).finally(() => setLoading(false));
  };
  useEffect(load, [wsId]);

  async function create() {
    if (!n.name) return;
    await apiPost(`/wasl/maktab/${wsId}/classes`, n);
    setShowNew(false);
    setN({ name: "", subject: "", grade_level: "", capacity: 30 });
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-secondary">All classes</span>
        <button onClick={() => setShowNew((s) => !s)} className="text-[11px] px-3 py-1.5 rounded-full bg-gradient-hero text-primary-foreground flex items-center gap-1">
          <Plus className="w-3 h-3" /> New class
        </button>
      </div>

      {showNew && (
        <div className="rounded-2xl border border-secondary/40 bg-secondary/5 p-3 space-y-2">
          <input className="w-full bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Class name · e.g. Grade 8B · Physics" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Subject" value={n.subject} onChange={(e) => setN({ ...n, subject: e.target.value })} />
            <input className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Grade" value={n.grade_level} onChange={(e) => setN({ ...n, grade_level: e.target.value })} />
            <input type="number" className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Capacity" value={n.capacity} onChange={(e) => setN({ ...n, capacity: Number(e.target.value) || 30 })} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNew(false)} className="text-[11px] px-3 py-1 rounded-full glass">Cancel</button>
            <button onClick={create} disabled={!n.name} className="text-[11px] px-3 py-1 rounded-full bg-gradient-hero text-primary-foreground disabled:opacity-40">Create</button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      ) : list.length === 0 ? (
        <Empty msg="No classes yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {list.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card/50 p-3 hover:border-secondary/40 transition">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{c.subject ?? "—"} · {c.grade_level ?? "—"}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">{c.enrolled}/{c.capacity}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Teacher · {c.teacher_name ?? `#${c.teacher_id ?? "?"}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── People tab ─────────────────────────── */
function PeopleTab({ wsId }: { wsId: string }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [filter, setFilter] = useState<"all"|"student"|"teacher"|"parent"|"principal"|"staff">("all");
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [n, setN] = useState({ role: "student", display_name: "", email: "" });

  const load = () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?role=${filter}`;
    apiGet<{ people: Person[] }>(`/wasl/maktab/${wsId}/people${q}`)
      .then((d) => setPeople(d.people ?? [])).catch(() => setPeople([])).finally(() => setLoading(false));
  };
  useEffect(load, [wsId, filter]);

  async function invite() {
    if (!n.display_name || !n.role) return;
    await apiPost(`/wasl/maktab/${wsId}/people`, n);
    setShowInvite(false);
    setN({ role: "student", display_name: "", email: "" });
    load();
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of people) c[p.role] = (c[p.role] ?? 0) + 1;
    return c;
  }, [people]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {(["all","student","teacher","parent","principal","staff"] as const).map((r) => (
          <button key={r} onClick={() => setFilter(r)} className={`text-[10px] px-2.5 py-1 rounded-full ${filter === r ? "bg-gradient-hero text-primary-foreground" : "glass"}`}>
            {r}{filter === "all" && counts[r] ? ` · ${counts[r]}` : ""}
          </button>
        ))}
        <button onClick={() => setShowInvite((s) => !s)} className="ml-auto text-[11px] px-3 py-1.5 rounded-full bg-gradient-hero text-primary-foreground flex items-center gap-1">
          <UserPlus className="w-3 h-3" /> Invite
        </button>
      </div>

      {showInvite && (
        <div className="rounded-2xl border border-secondary/40 bg-secondary/5 p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <select className="bg-card border border-border rounded-xl px-3 py-1.5 text-sm" value={n.role} onChange={(e) => setN({ ...n, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
              <option value="principal">Principal</option>
              <option value="staff">Staff</option>
            </select>
            <input className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Name" value={n.display_name} onChange={(e) => setN({ ...n, display_name: e.target.value })} />
            <input className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="email@school" value={n.email} onChange={(e) => setN({ ...n, email: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowInvite(false)} className="text-[11px] px-3 py-1 rounded-full glass">Cancel</button>
            <button onClick={invite} disabled={!n.display_name} className="text-[11px] px-3 py-1 rounded-full bg-gradient-hero text-primary-foreground disabled:opacity-40">Send invite</button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      ) : people.length === 0 ? (
        <Empty msg="No people yet" />
      ) : (
        <div className="space-y-1.5">
          {people.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card/50 p-2.5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${roleColor(p.role)}`}>
                {p.display_name?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.display_name}</div>
                <div className="text-[10px] text-muted-foreground">{p.email ?? p.phone ?? "—"}</div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">{p.role}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                p.status === "active" ? "bg-emerald-500/15 text-emerald-600" :
                p.status === "invited" ? "bg-amber-500/15 text-amber-600" :
                "bg-rose-500/15 text-rose-600"
              }`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function roleColor(role: string): string {
  switch (role) {
    case "student": return "bg-sky-500/20 text-sky-600";
    case "teacher": return "bg-violet-500/20 text-violet-600";
    case "parent":  return "bg-emerald-500/20 text-emerald-600";
    case "principal": return "bg-amber-500/20 text-amber-600";
    default: return "bg-muted text-foreground";
  }
}

/* ─────────────────────────── Schedule tab ─────────────────────────── */
function ScheduleTab({ wsId }: { wsId: string }) {
  const [day, setDay] = useState<string>(["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    apiGet<{ schedule: ScheduleSlot[] }>(`/wasl/maktab/${wsId}/schedule?day=${day}`)
      .then((d) => setSlots(d.schedule ?? [])).catch(() => setSlots([])).finally(() => setLoading(false));
  }, [wsId, day]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {["sat","sun","mon","tue","wed","thu","fri"].map((d) => (
          <button key={d} onClick={() => setDay(d)} className={`text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider ${day === d ? "bg-gradient-hero text-primary-foreground" : "glass"}`}>
            {d}
          </button>
        ))}
      </div>
      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : slots.length === 0 ? <Empty msg="No classes scheduled" /> : (
        <div className="space-y-1.5">
          {slots.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-3">
              <div className="text-center w-16 shrink-0">
                <div className="font-mono text-sm text-secondary">{s.start}</div>
                <div className="text-[9px] text-muted-foreground">{s.end}</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[10px] text-muted-foreground">{s.subject} · {s.grade_level}</div>
              </div>
              <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Assignments tab ─────────────────────────── */
function AssignmentsTab({ wsId }: { wsId: string }) {
  const [list, setList] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Klass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [n, setN] = useState({ class_id: 0, title: "", description: "", kind: "homework", due_at: "", max_points: 100 });

  const load = () => {
    setLoading(true);
    Promise.all([
      apiGet<{ assignments: Assignment[] }>(`/wasl/maktab/${wsId}/assignments`),
      apiGet<{ classes: Klass[] }>(`/wasl/maktab/${wsId}/classes`),
    ]).then(([a, c]) => { setList(a.assignments ?? []); setClasses(c.classes ?? []); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [wsId]);

  async function create() {
    if (!n.class_id || !n.title) return;
    await apiPost(`/wasl/maktab/classes/${n.class_id}/assignments`, { ...n, created_by: ME });
    setShowNew(false);
    setN({ class_id: 0, title: "", description: "", kind: "homework", due_at: "", max_points: 100 });
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-secondary">Upcoming + recent</span>
        <button onClick={() => setShowNew((s) => !s)} className="text-[11px] px-3 py-1.5 rounded-full bg-gradient-hero text-primary-foreground flex items-center gap-1">
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {showNew && (
        <div className="rounded-2xl border border-secondary/40 bg-secondary/5 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select className="bg-card border border-border rounded-xl px-3 py-1.5 text-sm" value={n.class_id} onChange={(e) => setN({ ...n, class_id: Number(e.target.value) })}>
              <option value={0}>— Pick class —</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="bg-card border border-border rounded-xl px-3 py-1.5 text-sm" value={n.kind} onChange={(e) => setN({ ...n, kind: e.target.value })}>
              <option value="homework">Homework</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
              <option value="reading">Reading</option>
            </select>
          </div>
          <input className="w-full bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Title" value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} />
          <textarea rows={2} className="w-full bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Description (optional)" value={n.description} onChange={(e) => setN({ ...n, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" value={n.due_at} onChange={(e) => setN({ ...n, due_at: e.target.value })} />
            <input type="number" className="bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Max points" value={n.max_points} onChange={(e) => setN({ ...n, max_points: Number(e.target.value) || 100 })} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNew(false)} className="text-[11px] px-3 py-1 rounded-full glass">Cancel</button>
            <button onClick={create} disabled={!n.class_id || !n.title} className="text-[11px] px-3 py-1 rounded-full bg-gradient-hero text-primary-foreground disabled:opacity-40">Create</button>
          </div>
        </div>
      )}

      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : list.length === 0 ? <Empty msg="No assignments yet" /> : (
        <div className="space-y-1.5">
          {list.map((a) => {
            const overdue = a.due_at && new Date(a.due_at) < new Date();
            return (
              <div key={a.id} className="rounded-xl border border-border bg-card/50 p-3">
                <div className="flex items-start gap-2">
                  <div className={`w-1 self-stretch rounded-full ${overdue ? "bg-rose-500" : "bg-secondary"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium">{a.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary uppercase">{a.kind}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {a.class_name} · {a.subject} · {a.max_points} pts · {a.graded_count} graded
                    </div>
                    {a.due_at && (
                      <div className={`text-[10px] mt-1 ${overdue ? "text-rose-600" : "text-muted-foreground"}`}>
                        Due {new Date(a.due_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Grades tab (read-only roll-up) ─────────────────────────── */
function GradesTab({ wsId }: { wsId: string }) {
  const [list, setList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiGet<{ assignments: Assignment[] }>(`/wasl/maktab/${wsId}/assignments`)
      .then((d) => setList(d.assignments ?? [])).catch(() => setList([])).finally(() => setLoading(false));
  }, [wsId]);
  const graded = list.filter((a) => a.graded_count > 0);
  return loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-widest text-secondary">Grade book · {graded.length} graded assignments</div>
      {graded.length === 0 ? <Empty msg="No grades posted yet" /> : graded.map((a) => (
        <GradeRow key={a.id} a={a} />
      ))}
    </div>
  );
}

function GradeRow({ a }: { a: Assignment }) {
  const [open, setOpen] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  function toggle() {
    if (!open) {
      setLoading(true);
      apiGet<{ grades: any[] }>(`/wasl/maktab/assignments/${a.id}/grades`)
        .then((d) => setGrades(d.grades ?? [])).catch(() => setGrades([])).finally(() => setLoading(false));
    }
    setOpen(!open);
  }
  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <button onClick={toggle} className="w-full text-left p-3 flex items-center gap-3">
        <Award className="w-4 h-4 text-secondary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{a.title}</div>
          <div className="text-[10px] text-muted-foreground">{a.class_name} · {a.graded_count} / {a.max_points} pts</div>
        </div>
        <span className="text-[10px] text-muted-foreground">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="border-t border-border p-3 bg-background/50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : grades.length === 0 ? <div className="text-[10px] text-muted-foreground">No scores recorded</div> : (
            <ul className="space-y-1">
              {grades.map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-[12px]">
                  <span className="flex-1 truncate">{g.display_name}</span>
                  <span className="font-mono text-secondary">{g.score ?? "—"}/{a.max_points}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Resources tab ─────────────────────────── */
function ResourcesTab({ wsId }: { wsId: string }) {
  const [list, setList] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiGet<{ resources: Resource[] }>(`/wasl/maktab/${wsId}/resources`)
      .then((d) => setList(d.resources ?? [])).catch(() => setList([])).finally(() => setLoading(false));
  }, [wsId]);
  return loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : list.length === 0 ? <Empty msg="No resources" /> : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {list.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-card/50 p-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.title}</div>
              <div className="text-[10px] text-muted-foreground">{r.class_name ?? "Workspace-wide"} · {r.kind}</div>
              {r.tags && <div className="text-[9px] text-secondary mt-0.5">#{r.tags.split(",").join(" #")}</div>}
              {r.ipfs_cid && <div className="font-mono text-[9px] text-muted-foreground/70 mt-0.5 truncate">ipfs://{r.ipfs_cid}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Announcements tab ─────────────────────────── */
function AnnouncementsTab({ wsId }: { wsId: string }) {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [n, setN] = useState({ title: "", body: "", audience: "all" });

  const load = () => {
    setLoading(true);
    apiGet<{ announcements: Announcement[] }>(`/wasl/maktab/${wsId}/announcements`)
      .then((d) => setList(d.announcements ?? [])).catch(() => setList([])).finally(() => setLoading(false));
  };
  useEffect(load, [wsId]);

  async function post() {
    if (!n.title || !n.body) return;
    await apiPost(`/wasl/maktab/${wsId}/announcements`, { ...n, posted_by: ME });
    setShowNew(false);
    setN({ title: "", body: "", audience: "all" });
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-secondary">Recent announcements</span>
        <button onClick={() => setShowNew((s) => !s)} className="text-[11px] px-3 py-1.5 rounded-full bg-gradient-hero text-primary-foreground flex items-center gap-1">
          <Megaphone className="w-3 h-3" /> Post
        </button>
      </div>

      {showNew && (
        <div className="rounded-2xl border border-secondary/40 bg-secondary/5 p-3 space-y-2">
          <input className="w-full bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Title" value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} />
          <textarea rows={2} className="w-full bg-transparent border border-border rounded-xl px-3 py-1.5 text-sm" placeholder="Message body" value={n.body} onChange={(e) => setN({ ...n, body: e.target.value })} />
          <div className="flex items-center gap-2">
            <select className="bg-card border border-border rounded-xl px-3 py-1.5 text-sm" value={n.audience} onChange={(e) => setN({ ...n, audience: e.target.value })}>
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="parents">Parents</option>
              <option value="teachers">Teachers</option>
            </select>
            <div className="flex-1" />
            <button onClick={() => setShowNew(false)} className="text-[11px] px-3 py-1 rounded-full glass">Cancel</button>
            <button onClick={post} disabled={!n.title || !n.body} className="text-[11px] px-3 py-1 rounded-full bg-gradient-hero text-primary-foreground disabled:opacity-40">Post</button>
          </div>
        </div>
      )}

      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : list.length === 0 ? <Empty msg="No announcements" /> : (
        <div className="space-y-1.5">
          {list.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card/50 p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-sm font-medium">{a.title}</div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary uppercase">{a.audience}</span>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{a.body}</p>
              <div className="text-[9px] text-muted-foreground/70 mt-1">
                {a.class_name ?? "All classes"} · {new Date(a.posted_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Admin tab (audit + commands) ─────────────────────────── */
function AdminTab({ wsId }: { wsId: string }) {
  const [audit, setAudit] = useState<any[]>([]);
  const [cmd, setCmd] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    apiGet<{ audit: any[] }>(`/wasl/maktab/${wsId}/audit`)
      .then((d) => setAudit(d.audit ?? [])).catch(() => setAudit([]));
  };
  useEffect(load, [wsId]);

  async function runCmd() {
    if (!cmd.trim() || busy) return;
    setBusy(true);
    const m = cmd.trim().match(/^\/(\w+(?:-\w+)*)\s*(.*)$/);
    try {
      await apiPost(`/wasl/maktab/${wsId}/command`, {
        actor_id: ME, action: m?.[1] ?? "unknown", target: m?.[2] ?? null, details: { raw: cmd },
      });
      setCmd("");
      load();
    } finally { setBusy(false); }
  }

  const quick = [
    "/set-retention #all 90d",
    "/export-workspace --format json",
    "/audit-log --from 2026-01-01",
    "/set-visibility all members",
    "/backup-now --ipfs",
    "/rotate-keys",
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card/50 p-3">
        <div className="text-xs font-medium mb-2">Admin quick commands</div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {quick.map((q) => (
            <button key={q} onClick={() => setCmd(q)} className="text-start px-2 py-1.5 rounded-lg glass hover:bg-secondary/10 font-mono truncate">{q}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input value={cmd} onChange={(e) => setCmd(e.target.value)}
               onKeyDown={(e) => { if (e.key === "Enter") runCmd(); }}
               placeholder="/command target"
               className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono" />
        <button onClick={runCmd} disabled={busy} className="rounded-xl bg-gradient-hero text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run"}
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-card/50 p-3">
        <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <ScrollText className="w-3 h-3" /> Audit log
        </div>
        {audit.length === 0 ? <div className="text-[11px] text-muted-foreground text-center py-4">No actions yet</div> : (
          <ul className="space-y-1 max-h-72 overflow-y-auto">
            {audit.map((a) => (
              <li key={a.id} className="text-[11px] flex items-start gap-2">
                <span className="font-mono text-secondary shrink-0">{a.action}</span>
                <span className="text-muted-foreground truncate flex-1">{a.target ?? "—"}</span>
                <span className="text-muted-foreground/60 shrink-0">{new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── shared ─────────────────────────── */
function Empty({ msg }: { msg: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground text-[12px] flex flex-col items-center gap-2">
      <AlertCircle className="w-5 h-5 opacity-60" />
      {msg}
    </div>
  );
}

export default MadrasaWorkspace;
