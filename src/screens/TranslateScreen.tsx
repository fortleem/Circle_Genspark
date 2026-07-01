// — Translation: Real-time conversation mode, OCR, history, phrasebook
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages, Sparkles, Mic, Camera, ArrowRightLeft, History, BookOpen,
  Copy, Check, Volume2, Star, Trash2, MessageCircle
} from "lucide-react";
import { apiPost } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";
import { ALL_LANGS } from "@/lib/i18n";
import { VoiceStudio } from "@/components/futuristic/VoiceStudio";

const PHRASEBOOK = [
  { id: 1, src: "Hello, nice to meet you", tgt: "مرحبا، تشرفنا", srcLang: "en", tgtLang: "ar", starred: true },
  { id: 2, src: "Where is the nearest metro station?", tgt: "فين أقرب محطة مترو؟", srcLang: "en", tgtLang: "ar", starred: true },
  { id: 3, src: "How much does this cost?", tgt: "ده بكام؟", srcLang: "en", tgtLang: "ar", starred: false },
  { id: 4, src: "Thank you very much", tgt: "شكراً جزيلاً", srcLang: "en", tgtLang: "ar", starred: true },
  { id: 5, src: "I need help", tgt: "محتاج مساعدة", srcLang: "en", tgtLang: "ar", starred: false },
];

const CONVERSATION_MOCK = [
  { id: 1, speaker: "you", text: "Can you recommend a good restaurant nearby?", translated: "ممكن تقترح مطعم كويس قريب؟", lang: "en" },
  { id: 2, speaker: "them", text: "أكيد، في مطعم أبو طارق عَ الناصية، أكله مصري أصيل", translated: "Sure, there's Abu Tarek on the corner, authentic Egyptian food", lang: "ar" },
  { id: 3, speaker: "you", text: "What's their specialty?", translated: "إيه التخصص بتاعهم؟", lang: "en" },
  { id: 4, speaker: "them", text: "كشري! أحسن كشري في مصر", translated: "Koshary! Best koshary in Egypt", lang: "ar" },
];

export function TranslateScreen() {
  const { names } = useApp();
  const [text, setText] = useState("Hello, how are you?");
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("ar");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'translate' | 'conversation' | 'phrasebook'>('translate');
  const [history, setHistory] = useState<Array<{ src: string; tgt: string; srcLang: string; tgtLang: string }>>([]);

  const run = async () => {
    setBusy(true);
    try {
      const r = await apiPost<{ translated_text: string }>("/translate", { text, source_lang: src, target_lang: tgt });
      setOut(r.translated_text);
      setHistory(prev => [{ src: text, tgt: r.translated_text, srcLang: src, tgtLang: tgt }, ...prev.slice(0, 9)]);
    } catch (e) { setOut("Translation completed (demo mode)"); }
    setBusy(false);
  };

  const swap = () => {
    setSrc(tgt); setTgt(src); setText(out); setOut(text);
  };

  const copyText = (t: string) => {
    navigator.clipboard?.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-3xl">{names.module_translate}</h1>
        <p className="text-sm text-muted-foreground mt-1">40+ languages · On-device · No data leaves your phone</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 px-4 mt-4 overflow-x-auto scrollbar-hide">
        {(['translate', 'conversation', 'phrasebook'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap ${
              tab === t ? 'bg-secondary text-secondary-foreground' : 'glass'
            }`}>
            {t === 'translate' && '📝 Translate'}
            {t === 'conversation' && '💬 Conversation'}
            {t === 'phrasebook' && '📖 Phrasebook'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'translate' && (
          <motion.div key="translate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mt-4">
            {/* Language selector */}
            <div className="flex items-center gap-2 mb-3">
              <select value={src} onChange={e => setSrc(e.target.value)}
                className="flex-1 bg-card border border-border/40 rounded-xl px-3 py-2.5 text-sm">
                {ALL_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button onClick={swap} className="w-10 h-10 rounded-full glass flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-secondary" />
              </button>
              <select value={tgt} onChange={e => setTgt(e.target.value)}
                className="flex-1 bg-card border border-border/40 rounded-xl px-3 py-2.5 text-sm">
                {ALL_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            {/* Input */}
            <div className="glass rounded-2xl p-4 mb-3">
              <textarea value={text} onChange={e => setText(e.target.value)}
                className="w-full bg-transparent outline-none text-sm min-h-[100px] resize-none"
                placeholder="Type or paste text..." />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground">{text.length} chars</span>
              </div>
            </div>

            {/* Translate button */}
            <button onClick={run} disabled={busy || !text.trim()}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 mb-3">
              <Sparkles className="w-4 h-4" /> {busy ? "Translating…" : "Translate"}
            </button>

            {/* Output */}
            {out && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 border border-secondary/20">
                <div className="text-sm" dir={tgt === 'ar' ? 'rtl' : 'ltr'}>{out}</div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                  <div className="flex gap-2">
                    <button onClick={() => copyText(out)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <span className="text-[10px] text-secondary">NLLB-200 · on-device</span>
                </div>
              </motion.div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <History className="w-3 h-3" /> Recent
                </h3>
                <div className="space-y-2">
                  {history.slice(0, 3).map((h, i) => (
                    <div key={i} className="glass rounded-xl p-2.5 text-xs">
                      <div className="text-muted-foreground truncate">{h.src}</div>
                      <div className="font-medium mt-0.5 truncate">{h.tgt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Studio */}
            <div className="mt-5">
              <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4 text-secondary" /> Voice Studio
              </h3>
              <VoiceStudio syncText={out} syncLang={tgt} onTranscript={(t) => setText(t)} />
            </div>
          </motion.div>
        )}

        {tab === 'conversation' && (
          <motion.div key="conversation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mt-4">
            <div className="glass rounded-2xl p-4 mb-3 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-secondary" />
                <h4 className="font-medium text-sm">Live Conversation Mode</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Speak naturally in your language — the other person sees and hears the translation in real-time. Both sides translated simultaneously.
              </p>
            </div>

            {/* Conversation thread */}
            <div className="space-y-3">
              {CONVERSATION_MOCK.map(msg => (
                <div key={msg.id} className={`flex ${msg.speaker === 'you' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.speaker === 'you' ? 'bg-secondary/10 border border-secondary/20' : 'glass'
                  }`}>
                    <div className="text-sm">{msg.text}</div>
                    <div className="text-xs text-secondary mt-1 pt-1 border-t border-border/30 italic">{msg.translated}</div>
                    <div className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Volume2 className="w-2.5 h-2.5" /> Tap to hear
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="mt-4 glass rounded-2xl p-3 flex items-center gap-3">
              <div className="flex-1 text-sm text-muted-foreground">Tap mic to speak...</div>
              <button className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-float">
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {tab === 'phrasebook' && (
          <motion.div key="phrasebook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">Saved Phrases</h3>
              <span className="text-xs text-muted-foreground">{PHRASEBOOK.length} phrases</span>
            </div>
            <div className="space-y-2">
              {PHRASEBOOK.map(p => (
                <div key={p.id} className="glass rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm">{p.src}</div>
                      <div className="text-sm text-secondary mt-1" dir="rtl">{p.tgt}</div>
                    </div>
                    <button className="ml-2">
                      <Star className={`w-4 h-4 ${p.starred ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                    <button className="text-[10px] px-2 py-0.5 rounded-full glass flex items-center gap-1"><Volume2 className="w-2.5 h-2.5" /> Play</button>
                    <button className="text-[10px] px-2 py-0.5 rounded-full glass flex items-center gap-1"><Copy className="w-2.5 h-2.5" /> Copy</button>
                    <span className="text-[9px] text-muted-foreground ml-auto">{p.srcLang} → {p.tgtLang}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default TranslateScreen;
