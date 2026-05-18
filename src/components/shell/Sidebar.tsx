// Circle — Desktop sidebar nav (hidden below md)
import { NavLink } from "react-router-dom";
import { GROUPED, GROUP_LABELS, type NavGroupKey } from "@/lib/tabs";
import { useApp } from "@/providers/AppProvider";
import { CircleMark } from "@/components/brand/CircleMark";

export function Sidebar() {
  const { names } = useApp();
  const groups: NavGroupKey[] = ['discover', 'pillars', 'community', 'life', 'aiPrivacy', 'openSource'];
  return (
    <aside className="hidden md:flex w-64 lg:w-72 shrink-0 sticky top-0 h-screen pt-6 pb-4 px-4 flex-col gap-4 border-r border-border/40 bg-background/50 backdrop-blur-xl overflow-y-auto scrollbar-hide">
      <NavLink to="/" className="flex items-center gap-3 px-2 mb-2">
        <CircleMark size={36} />
        <div className="leading-none">
          <div className="font-display text-xl gradient-text-gold">{names.brand_name}</div>
          <div className="text-[10px] text-muted-foreground tracking-widest uppercase">{names.tagline.slice(0, 32)}</div>
        </div>
      </NavLink>

      {groups.map(g => (
        <div key={g} className="space-y-0.5">
          <div className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">
            {GROUP_LABELS[g]}
          </div>
          {GROUPED[g].map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-secondary/10 text-foreground font-medium ring-1 ring-secondary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label(names)}</span>
                <span className="ml-auto text-[9px] text-muted-foreground/50">{item.sections}</span>
              </NavLink>
            );
          })}
        </div>
      ))}

      <div className="mt-auto px-3 pt-4 text-[10px] text-muted-foreground/60">
        Apache 2.0 · 100% Free · $0 marginal cost
      </div>
    </aside>
  );
}
