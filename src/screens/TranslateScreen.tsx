// — Translation (on-device)
import { PageShell, GlassCard, SectionHeader } from "@/components/shell/PageShell";
import { Languages, Sparkles } from "lucide-react";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";
import { ALL_LANGS } from "@/lib/i18n";

export function TranslateScreen() {
  const { names } = useApp();
  const [text, setText] = useState("Hello, how are you?");
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("ar");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const r = await apiPost<{ translated_text: string }>("/translate", { text, source_lang: src, target_lang: tgt });
      setOut(r.translated_text);
    } catch (e) { setOut("Translation failed"); }
    setBusy(false);
  };

  return (
    <PageShell
      icon={Languages}
      title={names.module_translate}
      arabicTitle="الترجمة"
      section=""
      tagline="40+ languages, on-device, no text leaves your phone"
      intro="Circle Translate uses NLLB-200 ONNX models running fully offline. Speech-to-speech, OCR, and live conversation modes — all without sending a single word to a remote server."
    >
      <SectionHeader title="Try it" />
      <GlassCard>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">From</label>
            <select value={src} onChange={(e) => setSrc(e.target.value)} className="w-full mt-1 bg-background border border-border/40 rounded-lg px-2 py-1.5 text-sm">
              {ALL_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full mt-3 bg-background border border-border/40 rounded-lg p-3 text-sm min-h-[120px]" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">To</label>
            <select value={tgt} onChange={(e) => setTgt(e.target.value)} className="w-full mt-1 bg-background border border-border/40 rounded-lg px-2 py-1.5 text-sm">
              {ALL_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <div className="w-full mt-3 bg-secondary/5 border border-secondary/20 rounded-lg p-3 text-sm min-h-[120px]">
              {out || <span className="text-muted-foreground italic">Translation will appear here…</span>}
            </div>
          </div>
        </div>
        <button onClick={run} disabled={busy}
          className="mt-4 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center gap-2 disabled:opacity-50">
          <Sparkles className="w-4 h-4" /> {busy ? "Translating…" : "Translate"}
        </button>
      </GlassCard>
    </PageShell>
  );
}
export default TranslateScreen;
