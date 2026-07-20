// ═══════════════════════════════════════════════════════════════════════════
// Circle Brain AI — the central intelligence that orchestrates ALL features.
// Blueprint v12.0 §18 (Self-Learning AI Core) + §17 (AI Safety) + user mandate:
//   "Circle Brain AI that orchestrates all features and uses AI APIs to get
//    updates, orchestrate, get information from web search, and train itself."
//
// Capabilities:
//   1. INTENT ROUTER    — classifies every request → pillar/module/action
//   2. ORCHESTRATOR     — executes module actions (DRE, trending, payments…)
//                          and composes multi-module answers
//   3. WEB GROUNDING    — Gemini google_search tool for live information
//   4. SELF-LEARNING    — persists interactions, distils knowledge, recalls
//                          relevant memory into future prompts (D1-backed)
//   5. PROVIDER MESH    — Groq → Gemini → OpenAI → HF failover with health
//                          bookkeeping so the Brain always answers
// ═══════════════════════════════════════════════════════════════════════════
import type { D1Database } from '@cloudflare/workers-types'
import {
  groqChat, googleGenaiChat, openaiChat, sageChat,
  GROQ_FAST_MODEL, GEMINI_CHAT_MODEL,
  type SageMsg, type AiEnv,
} from './ai'
import { all, first, run } from './db'
import { configFor } from './dre'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export type BrainEnv = AiEnv & { DB: D1Database }

// ─────────────────────────────────────────────────────────────────────────
// Brain persona
// ─────────────────────────────────────────────────────────────────────────
export const BRAIN_SYSTEM = `You are Circle Brain (عقل دواير) — the central AI intelligence of Circle (دواير), the privacy-first AI-native super app.

You ORCHESTRATE every module of Circle:
- Wasl (وصل) chat · Mashahd (مشاهد) video · Lamahat (لمحات) photos · Midan (ميدان) public square
- The Circle groups · Official Channels · Creator Channels · Professional Network
- Madrasa education workspaces · Rihla travel · Nat payments (non-custodial) · Circle Verify identity
- Local Mesh offline network · Citizen Shield civic safety · Maps · Translate · Mail

RULES:
- Be warm, concise, culturally aware. Match the user's language (Arabic ⇄ English ⇄ any).
- Privacy first: never ask for or retain personal data beyond the conversation.
- When you used live web information, say so briefly.
- When an action belongs to a module, tell the user which module and what you did/found.
- Payments: Circle never custodies funds — native wallet apps confirm every transaction.
- Emergencies: always direct users to local emergency services (you know per-country numbers).
- Refuse illegal content, targeted harassment, and authoritative medical/legal/financial claims.`

// ─────────────────────────────────────────────────────────────────────────
// 1. INTENT ROUTER
// ─────────────────────────────────────────────────────────────────────────
export interface BrainIntent {
  intent: string          // e.g. 'chat', 'search_web', 'trending', 'payments', 'region_info', 'translate', 'navigate', 'emergency', 'summarize', 'moderate'
  module: string          // wasl | mashahd | lamahat | midan | pay | madrasa | rihla | shield | verify | mesh | maps | translate | home | brain
  needs_web: boolean      // requires live web information
  needs_data: boolean     // requires internal platform data (D1)
  lang: string            // detected language code
  entities: Record<string, string>
}

export async function classifyIntent(env: BrainEnv, text: string): Promise<BrainIntent> {
  const fallback: BrainIntent = { intent: 'chat', module: 'brain', needs_web: false, needs_data: false, lang: 'en', entities: {} }
  const r = await groqChat(env.GROQ_API_KEY, [
    { role: 'system', content: `Classify the user request for Circle super-app routing. Return ONLY JSON:
{"intent":"chat|search_web|trending|payments|region_info|translate|navigate|emergency|summarize|moderate|platform_stats",
 "module":"wasl|mashahd|lamahat|midan|pay|madrasa|rihla|shield|verify|mesh|maps|translate|home|brain",
 "needs_web":bool (true if answer requires CURRENT/live info: news, prices, weather, events, sports, recent releases),
 "needs_data":bool (true if it asks about Circle platform content: trends, posts, videos, groups, channels, stats),
 "lang":"ISO code of user language",
 "entities":{"country":"ISO2 if mentioned","topic":"...","target_lang":"..."}}` },
    { role: 'user', content: text.slice(0, 1500) },
  ], { model: GROQ_FAST_MODEL, json: true, temperature: 0, max_tokens: 200 })
  if (!r.ok) return fallback
  try {
    const p = JSON.parse(r.text)
    return {
      intent: p.intent ?? 'chat', module: p.module ?? 'brain',
      needs_web: !!p.needs_web, needs_data: !!p.needs_data,
      lang: p.lang ?? 'en', entities: p.entities ?? {},
    }
  } catch { return fallback }
}

// ─────────────────────────────────────────────────────────────────────────
// 2. WEB GROUNDING — Gemini google_search tool (live information)
// ─────────────────────────────────────────────────────────────────────────
export async function geminiWebSearch(
  apiKey: string | undefined,
  query: string,
  lang = 'en'
): Promise<{ ok: true; text: string; sources: Array<{ title: string; url: string }> } | { ok: false; error: string }> {
  if (!apiKey) return { ok: false, error: 'GEMINI_API_KEY not configured' }
  try {
    const res = await fetch(`${GEMINI_BASE}/models/${GEMINI_CHAT_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: query }] }],
        tools: [{ google_search: {} }],
        systemInstruction: { parts: [{ text: `Answer with fresh, factual information from search. Be concise. Reply in language: ${lang}.` }] },
        generationConfig: { temperature: 0.3, maxOutputTokens: 900 },
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, error: `gemini search ${res.status}: ${t.slice(0, 200)}` }
    }
    const data = await res.json() as any
    const cand = data?.candidates?.[0]
    const text = cand?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('') ?? ''
    const chunks = cand?.groundingMetadata?.groundingChunks ?? []
    const sources = chunks
      .map((ch: any) => ({ title: ch?.web?.title ?? '', url: ch?.web?.uri ?? '' }))
      .filter((s: any) => s.url)
      .slice(0, 5)
    return { ok: true, text, sources }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'gemini search failed' }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 3. SELF-LEARNING MEMORY (D1-backed)
//    - every interaction is logged (brain_interactions)
//    - distilled facts/preferences stored (brain_knowledge)
//    - relevant knowledge recalled into the prompt
// ─────────────────────────────────────────────────────────────────────────
export async function recallKnowledge(db: D1Database, userId: number | null, query: string): Promise<string[]> {
  try {
    // Cheap keyword recall (LIKE) — embeddings can upgrade this later
    const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3).slice(0, 5)
    if (words.length === 0) return []
    const clauses = words.map(() => 'lower(fact) LIKE ?').join(' OR ')
    const params = words.map((w) => `%${w}%`)
    const rows = await all<{ fact: string }>(db, `
      SELECT fact FROM brain_knowledge
      WHERE (user_id IS NULL ${userId ? 'OR user_id = ?' : ''}) AND (${clauses})
      ORDER BY confidence DESC, updated_at DESC LIMIT 5
    `, ...(userId ? [userId] : []), ...params)
    return rows.map((r) => r.fact)
  } catch { return [] }
}

export async function learnFromInteraction(
  env: BrainEnv, userId: number | null, userText: string, brainText: string
): Promise<void> {
  try {
    // Distil at most one durable fact per interaction (self-training loop)
    const r = await groqChat(env.GROQ_API_KEY, [
      { role: 'system', content: 'Extract ONE durable fact or user preference worth remembering from this exchange, if any. Return JSON {"fact":"..." or null,"confidence":0..1,"topic":"..."}. Only remember non-sensitive, useful facts (interests, preferences, corrections, domain facts). NEVER remember passwords, IDs, health, or financial details.' },
      { role: 'user', content: `USER: ${userText.slice(0, 800)}\nBRAIN: ${brainText.slice(0, 800)}` },
    ], { model: GROQ_FAST_MODEL, json: true, temperature: 0, max_tokens: 150 })
    if (!r.ok) return
    const p = JSON.parse(r.text)
    if (p?.fact && typeof p.fact === 'string' && p.fact.length > 8) {
      await run(env.DB, `
        INSERT INTO brain_knowledge (user_id, topic, fact, confidence)
        VALUES (?, ?, ?, ?)
      `, userId, String(p.topic ?? 'general').slice(0, 60), p.fact.slice(0, 500), Math.min(1, Math.max(0, Number(p.confidence ?? 0.6))))
    }
  } catch { /* learning is best-effort */ }
}

// ─────────────────────────────────────────────────────────────────────────
// 4. MODULE ORCHESTRATION — the Brain can pull live platform data
// ─────────────────────────────────────────────────────────────────────────
async function gatherPlatformContext(db: D1Database, intent: BrainIntent): Promise<string | null> {
  try {
    switch (intent.intent) {
      case 'trending': {
        const rows = await all(db, `
          SELECT hashtags, COUNT(*) n FROM posts
          WHERE hashtags IS NOT NULL AND created_at > datetime('now','-7 day')
          GROUP BY hashtags ORDER BY n DESC LIMIT 8
        `).catch(() => all(db, `SELECT content, likes FROM posts ORDER BY likes DESC LIMIT 5`))
        return rows.length ? `LIVE MIDAN TRENDS (internal data): ${JSON.stringify(rows).slice(0, 900)}` : null
      }
      case 'platform_stats': {
        const [u, p, v, g] = await Promise.all([
          first<{ n: number }>(db, 'SELECT COUNT(*) n FROM users'),
          first<{ n: number }>(db, 'SELECT COUNT(*) n FROM posts').catch(() => null),
          first<{ n: number }>(db, 'SELECT COUNT(*) n FROM videos').catch(() => null),
          first<{ n: number }>(db, 'SELECT COUNT(*) n FROM cirkles').catch(() => null),
        ])
        return `PLATFORM STATS: users=${u?.n ?? 0}, midan_posts=${p?.n ?? 0}, videos=${v?.n ?? 0}, cirkles=${g?.n ?? 0}`
      }
      case 'payments':
      case 'region_info': {
        const cc = (intent.entities.country ?? 'EG').toUpperCase()
        const cfg = configFor(cc)
        return `COUNTRY NODE ${cc} (${cfg.country_name}) — plane=${cfg.region}, currency=${cfg.currency}, lang=${cfg.language.default}, payments=${cfg.payments.map((p) => p.label).join(', ')}, emergency=${JSON.stringify(cfg.emergencyNumbers)}, compliance=${JSON.stringify(cfg.compliance)}`
      }
      case 'emergency': {
        const cc = (intent.entities.country ?? 'EG').toUpperCase()
        const cfg = configFor(cc)
        return `EMERGENCY NUMBERS for ${cfg.country_name}: police=${cfg.emergencyNumbers.police}, ambulance=${cfg.emergencyNumbers.ambulance}, fire=${cfg.emergencyNumbers.fire}`
      }
      default: return null
    }
  } catch { return null }
}

// ─────────────────────────────────────────────────────────────────────────
// 5. THE MAIN BRAIN — ask() orchestrates everything
// ─────────────────────────────────────────────────────────────────────────
export interface BrainAnswer {
  ok: boolean
  text: string
  intent: BrainIntent
  provider: string
  used_web: boolean
  sources: Array<{ title: string; url: string }>
  module_context: boolean
  latency_ms: number
  error?: string
}

export async function brainAsk(
  env: BrainEnv,
  userText: string,
  opts: { user_id?: number | null; history?: SageMsg[]; country?: string; lang?: string } = {}
): Promise<BrainAnswer> {
  const t0 = Date.now()
  const userId = opts.user_id ?? null

  // Step 1 — classify
  const intent = await classifyIntent(env, userText)
  if (opts.country && !intent.entities.country) intent.entities.country = opts.country
  if (opts.lang) intent.lang = opts.lang

  // Step 2 — gather context in parallel: platform data + memory + web
  // Platform intents (payments/region/emergency/trending/stats) are answered from
  // OUR authoritative country-node data — web search is skipped for them so that
  // external results (e.g. "Circle" the USDC company) can never override our modules.
  const platformIntent = ['payments', 'region_info', 'emergency', 'trending', 'platform_stats'].includes(intent.intent)
  const [moduleCtx, memories, web] = await Promise.all([
    intent.needs_data || platformIntent
      ? gatherPlatformContext(env.DB, intent) : Promise.resolve(null),
    recallKnowledge(env.DB, userId, userText),
    intent.needs_web && !platformIntent ? geminiWebSearch(env.GEMINI_API_KEY, userText, intent.lang) : Promise.resolve(null),
  ])

  // Step 3 — compose the prompt
  const sys: SageMsg[] = [{ role: 'system', content: BRAIN_SYSTEM }]
  if (moduleCtx) sys.push({ role: 'system', content: `INTERNAL MODULE DATA — AUTHORITATIVE. This is Circle's own country-node/platform data. Answer ONLY from it for payments, emergency numbers, compliance and platform questions. Never confuse Circle (دواير) with other companies named Circle:\n${moduleCtx}` })
  if (memories.length) sys.push({ role: 'system', content: `REMEMBERED CONTEXT (from previous learning):\n- ${memories.join('\n- ')}` })
  if (web && web.ok && web.text) sys.push({ role: 'system', content: `LIVE WEB SEARCH RESULTS (fresh, cite naturally):\n${web.text.slice(0, 2500)}` })
  sys.push({ role: 'system', content: `Reply in language: ${intent.lang}.` })

  const history = (opts.history ?? []).slice(-8)
  const messages: SageMsg[] = [...sys, ...history, { role: 'user', content: userText }]

  // Step 4 — answer via provider mesh (Groq → Gemini → OpenAI)
  const r = await sageChat(env, messages, { temperature: 0.55, max_tokens: 900 })
  const latency = Date.now() - t0

  if (!r.ok) {
    // absolute last resort: if web grounding succeeded, return it raw
    if (web && web.ok && web.text) {
      return { ok: true, text: web.text, intent, provider: 'gemini-search', used_web: true, sources: web.sources, module_context: !!moduleCtx, latency_ms: latency }
    }
    return { ok: false, text: '', intent, provider: 'none', used_web: false, sources: [], module_context: false, latency_ms: latency, error: (r as { error: string }).error }
  }

  // Step 5 — log + learn (fire-and-forget semantics; await for D1 durability)
  try {
    await run(env.DB, `
      INSERT INTO brain_interactions (user_id, intent, module, used_web, provider, question, answer, latency_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, userId, intent.intent, intent.module, web && web.ok ? 1 : 0, r.provider, userText.slice(0, 1000), r.text.slice(0, 2000), latency)
  } catch { /* logging best-effort */ }
  await learnFromInteraction(env, userId, userText, r.text)

  return {
    ok: true, text: r.text, intent, provider: r.provider,
    used_web: !!(web && web.ok), sources: web && web.ok ? web.sources : [],
    module_context: !!moduleCtx, latency_ms: latency,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Provider health — live probe of every configured AI provider
// ─────────────────────────────────────────────────────────────────────────
export async function providerHealth(env: BrainEnv): Promise<Record<string, { configured: boolean; alive: boolean; latency_ms: number | null; detail?: string }>> {
  const ping: SageMsg[] = [{ role: 'user', content: 'ping — reply with the single word: pong' }]
  async function probe(name: string, fn: () => Promise<{ ok: boolean } & Record<string, any>>, configured: boolean) {
    if (!configured) return [name, { configured: false, alive: false, latency_ms: null }] as const
    const t = Date.now()
    try {
      const r = await fn()
      return [name, { configured: true, alive: r.ok, latency_ms: Date.now() - t, detail: r.ok ? undefined : (r as any).error?.slice(0, 120) }] as const
    } catch (e: any) {
      return [name, { configured: true, alive: false, latency_ms: Date.now() - t, detail: e?.message?.slice(0, 120) }] as const
    }
  }
  const results = await Promise.all([
    probe('groq',   () => groqChat(env.GROQ_API_KEY, ping, { model: GROQ_FAST_MODEL, max_tokens: 5 }), !!env.GROQ_API_KEY),
    probe('gemini', () => googleGenaiChat(env.GEMINI_API_KEY, ping, { max_tokens: 5 }), !!env.GEMINI_API_KEY),
    probe('openai', () => openaiChat(env.OPENAI_API_KEY, ping, { max_tokens: 5 }), !!env.OPENAI_API_KEY),
    probe('huggingface', async () => {
      const r = await fetch('https://huggingface.co/api/whoami-v2', { headers: { Authorization: `Bearer ${env.HF_API_KEY}` } })
      return { ok: r.ok, error: r.ok ? undefined : `hf ${r.status}` }
    }, !!env.HF_API_KEY),
  ])
  return Object.fromEntries(results)
}
