// §24 Universal Translation Layer — NLLB-200 + Whisper + Piper + PaddleOCR
import type { Context } from 'hono'
import type { Env } from '../db'
import { getNames } from '../i18n'

export async function translatePage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)

  const langs = [
    { code: 'en', name: 'English' }, { code: 'ar', name: 'العربية' }, { code: 'zh', name: '中文' },
    { code: 'fr', name: 'Français' }, { code: 'es', name: 'Español' }, { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' }, { code: 'pt', name: 'Português' }, { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },   { code: 'ru', name: 'Русский' }, { code: 'tr', name: 'Türkçe' },
    { code: 'hi', name: 'हिन्दी' },    { code: 'sw', name: 'Kiswahili' },{ code: 'yo', name: 'Yorùbá' }
  ]

  const modalities = [
    { icon: 'fa-keyboard',           name: 'Text → Text',          model: 'NLLB-200 600M (distilled)', stack: 'On-device (1.5 GB int8)', langs: '200+' },
    { icon: 'fa-microphone',         name: 'Speech → Text',        model: 'Whisper tiny / base',       stack: 'whisper.cpp (FFI)',        langs: '100+' },
    { icon: 'fa-volume-high',        name: 'Text → Speech',        model: 'Piper / KittenTTS / NeuTTS',stack: 'On-device voice packs',    langs: '40+'  },
    { icon: 'fa-headphones',         name: 'Speech → Speech',      model: 'ASR → NLLB → TTS pipeline', stack: '3–6 s on mid-range phones',langs: 'Dozens' },
    { icon: 'fa-image',              name: 'Image OCR → Translate',model: 'PaddleOCR + NLLB',           stack: 'On-device only',           langs: '80+'  }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§24 · No language left behind</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_translate}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">200+ languages on your device. No API keys. No usage caps. No billing details. Real-time speech-to-speech, image OCR translation, multilingual smart-replies in Wasl, and Lamahat captions in your reader's language.</p>
      </header>

      <section>
        <h2 class="section-title font-display text-2xl mb-4">Modalities</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fade-in-stagger">
          {modalities.map(m => (
            <div class="pillar-card p-5">
              <span class="avatar avatar-md mb-3"><i class={`fas ${m.icon}`}></i></span>
              <div class="font-semibold">{m.name}</div>
              <div class="text-[11px] mt-1" style="color: var(--muted);">{m.model}</div>
              <div class="mt-3 text-[11px] flex flex-wrap gap-1">
                <span class="chip text-[10px]"><i class="fas fa-mobile-screen"></i> {m.stack}</span>
                <span class="chip text-[10px]"><i class="fas fa-globe"></i> {m.langs}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live translator */}
      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Try it</h2>
          <span class="text-xs" style="color: var(--muted);">In production: runs entirely on-device. This demo hits a stub endpoint.</span>
        </div>
        <form id="translate-form" class="pillar-card p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label class="block">
              <span class="text-xs font-semibold" style="color: var(--muted);">From</span>
              <select name="from" class="select mt-1">
                <option value="auto">Auto-detect</option>
                {langs.map(l => <option value={l.code}>{l.name}</option>)}
              </select>
            </label>
            <label class="block md:col-span-1">
              <span class="text-xs font-semibold" style="color: var(--muted);">To</span>
              <select name="to" class="select mt-1">
                {langs.map(l => <option value={l.code} selected={l.code === 'ar'}>{l.name}</option>)}
              </select>
            </label>
            <label class="block md:col-span-1">
              <span class="text-xs font-semibold" style="color: var(--muted);">Modality</span>
              <select class="select mt-1" disabled>
                <option>Text → Text (active)</option>
                <option>Speech → Speech</option>
                <option>Image OCR</option>
              </select>
            </label>
          </div>
          <textarea name="text" rows={4} placeholder="Type anything in any language…" class="textarea" required>Welcome to Circle — one app, every life, free forever.</textarea>
          <div class="flex items-center gap-3">
            <button class="btn btn-primary"><i class="fas fa-language"></i> Translate</button>
            <span class="text-xs flex items-center gap-1" style="color: var(--muted);"><i class="fas fa-shield-halved text-gold"></i> Source text never leaves the device.</span>
          </div>
          <div id="translate-output" class="glass p-4 rounded-xl min-h-[60px] text-sm">→ Click translate to see the on-device NLLB-200 output.</div>
        </form>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="pillar-card p-5">
          <i class="fas fa-users text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Family across continents</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">The Hassan family — Cairo / Paris / Berlin — sets a preferred language per member. Aya posts in Arabic; Omar reads it in French; Tante Hélène's voice notes are transcribed, translated, and read aloud to Lukas while he drives. <strong>Cost to Circle: $0.</strong></p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-cogs text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Smart routing</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">If the language pair is on-device → local. Battery &lt;10% with opt-in → server. No internet → local. Privacy mode → local only, no exceptions. You decide the policy, the app obeys.</p>
        </div>
      </section>
    </div>,
    { title: n.module_translate, lang, country, active: 'translate' }
  )
}
