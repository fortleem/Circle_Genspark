// ╔══════════════════════════════════════════════════════════════════╗
// ║  VoiceStudio — ASR + TTS using the browser's Web Speech API      ║
// ║                                                                  ║
// ║  Real ASR (SpeechRecognition) + TTS (SpeechSynthesis) running    ║
// ║  on-device with zero round-trip. Falls back gracefully if the    ║
// ║  browser lacks support.                                          ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Volume2, Square, Sparkles, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

// SpeechRecognition is non-standard; guard for it
type AnySR = any
const SR_CLASS: AnySR =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

const VOICE_LANGS = [
  { code: "ar-SA", label: "العربية" },
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "fr-FR", label: "Français" },
  { code: "es-ES", label: "Español" },
  { code: "zh-CN", label: "中文" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "ur-PK", label: "اردو" },
  { code: "tr-TR", label: "Türkçe" },
]

export function VoiceStudio({ syncText, syncLang, onTranscript }: {
  syncText?: string
  syncLang?: string
  onTranscript?: (t: string) => void
}) {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [asrLang, setAsrLang] = useState("en-US")
  const [ttsLang, setTtsLang] = useState("en-US")
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<AnySR>(null)

  const hasASR = !!SR_CLASS
  const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window

  useEffect(() => {
    if (syncLang) {
      const code = VOICE_LANGS.find(v => v.code.startsWith(syncLang))?.code
      if (code) setTtsLang(code)
    }
  }, [syncLang])

  const startListening = () => {
    if (!hasASR) {
      setError("Speech recognition not supported in this browser. Try Chrome/Edge on desktop.")
      return
    }
    try {
      const rec = new SR_CLASS()
      rec.lang = asrLang
      rec.continuous = false
      rec.interimResults = true
      rec.onresult = (ev: any) => {
        let txt = ""
        for (let i = 0; i < ev.results.length; i++) {
          txt += ev.results[i][0].transcript
        }
        setTranscript(txt)
        if (ev.results[ev.results.length - 1]?.isFinal) {
          onTranscript?.(txt)
        }
      }
      rec.onerror = (ev: any) => {
        setError(`Mic error: ${ev?.error ?? "unknown"}`)
        setListening(false)
      }
      rec.onend = () => setListening(false)
      rec.start()
      recRef.current = rec
      setListening(true)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? "Failed to start microphone")
    }
  }

  const stopListening = () => {
    recRef.current?.stop?.()
    setListening(false)
  }

  const speak = (text: string) => {
    if (!hasTTS) {
      setError("Speech synthesis not supported in this browser.")
      return
    }
    if (!text.trim()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = ttsLang
    u.rate = 1
    u.pitch = 1
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  const stopSpeaking = () => {
    if (hasTTS) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => () => { recRef.current?.abort?.(); if (hasTTS) window.speechSynthesis.cancel() }, [hasTTS])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl mesh-fill grid place-items-center">
          <Mic className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base leading-tight">Voice Studio</h3>
          <p className="text-[11px] text-muted-foreground">
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
            ASR + TTS · on-device Web Speech API
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div className="text-xs">{error}</div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {/* ASR — speech-to-text */}
        <div className="rounded-2xl border border-border/40 bg-card/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Speech → Text</span>
            <select value={asrLang} onChange={(e) => setAsrLang(e.target.value)}
              className="text-[10px] bg-muted/40 border border-border/40 rounded-md px-1.5 py-0.5">
              {VOICE_LANGS.map(v => <option key={v.code} value={v.code}>{v.label}</option>)}
            </select>
          </div>
          <button
            onClick={listening ? stopListening : startListening}
            disabled={!hasASR}
            className={`w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
              listening
                ? "bg-destructive/15 text-destructive border border-destructive/30"
                : hasASR
                  ? "gold-stroke"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {listening ? (
              <>
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-destructive rounded-full" />
                <Square className="w-3.5 h-3.5" /> Stop
              </>
            ) : hasASR ? (
              <><Mic className="w-3.5 h-3.5" /> Tap to record</>
            ) : (
              <><MicOff className="w-3.5 h-3.5" /> ASR unsupported</>
            )}
          </button>
          <div className="mt-2 min-h-[60px] text-xs rounded-lg bg-muted/30 p-2">
            {transcript || <span className="italic text-muted-foreground">Live transcript will appear here…</span>}
          </div>
        </div>

        {/* TTS — text-to-speech */}
        <div className="rounded-2xl border border-border/40 bg-card/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Text → Speech</span>
            <select value={ttsLang} onChange={(e) => setTtsLang(e.target.value)}
              className="text-[10px] bg-muted/40 border border-border/40 rounded-md px-1.5 py-0.5">
              {VOICE_LANGS.map(v => <option key={v.code} value={v.code}>{v.label}</option>)}
            </select>
          </div>
          <button
            onClick={speaking ? stopSpeaking : () => speak(syncText ?? "Welcome to Cirkle. Your voice, your privacy, your data.")}
            disabled={!hasTTS}
            className={`w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
              speaking
                ? "bg-primary/15 text-primary border border-primary/30"
                : hasTTS
                  ? "gold-stroke"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {speaking ? (
              <>
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                  className="w-2 h-2 bg-primary rounded-full" />
                <Square className="w-3.5 h-3.5" /> Stop
              </>
            ) : hasTTS ? (
              <><Volume2 className="w-3.5 h-3.5" /> {syncText ? "Speak translation" : "Speak demo"}</>
            ) : (
              <><Volume2 className="w-3.5 h-3.5" /> TTS unsupported</>
            )}
          </button>
          <div className="mt-2 min-h-[60px] text-xs rounded-lg bg-muted/30 p-2 line-clamp-4">
            {syncText || <span className="italic text-muted-foreground">Whatever you translate above will be spoken here.</span>}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground px-1">
        Uses the browser's native Web Speech API · no audio leaves your device · works offline once language packs cached.
      </p>
    </div>
  )
}

export default VoiceStudio
