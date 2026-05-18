import { motion } from "framer-motion";
import { CircleMark } from "@/components/brand/CircleMark";

export function Splash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 aurora-bg opacity-60" />
      <motion.div
        initial={{ scale: 0.6, opacity: 0, filter: "blur(20px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <CircleMark size={120} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 text-center"
      >
        <div className="font-display text-4xl gradient-text">Circle</div>
        <div className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mt-2">دواير</div>
      </motion.div>
    </motion.div>
  );
}
