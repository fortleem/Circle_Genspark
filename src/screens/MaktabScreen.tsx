// §12 — Wasl Maktab (work/office collaboration)
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { GraduationCap, FileText, Video, Calendar, FolderOpen } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const TOOLS = [
  { icon: FileText, name: "Docs",   desc: "Collaborative documents with E2EE, federated sync, Markdown export." },
  { icon: Video,    name: "Meet",   desc: "End-to-end encrypted video calls up to 100 participants. No cloud recording." },
  { icon: Calendar, name: "Cal",    desc: "Shared calendars across teams, CalDAV federated to Outlook/Apple." },
  { icon: FolderOpen, name: "Drive", desc: "IPFS-pinned team files. Granular permissions, version history." },
  { icon: GraduationCap, name: "Learn", desc: "Course delivery for institutions: video, quizzes, certificates on Circle ID." },
];

export function MaktabScreen() {
  const { names } = useApp();
  return (
    <PageShell
      icon={GraduationCap}
      title={names.module_maktab}
      arabicTitle="وصل المكتب"
      section="§12"
      tagline="Work, learn, and meet — without sending your company's data to a US tech giant"
      intro="Wasl Maktab is the office/education companion to Wasl. Built on the same Matrix backbone, it brings docs, meets, calendars, and learning into one sovereign, self-hostable workspace."
    >
      <SectionHeader title="Suite" />
      <div className="grid sm:grid-cols-2 gap-4">
        {TOOLS.map((t) => (
          <GlassCard key={t.name}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <t.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
export default MaktabScreen;
