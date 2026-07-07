import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CirkleMark } from "@/components/brand/CirkleMark";
import { useApp } from "@/providers/AppProvider";
import { ui } from "@/lib/uiStrings";

const slides = ["slide1", "slide2", "slide3"] as const;

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { locale, toggleLocale } = useApp();
  const t = ui(locale).onboarding;
  const [i, setI] = useState(0);
  const next = () => (i < slides.length - 1 ? setI(i + 1) : onDone());

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-hidden">
      {/* Aurora bg */}
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

      {/* Top */}
      <div className="absolute top-0 inset-x-0 p-5 pt-[env(safe-area-inset-top)] flex items-center justify-between">
        <button onClick={toggleLocale} className="text-xs glass px-3 py-1.5 rounded-full">{locale === "ar" ? "English" : "العربية"}</button>
        <button onClick={onDone} className="text-xs text-muted-foreground">{t.skip}</button>
      </div>

      <div className="relative h-full flex flex-col items-center justify-center px-8 text-center">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
          <CirkleMark size={140} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="mt-10 max-w-md"
          >
            <h1 className="font-display text-5xl leading-tight gradient-text">{t[slides[i]].title}</h1>
            <p className="mt-4 text-muted-foreground text-base">{t[slides[i]].body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-32 flex items-center gap-2">
          {slides.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-gradient-gold" : "w-1.5 bg-muted"}`} />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={next}
          className="absolute bottom-12 px-8 py-4 rounded-full bg-gradient-hero text-primary-foreground font-medium shadow-float animate-pulse-glow text-sm"
        >
          {i === slides.length - 1 ? t.cta : "Continue"}
        </button>
      </div>
    </div>
  );
}
