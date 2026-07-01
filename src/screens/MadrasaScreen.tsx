// — Madrasa: Educational & Institutional Workspaces. Powered by the Wasl Maktab backbone.
// Covers Multi-audience, Onboarding, Features (assignments/grades/
// attendance/conferences/fees/permission), Zero-cost, Minors compliance,
// Audit, Comparison.
import { motion } from "framer-motion";
import {
  Building2, GraduationCap, FileText, Video, Calendar, FolderOpen, Upload,
  ClipboardList, BarChart3, UserCheck, Users, CreditCard, FileSignature,
  ShieldCheck, BookOpen,
} from "lucide-react";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

const FEATURES = [
  { icon: ClipboardList, num: "12.4.1", name: "Assignments", desc: "Submission · auto-grade · feedback inline" },
  { icon: BarChart3, num: "12.4.2", name: "Grade Publishing", desc: "Per-student dashboard · weighted rubrics" },
  { icon: UserCheck, num: "12.4.3", name: "Attendance", desc: "QR check-in · BLE proximity · roll-call bot" },
  { icon: Users, num: "12.4.4", name: "Parent-Teacher", desc: "Booked slots · video room · transcript" },
  { icon: CreditCard, num: "12.4.5", name: "Fee Payment", desc: "Optional Paymob/Fawry · school-owned wallet" },
  { icon: FileSignature, num: "12.4.6", name: "Permission slips",desc: "Digital consent · legal-guardian signature" },
];

const TOOLS = [
  { icon: FileText, name: "Docs", desc: "Collaborative · E2EE · Markdown export" },
  { icon: Video, name: "Meet", desc: "E2EE video · up to 100 participants" },
  { icon: Calendar, name: "Cal", desc: "Shared CalDAV · syncs Outlook/Apple" },
  { icon: FolderOpen, name: "Drive", desc: "IPFS-pinned files · version history" },
  { icon: BookOpen, name: "Learn", desc: "Courses · quizzes · certificates on Circle ID" },
];

export function MadrasaScreen() {
  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Madrasa"
        arabic="مدرسة"
        section=""
        tagline="Schools · institutions · workspaces"
        right={
          <button className="text-xs px-3 py-1.5 rounded-full bg-gradient-gold text-brand-charcoal font-medium flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" /> Install
          </button>
        }
      />

      {/* Overview hero */}
      <div className="mx-5 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-8 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-brand-charcoal" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-secondary">Overview</div>
            <div className="font-display text-lg mt-0.5">Self-hosted Matrix for schools & companies</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Same Wasl backbone — added admin tools, audit log, retention rules, fee payment hooks.
              GDPR + KSA Personal Data Protection Law + EG Child Protection compliant out of the box.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-audience */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Multi-audience management
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Students", "Teachers", "Parents"].map((aud) => (
            <div key={aud} className="glass rounded-xl py-3 flex flex-col items-center gap-1.5">
              <Users className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium">{aud}</span>
              <span className="text-[9px] text-muted-foreground">Separate rooms · perms</span>
            </div>
          ))}
        </div>
      </div>

      {/* CSV onboarding */}
      <div className="mx-5 glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-secondary" />
          <h3 className="font-display text-sm">CSV onboarding</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Drop a CSV of <code className="text-secondary">email, role, grade, parent_email</code> →
          admin bot auto-provisions Matrix accounts, room memberships, and parent links.
          Avg ~120 accounts/minute.
        </p>
      </div>

      {/* Feature grid */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Education-specific features
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-3 hover:shadow-soft transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase text-secondary">§{f.num}</span>
                    <span className="font-medium text-sm">{f.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* / suite tools */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Workspace suite
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TOOLS.map((t) => (
            <div key={t.name} className="glass rounded-xl p-3 flex flex-col items-center gap-1.5">
              <t.icon className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium">{t.name}</span>
              <span className="text-[9px] text-muted-foreground text-center line-clamp-2">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Minors compliance */}
      <div className="mx-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <h3 className="font-display text-sm">Minors compliance</h3>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Under-13: no public posting, parent-only contact</li>
          <li>• Under-18: NSFW blocked, no tipping, no mesh discovery</li>
          <li>• Records sealed at graduation; auto-export to PDF</li>
          <li>• GDPR Art. 8 + COPPA + KSA PDPL + EG Child Protection</li>
        </ul>
      </div>

      <ProtoFooter section="Summary" title="Sovereign learning OS">
        Multi-audience management · CSV provisioning · assignments / grades / attendance ·
        parent-teacher · optional fee payment · minors-safe by design · IPFS files · per-class audit log.
      </ProtoFooter>
    </div>
  );
}

export default MadrasaScreen;
