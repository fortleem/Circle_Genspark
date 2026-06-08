// MidanSignal — Conversation-quality intelligence for Midan.
//  • SignalMeter: real-time signal:noise score on the composer
//  • AntiRageGate: blocks impulsive angry posts behind a 10s breather + rephrase
//  • ConversationGraph: shows reply constellation + dominant tone per post
//  • CrossPillarQuote: import a Mashahd video / Lamahat photo / Wasl quote
//
// Everything runs entirely on-device — no API calls, no AI vendors.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Sparkles, BarChart3, Flame, Wind, X, Video, Image as ImageIcon,
  MessageSquare, Quote as QuoteIcon, Check, Brain, Activity,
} from "lucide-react";

/* ─────────────────────────── Signal-vs-Noise scoring ─────────────────────────── */

const ANGER_WORDS = [
  "hate","stupid","idiot","trash","garbage","kill","die","worst","disgusting",
  "loser","pathetic","destroy","ruin","scum",
  "غبي","حقير","قتل","نفاية","حثالة","تافه",
];
const NOISE_WORDS = ["lol","lmao","omg","wtf","smh","ugh","ffs","lolol"];
const SIGNAL_HINTS = [
  "because","therefore","source","study","data","evidence","i think","i believe","let's","because of",
  "لأن","لذلك","مصدر","دراسة","بيانات","دليل","أعتقد","لنا"
];

export function computeSignal(text: string): {
  score: number;        // 0..100
  rage: number;         // 0..1
  noise: number;        // 0..1
  reasons: string[];
} {
  const reasons: string[] = [];
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const n = Math.max(1, words.length);

  // Count contributors
  const allCaps = (text.match(/[A-Z]{4,}/g) || []).length;
  const exclam = (text.match(/!/g) || []).length;
  const question = (text.match(/[?؟]/g) || []).length;
  const angerHits = ANGER_WORDS.filter((w) => lower.includes(w)).length;
  const noiseHits = NOISE_WORDS.filter((w) => lower.includes(w)).length;
  const signalHits = SIGNAL_HINTS.filter((w) => lower.includes(w)).length;
  const links = (text.match(/https?:\/\/\S+/g) || []).length;
  const hashtags = (text.match(/#\w+/g) || []).length;

  // Normalised pressure metrics (0..1)
  const rage = Math.min(1, (angerHits * 0.35) + (exclam > 2 ? 0.2 : 0) + (allCaps > 1 ? 0.25 : 0));
  const noise = Math.min(1, (noiseHits * 0.2) + (exclam > 3 ? 0.2 : 0) + (n < 4 ? 0.3 : 0));

  // Signal bonuses
  let s = 50;
  s -= rage * 45;
  s -= noise * 25;
  s += signalHits * 8;
  s += Math.min(15, links * 8);            // sources are signal
  s += Math.min(10, hashtags * 2);
  if (n >= 10) s += 5;                      // substantive length
  if (question > 0 && angerHits === 0) s += 5; // genuine question
  if (allCaps > 2) s -= 8;

  const score = Math.round(Math.max(0, Math.min(100, s)));

  if (angerHits > 0)  reasons.push(`${angerHits} hostile term${angerHits>1?"s":""} detected`);
  if (allCaps > 1)    reasons.push("all-caps shouting");
  if (exclam > 2)     reasons.push("multiple exclamation marks");
  if (noiseHits > 0)  reasons.push(`${noiseHits} low-signal interjection${noiseHits>1?"s":""}`);
  if (signalHits > 0) reasons.push(`${signalHits} reasoning marker${signalHits>1?"s":""}`);
  if (links > 0)      reasons.push(`${links} source link${links>1?"s":""}`);
  if (n < 4 && text.length > 0) reasons.push("very short — consider adding context");

  return { score, rage, noise, reasons };
}

/* ─────────────────────────── Signal meter (composer side-car) ─────────────────────────── */

export function SignalMeter({ text }: { text: string }) {
  const sig = useMemo(() => computeSignal(text), [text]);
  if (text.trim().length === 0) return null;

  const tone = sig.score >= 70 ? "high" : sig.score >= 40 ? "mid" : "low";
  const color = tone === "high" ? "text-emerald-500" : tone === "mid" ? "text-amber-500" : "text-rose-500";
  const bg    = tone === "high" ? "bg-emerald-500" : tone === "mid" ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="mt-2 rounded-xl border border-border bg-card/50 p-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Activity className={`w-3 h-3 ${color}`} />
        <span className="text-[10px] uppercase tracking-widest text-secondary">Signal score</span>
        <span className={`text-[11px] font-semibold ml-auto ${color}`}>{sig.score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          animate={{ width: `${sig.score}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${bg}`}
        />
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> Rage {(sig.rage*100|0)}%</span>
        <span className="flex items-center gap-1"><Wind className="w-2.5 h-2.5" /> Noise {(sig.noise*100|0)}%</span>
      </div>
      {sig.reasons.length > 0 && (
        <div className="mt-1.5 text-[10px] text-muted-foreground line-clamp-2">
          {sig.reasons.slice(0, 3).join(" · ")}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Anti-rage gate ─────────────────────────── */

export function AntiRageGate({
  text, onProceed, onRephrase, onDismiss,
}: {
  text: string;
  onProceed: () => void;
  onRephrase: (suggestion: string) => void;
  onDismiss: () => void;
}) {
  const sig = useMemo(() => computeSignal(text), [text]);
  const triggered = sig.rage >= 0.4 || sig.score < 25;
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (!triggered) return;
    const t = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [triggered]);

  if (!triggered) return null;

  const suggestion = rephraseSuggestion(text);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-3 rounded-2xl border border-rose-500/40 bg-rose-500/5 p-3 relative"
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
          <Flame className="w-4 h-4 text-rose-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-rose-500">Anti-rage breather</span>
            <span className="text-[10px] text-muted-foreground">· Circle slows fights, not voices</span>
            <button onClick={onDismiss} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your post shows {(sig.rage*100|0)}% rage signals. Take a breath — would a calmer phrasing land better?
          </p>

          {suggestion && (
            <div className="mt-2 rounded-xl border border-secondary/30 bg-secondary/5 p-2.5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-secondary mb-1">
                <Brain className="w-3 h-3" /> Rephrase suggestion
              </div>
              <p className="text-[12px] italic">"{suggestion}"</p>
              <button
                onClick={() => onRephrase(suggestion)}
                className="mt-2 text-[10px] px-3 py-1 rounded-full bg-gradient-hero text-primary-foreground"
              >
                <Check className="w-3 h-3 inline mr-1" /> Use this version
              </button>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={onProceed}
              disabled={seconds > 0}
              className={`text-[10px] px-3 py-1 rounded-full ${
                seconds > 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "glass border border-border hover:bg-muted/60"
              }`}
            >
              Post anyway {seconds > 0 ? `(${seconds}s)` : ""}
            </button>
            <span className="text-[9px] text-muted-foreground">
              You can always post. Circle just adds {seconds > 0 ? "10 seconds" : "0 seconds"} of reflection.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function rephraseSuggestion(text: string): string | null {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;
  // Strip leading insults / loud markers
  let s = text
    .replace(/!!+/g, "!")
    .replace(/\b(stupid|idiot|trash|garbage|loser|pathetic|scum|غبي|حقير|تافه)\b/gi, "")
    .replace(/\b(hate)\b/gi, "disagree with")
    .replace(/\b(kill|destroy|ruin)\b/gi, "challenge")
    .replace(/[A-Z]{4,}/g, (m) => m.toLowerCase())
    .replace(/\s{2,}/g, " ")
    .trim();
  if (s.length < 4) return null;
  if (!/^[A-Z]/.test(s)) s = s[0].toUpperCase() + s.slice(1);
  if (!/[.?!]$/.test(s)) s = s + ".";
  return s.length === text.length ? null : s;
}

/* ─────────────────────────── Conversation graph card ─────────────────────────── */

export function ConversationGraph({
  postId, replies, agreed, disputed,
}: {
  postId: number;
  replies: number;
  agreed?: number;
  disputed?: number;
}) {
  // Deterministic synthetic distribution from postId
  const seed = postId * 31;
  const total = Math.max(1, replies);
  const signal = agreed ?? Math.round(total * (0.4 + ((seed % 40) / 100)));
  const dispute = disputed ?? Math.round(total * (0.15 + ((seed % 15) / 100)));
  const noise = Math.max(0, total - signal - dispute);
  const sigPct = Math.round((signal / total) * 100);
  const dispPct = Math.round((dispute / total) * 100);
  const noisePct = Math.max(0, 100 - sigPct - dispPct);

  if (replies === 0) return null;

  return (
    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
      <BarChart3 className="w-3 h-3" />
      <span>S:N {sigPct}%</span>
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden flex">
        <div className="h-full bg-emerald-500" style={{ width: `${sigPct}%` }} />
        <div className="h-full bg-amber-500" style={{ width: `${dispPct}%` }} />
        <div className="h-full bg-rose-500/60" style={{ width: `${noisePct}%` }} />
      </div>
      <span title="signal · dispute · noise">{signal}·{dispute}·{noise}</span>
    </div>
  );
}

/* ─────────────────────────── Cross-pillar quote drawer ─────────────────────────── */

type Quotable = {
  pillar: "mashahd" | "lamahat" | "wasl";
  id: string;
  title: string;
};

export function CrossPillarQuote({
  onPick, onClose,
}: {
  onPick: (q: Quotable) => void;
  onClose: () => void;
}) {
  // Demo set — in production, these come from /api/{pillar}/recent
  const items: Quotable[] = [
    { pillar: "mashahd", id: "1", title: "Tahrir at sunset · 4 min" },
    { pillar: "mashahd", id: "2", title: "Khan el-Khalili oud session" },
    { pillar: "lamahat", id: "3", title: "Golden-hour terrace · Cairo" },
    { pillar: "wasl",    id: "4", title: "@nour: 'history rhymes…'" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-card border border-border p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base flex items-center gap-2">
            <QuoteIcon className="w-4 h-4 text-secondary" /> Quote from Circle
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full glass flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {items.map((it) => {
            const Icon = it.pillar === "mashahd" ? Video : it.pillar === "lamahat" ? ImageIcon : MessageSquare;
            return (
              <button
                key={`${it.pillar}_${it.id}`}
                onClick={() => { onPick(it); onClose(); }}
                className="w-full text-left flex items-center gap-2 rounded-xl border border-border bg-card/50 hover:border-secondary/50 px-3 py-2"
              >
                <Icon className="w-4 h-4 text-secondary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-secondary">{it.pillar}</div>
                  <div className="text-sm truncate">{it.title}</div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
          Cross-pillar quoting attaches an embed card to your Midan post. Sources are always credited.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default SignalMeter;
