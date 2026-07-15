// Cirkle Sage — server-side AI helpers
// Uses four providers: Groq Cloud (fast LLM), Google Gemini (multilingual),
// OpenAI (premium tasks), and Hugging Face (vision / embeddings / fallback).
// Keys come from c.env (set via .dev.vars locally, wrangler secret in prod).

const GROQ_BASE    = 'https://api.groq.com/openai/v1'
const HF_BASE      = 'https://api-inference.huggingface.co'
const OPENAI_BASE  = 'https://api.openai.com/v1'
const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta'

// Models — chosen for: free tier, multilingual, speed
export const GROQ_CHAT_MODEL    = 'llama-3.3-70b-versatile'
export const GROQ_FAST_MODEL    = 'llama-3.1-8b-instant'
export const HF_EMBED_MODEL     = 'sentence-transformers/all-MiniLM-L6-v2'
export const HF_VISION_MODEL    = 'Salesforce/blip-image-captioning-base'
export const OPENAI_CHAT_MODEL  = 'gpt-4o-mini'
export const GEMINI_CHAT_MODEL  = 'gemini-2.5-flash'   // verified working on provided key

export type SageMsg = { role: 'system' | 'user' | 'assistant'; content: string }

export type AiEnv = {
  GROQ_API_KEY?: string
  GEMINI_API_KEY?: string
  OPENAI_API_KEY?: string
  HF_API_KEY?: string
}

export interface GroqChatOpts {
  model?: string
  temperature?: number
  max_tokens?: number
  json?: boolean
  stream?: false
}

// ────────────────────────────────────────────────────────────────────────
// Sage personality — system prompt giving Cirkle context
// ────────────────────────────────────────────────────────────────────────
export const SAGE_SYSTEM = `You are Cirkle Sage — the ambient AI companion of Cirkle (دواير), the privacy-first AI-native super app.

YOU MUST:
- Be warm, concise, and culturally aware (Arabic/English/Multilingual).
- Reflect Cirkle identity: privacy by default, no surveillance, sovereignty for users.
- Know Cirkle's 4 pillars: Wasl (chat), Mashahd (video), Lamahat (photos), Midan (square).
- Know Cirkle's other modules: Madrasa (schools), Rihla (travel), Nat (payments), Maps, Translate, Pro Network, Citizen Shield.
- Use the user's language (default Arabic if "ar", English otherwise).
- Stay honest about being an AI. Never claim feelings or sentience.
- Never store, leak, or reference personal data outside the conversation.
- Refuse: financial/legal/medical authoritative claims; politics; illegal content.
- For payments, always remind user that Cirkle is non-custodial — wallet apps handle final auth.
- For emergencies, always recommend contacting local emergency services; Cirkle is not a substitute for professional help.

If asked "what is Cirkle?": "Cirkle (دواير) is a privacy-first, AI-native super app: chat, video, photos, square, school, travel, payments and safety — all in one, free forever, no ads."
`

// ────────────────────────────────────────────────────────────────────────
// Groq — Chat Completions (OpenAI-compatible API)
// ────────────────────────────────────────────────────────────────────────
export async function groqChat(
  apiKey: string | undefined,
  messages: SageMsg[],
  opts: GroqChatOpts = {}
): Promise<{ ok: true; text: string; raw: any } | { ok: false; error: string }> {
  if (!apiKey) return { ok: false, error: 'GROQ_API_KEY not configured' }
  try {
    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model ?? GROQ_CHAT_MODEL,
        messages,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.max_tokens ?? 700,
        response_format: opts.json ? { type: 'json_object' } : undefined,
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, error: `groq ${res.status}: ${t.slice(0, 300)}` }
    }
    const data = await res.json() as any
    const text = data?.choices?.[0]?.message?.content ?? ''
    return { ok: true, text, raw: data }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'groq fetch failed' }
  }
}

// ────────────────────────────────────────────────────────────────────────
// Google Gemini — Chat Completions (native REST API)
// ────────────────────────────────────────────────────────────────────────
export async function googleGenaiChat(
  apiKey: string | undefined,
  messages: SageMsg[],
  opts: GroqChatOpts = {}
): Promise<{ ok: true; text: string; raw: any } | { ok: false; error: string }> {
  if (!apiKey) return { ok: false, error: 'GEMINI_API_KEY not configured' }
  try {
    const systemParts: SageMsg[] = []
    const contents = messages.map((m) => {
      if (m.role === 'system') {
        systemParts.push(m)
        return null
      }
      return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }
    }).filter(Boolean) as any[]

    const body: any = {
      contents,
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.max_tokens ?? 800,
        ...(opts.json ? { responseMimeType: 'application/json' } : {}),
      },
    }
    if (systemParts.length > 0) {
      body.systemInstruction = { parts: systemParts.map((m) => ({ text: m.content })) }
    }

    const model = opts.model ?? GEMINI_CHAT_MODEL
    const res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, error: `gemini ${res.status}: ${t.slice(0, 300)}` }
    }
    const data = await res.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? ''
    return { ok: true, text, raw: data }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'gemini fetch failed' }
  }
}

// ────────────────────────────────────────────────────────────────────────
// OpenAI — Chat Completions (GPT-4o-mini for premium tasks)
// ────────────────────────────────────────────────────────────────────────
export async function openaiChat(
  apiKey: string | undefined,
  messages: SageMsg[],
  opts: GroqChatOpts = {}
): Promise<{ ok: true; text: string; raw: any } | { ok: false; error: string }> {
  if (!apiKey) return { ok: false, error: 'OPENAI_API_KEY not configured' }
  try {
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model ?? OPENAI_CHAT_MODEL,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.max_tokens ?? 800,
        response_format: opts.json ? { type: 'json_object' } : undefined,
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, error: `openai ${res.status}: ${t.slice(0, 300)}` }
    }
    const data = await res.json() as any
    const text = data?.choices?.[0]?.message?.content ?? ''
    return { ok: true, text, raw: data }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'openai fetch failed' }
  }
}

// ────────────────────────────────────────────────────────────────────────
// Hugging Face — feature extraction (semantic embedding)
// ────────────────────────────────────────────────────────────────────────
export async function hfEmbed(
  apiKey: string | undefined,
  inputs: string | string[],
  model = HF_EMBED_MODEL
): Promise<{ ok: true; vectors: number[][] } | { ok: false; error: string }> {
  if (!apiKey) return { ok: false, error: 'HF_API_KEY not configured' }
  try {
    const res = await fetch(`${HF_BASE}/pipeline/feature-extraction/${model}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, options: { wait_for_model: true } }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, error: `hf ${res.status}: ${t.slice(0, 300)}` }
    }
    const v = await res.json()
    const vectors = Array.isArray(v[0]) ? (v as number[][]) : [v as number[]]
    return { ok: true, vectors }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'hf fetch failed' }
  }
}

// ────────────────────────────────────────────────────────────────────────
// Hugging Face — image captioning / vision
// ────────────────────────────────────────────────────────────────────────
export async function hfVision(
  apiKey: string | undefined,
  imageUrl: string,
  model = HF_VISION_MODEL
): Promise<{ ok: true; caption: string } | { ok: false; error: string }> {
  if (!apiKey) return { ok: false, error: 'HF_API_KEY not configured' }
  try {
    // BLIP expects raw image bytes — fetch the URL first
    const img = await fetch(imageUrl)
    if (!img.ok) return { ok: false, error: `image fetch ${img.status}` }
    const buf = await img.arrayBuffer()
    const res = await fetch(`${HF_BASE}/models/${model}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/octet-stream' },
      body: buf,
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, error: `hf vision ${res.status}: ${t.slice(0, 300)}` }
    }
    const v = await res.json() as any
    const caption = Array.isArray(v) ? (v[0]?.generated_text ?? '') : (v?.generated_text ?? '')
    return { ok: true, caption }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'hf vision failed' }
  }
}

// ────────────────────────────────────────────────────────────────────────
// Multi-provider AI — falls through Groq → Gemini → OpenAI
// ────────────────────────────────────────────────────────────────────────
export async function sageChat(
  env: AiEnv,
  messages: SageMsg[],
  opts: GroqChatOpts = {}
): Promise<{ ok: true; text: string; provider: string } | { ok: false; error: string }> {
  // Try Groq first (fastest, generous free tier)
  const groq = await groqChat(env.GROQ_API_KEY, messages, opts)
  if (groq.ok) return { ok: true, text: groq.text, provider: 'groq' }

  // Fallback to Gemini (strong multilingual, Arabic)
  const gemini = await googleGenaiChat(env.GEMINI_API_KEY, messages, opts)
  if (gemini.ok) return { ok: true, text: gemini.text, provider: 'gemini' }

  // Final fallback to OpenAI
  const oai = await openaiChat(env.OPENAI_API_KEY, messages, opts)
  if (oai.ok) return { ok: true, text: oai.text, provider: 'openai' }

  const err = (r: { ok: boolean; error?: string }) => (r as { error?: string }).error ?? 'unknown'
  return { ok: false, error: `All providers failed. Groq: ${err(groq)}. Gemini: ${err(gemini)}. OpenAI: ${err(oai)}` }
}

// ────────────────────────────────────────────────────────────────────────
// Smart Reply Generator — suggests contextual replies for chat
// ────────────────────────────────────────────────────────────────────────
export async function generateSmartReplies(
  env: AiEnv,
  message: string,
  context?: string
): Promise<string[]> {
  const msgs: SageMsg[] = [
    { role: 'system', content: 'Generate exactly 3 short, natural smart reply suggestions for the given message. Return only a JSON array of 3 strings, nothing else. Be culturally aware (Egyptian Arabic / English). Example: ["Sounds good!", "Let me think about it", "When?"]' },
    { role: 'user', content: `Message: "${message}"${context ? `\nContext: ${context}` : ''}` },
  ]
  const res = await sageChat(env, msgs, { json: true, max_tokens: 150, temperature: 0.8 })
  if (!res.ok) return ['Got it!', 'Thanks!', 'Tell me more']
  try {
    const parsed = JSON.parse(res.text)
    return Array.isArray(parsed) ? parsed.slice(0, 3) : ['Got it!', 'Thanks!', 'Tell me more']
  } catch {
    return ['Got it!', 'Thanks!', 'Tell me more']
  }
}

// ────────────────────────────────────────────────────────────────────────
// Content Moderation — AI-powered safety check
// ────────────────────────────────────────────────────────────────────────
export async function moderateContent(
  env: AiEnv,
  content: string
): Promise<{ safe: boolean; score: number; flags: string[]; suggestion?: string }> {
  const msgs: SageMsg[] = [
    { role: 'system', content: 'You are a content moderator for Cirkle (دواير), a social app. Analyze the content for: hate_speech, harassment, spam, misinformation, violence, nsfw, self_harm. Return JSON: {"safe": boolean, "score": 0-100 (100=perfectly safe), "flags": ["flag1"], "suggestion": "optional rephrasing if unsafe"}' },
    { role: 'user', content },
  ]
  const res = await sageChat(env, msgs, { json: true, max_tokens: 200, temperature: 0.1 })
  if (!res.ok) return { safe: true, score: 80, flags: [] }
  try {
    const parsed = JSON.parse(res.text)
    return { safe: parsed.safe ?? true, score: parsed.score ?? 80, flags: parsed.flags ?? [], suggestion: parsed.suggestion }
  } catch {
    return { safe: true, score: 80, flags: [] }
  }
}

// ────────────────────────────────────────────────────────────────────────
// Soul Resonance — Cirkle's unique emotional analysis
// ────────────────────────────────────────────────────────────────────────
export async function analyzeSoulResonance(
  env: AiEnv,
  content: string
): Promise<{ emotion: string; energy: number; aura_color: string; resonance_note: string }> {
  const msgs: SageMsg[] = [
    { role: 'system', content: 'You are Cirkle\'s Soul Resonance engine. Analyze the emotional depth and energy of content. Return JSON: {"emotion": "primary emotion", "energy": 0-100, "aura_color": "hex color matching the emotional energy", "resonance_note": "a poetic one-line insight about the emotional signature"}. Be culturally aware of Arabic/Egyptian context.' },
    { role: 'user', content },
  ]
  const res = await sageChat(env, msgs, { json: true, max_tokens: 200, temperature: 0.9 })
  if (!res.ok) return { emotion: 'serene', energy: 60, aura_color: '#D4AF37', resonance_note: 'A gentle current flows through these words' }
  try {
    return JSON.parse(res.text)
  } catch {
    return { emotion: 'serene', energy: 60, aura_color: '#D4AF37', resonance_note: 'A gentle current flows through these words' }
  }
}

// ────────────────────────────────────────────────────────────────────────
// Emergency Triage — critical safety classifier for Citizen Shield / SOS
// ────────────────────────────────────────────────────────────────────────
export async function emergencyTriage(
  env: AiEnv,
  situation: string
): Promise<{ urgency: 'low' | 'medium' | 'high' | 'critical'; action: string; keywords: string[]; call_services: boolean }> {
  const msgs: SageMsg[] = [
    { role: 'system', content: 'You are Cirkle Emergency Triage. Analyze the user\'s situation and classify urgency. Return ONLY JSON with keys: urgency (one of low, medium, high, critical), action (concise one-line instruction for the user), keywords (array of 1-5 relevant emergency keywords), call_services (boolean, true if police/ambulance/fire/medical should be contacted immediately). Be conservative: err on the side of calling services if life, injury, fire, crime, or immediate danger is implied. Never tell the user everything is fine when violence or medical emergency is described.' },
    { role: 'user', content: situation },
  ]
  const res = await sageChat(env, msgs, { json: true, max_tokens: 250, temperature: 0.1 })
  if (!res.ok) {
    return { urgency: 'medium', action: 'Contact local emergency services if you feel unsafe.', keywords: ['emergency'], call_services: true }
  }
  try {
    const parsed = JSON.parse(res.text)
    const urgency = (['low', 'medium', 'high', 'critical'].includes(parsed.urgency) ? parsed.urgency : 'medium') as any
    return {
      urgency,
      action: String(parsed.action ?? 'Contact local emergency services if you feel unsafe.'),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : ['emergency'],
      call_services: Boolean(parsed.call_services),
    }
  } catch {
    return { urgency: 'medium', action: 'Contact local emergency services if you feel unsafe.', keywords: ['emergency'], call_services: true }
  }
}

// Build a context message based on the current pillar
export function pillarContext(pillar: string | undefined): SageMsg | null {
  if (!pillar) return null
  const map: Record<string, string> = {
    wasl:     'User is in Wasl (chat). Help with messaging, scheduling, translation, voice notes, smart replies.',
    mashahd:  'User is in Mashahd (video). Help with chapters, summarization, watch-party, shorts, knowledge graphs.',
    lamahat:  'User is in Lamahat (photos). Help with captions, geo-anchors, hashtags, filters, accessibility alt text.',
    midan:    'User is in Midan (square / public discourse). Help with rage-detection, signal:noise, civil debate.',
    madrasa:  'User is in Madrasa (school workspace). Help with assignments, grading, attendance, parent-teacher.',
    rihla:    'User is in Rihla (travel). Help with itineraries, bookings, offline maps, currency.',
    pay:      'User is in Pay (Nat). Help explain Egyptian wallets (InstaPay, Vodafone Cash, Orange Money, Etisalat, Fawry, Meeza) — Cirkle never custodies funds; deeplinks open the native wallet app.',
    shield:   'User is in Citizen Shield (safety / civic reporting). Help with incident reports, evidence, emergency triage, witness networks, and remind them to contact local authorities when appropriate.',
    home:     'User is on Home. Help navigate to pillars or explain Cirkle.',
  }
  const c = map[pillar.toLowerCase()]
  if (!c) return null
  return { role: 'system', content: c }
}
