// Circle — Floating mobile dock (8 primary tabs). Hidden on md+ where sidebar takes over.
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { PRIMARY_TABS } from "@/lib/tabs";
import { useApp } from "@/providers/AppProvider";

export function Dock() {
  const { names } = useApp();
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)] pointer-events-none md:hidden">
      <div className="px-3 pb-3 flex justify-center pointer-events-auto">
        <nav className="glass-strong shadow-float rounded-full px-2 py-2 flex items-center gap-0.5 max-w-full overflow-x-auto scrollbar-hide">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                end={tab.path === "/"}
                className="relative flex items-center justify-center min-w-11 h-11 px-3 rounded-full transition-colors text-muted-foreground"
                aria-label={tab.label(names)}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="dock-pill"
                        className="absolute inset-0 rounded-full bg-gradient-hero"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className={`relative flex items-center gap-2 ${isActive ? "text-primary-foreground" : ""}`}>
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.8} />
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          className="text-xs font-medium whitespace-nowrap pr-1"
                        >
                          {tab.label(names)}
                        </motion.span>
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
