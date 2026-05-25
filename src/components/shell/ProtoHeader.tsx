// Shared prototype-style screen header — matches the look of HomeScreen/WaslScreen/MashahdScreen.
// Heading + arabic accent + optional right slot. Blueprint section anchors are hidden in production.
import type { ReactNode } from "react";

/** Set to true only in dev to surface §x blueprint anchors. Customers never see them. */
const SHOW_BLUEPRINT_ANCHORS = false;

export function ProtoHeader({
  title,
  arabic,
  section,
  tagline,
  right,
}: {
  title: ReactNode;
  arabic?: ReactNode;
  /** Blueprint §x anchor — only rendered in dev. Customer-facing builds drop it. */
  section?: string;
  tagline?: ReactNode;
  right?: ReactNode;
}) {
  const showAnchor = SHOW_BLUEPRINT_ANCHORS && section;
  return (
    <div className="px-5 pt-2 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-4xl leading-tight">
          {title}
          {arabic && (
            <>
              {""}
              <span className="text-base text-muted-foreground tracking-widest uppercase">
                {arabic}
              </span>
            </>
          )}
        </h1>
        {(showAnchor || tagline) && (
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            {showAnchor && section}
            {showAnchor && tagline && " · "}
            {tagline}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/** Section divider used between blueprint sub-sections. §x anchor hidden in production. */
export function ProtoSection({
  num,
  title,
  hint,
  children,
}: {
  num?: string;
  title: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
}) {
  const showNum = SHOW_BLUEPRINT_ANCHORS && num;
  return (
    <section className="px-5">
      <div className="mb-2 flex items-baseline gap-2">
        {showNum && (
          <span className="text-[10px] uppercase tracking-widest text-secondary font-mono">
            §{num}
          </span>
        )}
        <h2 className="font-display text-lg">{title}</h2>
      </div>
      {hint && <p className="-mt-1 mb-3 text-[11px] text-muted-foreground">{hint}</p>}
      {children}
    </section>
  );
}

/** Decorative summary footer card matching prototype gradients */
export function ProtoFooter({
  section,
  title,
  children,
}: {
  section?: string;
  title?: ReactNode;
  children: ReactNode;
}) {
  const showSection = SHOW_BLUEPRINT_ANCHORS && section;
  return (
    <div className="mx-5 mt-8 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
      <div className="relative">
        {(showSection || title) && (
          <div className="flex items-center gap-2 mb-2">
            {showSection && (
              <span className="text-[10px] uppercase tracking-widest text-secondary">
                {section}
              </span>
            )}
            {title && (
              <span className="text-[10px] uppercase tracking-widest text-foreground/80">
                {showSection ? "· " : ""}
                {title}
              </span>
            )}
          </div>
        )}
        <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
