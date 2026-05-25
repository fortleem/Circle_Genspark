// Circle — Desktop sidebar. Advanced retractable (full / icon-rail) with persistence.
// Production-only items are shown; internal/docs-only routes are hidden but still routable.
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { GROUPED, GROUP_LABELS, type NavGroupKey } from "@/lib/tabs";
import { useApp } from "@/providers/AppProvider";
import { CircleMark } from "@/components/brand/CircleMark";

const STORAGE_KEY = "circle.sidebar.collapsed";

export function Sidebar() {
  const { names } = useApp();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    }
  }, [collapsed]);

  const groups: NavGroupKey[] = ["discover", "pillars", "community", "life", "aiPrivacy", "about"];

  return (
    <aside
      className={`hidden md:flex shrink-0 sticky top-0 h-screen pt-5 pb-4 flex-col gap-3 border-r border-border/40 bg-background/50 backdrop-blur-xl overflow-y-auto scrollbar-hide transition-all duration-200 ${
        collapsed ? "w-[68px] px-2" : "w-64 lg:w-72 px-4"
      }`}
      data-collapsed={collapsed ? "1" : "0"}
    >
      {/* Brand + collapse toggle */}
      <div className="flex items-center justify-between mb-2 px-1">
        <NavLink to="/" className="flex items-center gap-3 min-w-0">
          <CircleMark size={collapsed ? 30 : 36} />
          {!collapsed && (
            <div className="leading-none min-w-0">
              <div className="font-display text-xl gradient-text-gold truncate">{names.brand_name}</div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase truncate">
                {names.tagline.slice(0, 32)}
              </div>
            </div>
          )}
        </NavLink>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 transition shrink-0 ${
            collapsed ? "absolute -right-3 top-6 bg-card border border-border shadow-soft" : ""
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronsLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Groups */}
      {groups.map((g) => {
        const items = GROUPED[g];
        if (!items?.length) return null;
        return (
          <div key={g} className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">
                {GROUP_LABELS[g]}
              </div>
            )}
            {collapsed && g !== "discover" && (
              <div className="mx-3 my-2 border-t border-border/40" />
            )}
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  title={collapsed ? item.label(names) : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl text-sm transition-colors ${
                      collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-primary/15 to-secondary/10 text-foreground font-medium ring-1 ring-secondary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label(names)}</span>}

                  {/* Tooltip on collapsed hover */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ms-2 z-50 hidden group-hover:block whitespace-nowrap rounded-md bg-foreground text-background text-[11px] px-2 py-1 shadow-float">
                      {item.label(names)}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        );
      })}

      {!collapsed && (
        <div className="mt-auto px-3 pt-4 text-[10px] text-muted-foreground/60">
          Apache 2.0 · 100% Free
        </div>
      )}
    </aside>
  );
}
