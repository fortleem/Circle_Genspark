// Cirkle — App shell layout: ambient bg + TopBar + main router outlet + Dock + AI Orb
// + Universal Command Palette (⌘K) + Notifications Inbox.
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "@/components/shell/TopBar";
import { Dock } from "@/components/shell/Dock";
import { AIOrb } from "@/components/shell/AIOrb";
import { Sidebar } from "@/components/shell/Sidebar";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { ShareSheet } from "@/components/shell/ShareSheet";
import { PulseRibbon } from "@/components/shell/PulseRibbon";

export function Layout() {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient aurora background */}
      <div className="fixed inset-0 -z-10 aurora-bg opacity-40 pointer-events-none" />
      <div className="fixed top-0 inset-x-0 h-[60vh] -z-10 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />

      <div className="flex">
        {/* Desktop sidebar (hidden on mobile) */}
        <Sidebar />

        {/* Main column */}
        <div className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto md:max-w-3xl lg:max-w-4xl xl:max-w-5xl relative">
            <TopBar />
            <PulseRibbon />
            <AnimatePresence mode="wait">
              <motion.main
                key={loc.pathname}
                initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4 pb-32"
              >
                <Outlet />
              </motion.main>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AIOrb />
      <Dock />
      {/* Cirkle-distinctive globals — mount once */}
      <CommandPalette />
      <ShareSheet />
    </div>
  );
}
