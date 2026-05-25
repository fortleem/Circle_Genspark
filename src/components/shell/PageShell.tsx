// Reusable page wrapper used by every Circle screen.
// Provides: section badge, blueprint anchor, hero header, description, content slot.
import { motion } from "framer-motion";
import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface PageShellProps {
  icon?: LucideIcon;
  title: ReactNode;
  /** Arabic / native name displayed above the title */
  arabicTitle?: ReactNode;
  /** Blueprint section badge e.g. "" */
  section?: string;
  /** Short tagline shown under the title */
  tagline?: ReactNode;
  /** Lead paragraph */
  intro?: ReactNode;
  /** Optional right-side controls / chips */
  actions?: ReactNode;
  /** Main content slot */
  children?: ReactNode;
}

export function PageShell({
  icon: Icon,
  title,
  arabicTitle,
  section,
  tagline,
  intro,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-8 px-5 pb-16">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pt-2 space-y-2"
      >
        {(section || arabicTitle) && (
          <div className="flex items-center gap-2 flex-wrap">
            {section && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-secondary/15 text-secondary border border-secondary/30">
                Blueprint {section}
              </span>
            )}
            {arabicTitle && (
              <span className="font-display text-lg text-muted-foreground">{arabicTitle}</span>
            )}
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/5 border border-secondary/30 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-secondary" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-3xl md:text-4xl leading-tight truncate">{title}</h1>
              {tagline && <p className="text-sm text-muted-foreground mt-1">{tagline}</p>}
            </div>
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>
        {intro && (
          <p className="text-sm md:text-[0.95rem] leading-relaxed text-muted-foreground/90 max-w-2xl pt-2">
            {intro}
          </p>
        )}
      </motion.header>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ----- helpers for content cards ---------------------------------------- */

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 border border-border/40 ${className}`}>
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4 border border-border/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
      {hint && <div className="text-xs text-muted-foreground/80 mt-1">{hint}</div>}
    </div>
  );
}

export function SectionHeader({ title, hint }: { title: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="font-display text-xl">{title}</h2>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function EmptyState({
  message = "No data yet — seed data is loading or this surface is not yet wired.",
}: {
  message?: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-8 text-center border border-border/40">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
