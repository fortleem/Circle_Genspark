// Cirkle — Live Local News Engine
// Scrapes real headlines from famous news outlets per country via their RSS
// feeds (legal + stable), with Google News per-country edition as universal
// fallback so ALL 249 country nodes get localized news.
// Results cached in D1 (news_cache) for 15 minutes.

import type { D1Database } from '@cloudflare/workers-types'
import { configFor } from './dre'

export interface NewsItem {
  title: string
  link: string
  source: string
  published?: string
  snippet?: string
}

export interface NewsResult {
  country: string
  language: string
  items: NewsItem[]
  sources_used: string[]
  fetched_at: string
  cache: 'hit' | 'miss'
}

// ── Famous local outlets (RSS) per key country ──────────────────────────
// Each entry: [outlet name, rss url]
const LOCAL_FEEDS: Record<string, Array<[string, string]>> = {
  EG: [
    ['Al-Ahram (الأهرام)', 'https://gate.ahram.org.eg/rss/36.aspx'],
    ['Youm7 (اليوم السابع)', 'https://www.youm7.com/rss/SectionRss?SectionID=65'],
    ['BBC Arabic', 'https://feeds.bbci.co.uk/arabic/rss.xml'],
  ],
  SA: [
    ['Arab News', 'https://www.arabnews.com/rss.xml'],
    ['Al Arabiya (العربية)', 'https://www.alarabiya.net/feed/rss2/ar.xml'],
  ],
  AE: [
    ['Gulf News', 'https://gulfnews.com/rss?generatorName=mrss'],
    ['Khaleej Times', 'https://www.khaleejtimes.com/rss'],
  ],
  US: [
    ['AP News', 'https://feedx.net/rss/ap.xml'],
    ['NPR', 'https://feeds.npr.org/1001/rss.xml'],
    ['CNN', 'http://rss.cnn.com/rss/cnn_topstories.rss'],
  ],
  UK: [
    ['BBC News', 'https://feeds.bbci.co.uk/news/rss.xml'],
    ['The Guardian', 'https://www.theguardian.com/uk/rss'],
  ],
  GB: [
    ['BBC News', 'https://feeds.bbci.co.uk/news/rss.xml'],
    ['The Guardian', 'https://www.theguardian.com/uk/rss'],
  ],
  IN: [
    ['The Hindu', 'https://www.thehindu.com/news/national/feeder/default.rss'],
    ['NDTV', 'https://feeds.feedburner.com/ndtvnews-top-stories'],
  ],
  FR: [
    ['Le Monde', 'https://www.lemonde.fr/rss/une.xml'],
    ['France 24', 'https://www.france24.com/fr/rss'],
  ],
  DE: [
    ['Der Spiegel', 'https://www.spiegel.de/schlagzeilen/index.rss'],
    ['DW', 'https://rss.dw.com/rdf/rss-de-all'],
  ],
  JP: [
    ['NHK News', 'https://www3.nhk.or.jp/rss/news/cat0.xml'],
  ],
  BR: [
    ['G1 Globo', 'https://g1.globo.com/rss/g1/'],
  ],
  TR: [
    ['Hürriyet', 'https://www.hurriyet.com.tr/rss/anasayfa'],
    ['TRT Haber', 'https://www.trthaber.com/sondakika.rss'],
  ],
  RU: [
    ['RT Russian', 'https://russian.rt.com/rss'],
    ['TASS', 'https://tass.com/rss/v2.xml'],
  ],
  CN: [
    ['Xinhua', 'http://www.xinhuanet.com/english/rss/worldrss.xml'],
    ['China Daily', 'https://www.chinadaily.com.cn/rss/china_rss.xml'],
  ],
  NG: [
    ['Punch Nigeria', 'https://punchng.com/feed/'],
    ['Vanguard', 'https://www.vanguardngr.com/feed/'],
  ],
  ZA: [
    ['News24', 'https://feeds.capi24.com/v1/Search/articles/news24/TopStories/rss'],
  ],
  PK: [
    ['Dawn', 'https://www.dawn.com/feeds/home'],
  ],
  ID: [
    ['Kompas', 'https://www.kompas.com/rss'],
  ],
  MX: [
    ['El Universal', 'https://www.eluniversal.com.mx/rss.xml'],
  ],
  AR: [
    ['Clarín', 'https://www.clarin.com/rss/lo-ultimo/'],
  ],
  ES: [
    ['El País', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'],
  ],
  IT: [
    ['ANSA', 'https://www.ansa.it/sito/ansait_rss.xml'],
  ],
  CA: [
    ['CBC News', 'https://www.cbc.ca/webfeed/rss/rss-topstories'],
  ],
  AU: [
    ['ABC Australia', 'https://www.abc.net.au/news/feed/51120/rss.xml'],
  ],
  KR: [
    ['Yonhap', 'https://en.yna.co.kr/RSS/news.xml'],
  ],
  QA: [
    ['Al Jazeera (الجزيرة)', 'https://www.aljazeera.com/xml/rss/all.xml'],
  ],
  JO: [
    ['Jordan Times', 'https://jordantimes.com/rss.xml'],
  ],
  MA: [
    ['Hespress (هسبريس)', 'https://www.hespress.com/feed'],
  ],
  IQ: [
    ['Shafaq News (شفق نيوز)', 'https://shafaq.com/ar/rss'],
  ],
}

// Google News per-country edition — universal fallback for every country.
// hl = UI language, gl = country, ceid = country:lang
function googleNewsFeed(cc: string, lang: string): [string, string] {
  const l = lang === 'ar' ? 'ar' : lang
  return [
    'Google News (local edition)',
    `https://news.google.com/rss?hl=${l}&gl=${cc}&ceid=${cc}:${l}`,
  ]
}

// ── Tiny RSS/Atom parser (edge-safe, no deps) ───────────────────────────
function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim()
}
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
}
function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))
  return m ? decodeEntities(stripCdata(m[1])) : null
}

export function parseRss(xml: string, sourceName: string, max = 10): NewsItem[] {
  const items: NewsItem[] = []
  // RSS <item> or Atom <entry>
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? []
  for (const b of blocks.slice(0, max)) {
    const title = tag(b, 'title')
    if (!title) continue
    // Atom links are <link href="..."/>
    let link = tag(b, 'link')
    if (!link || !link.startsWith('http')) {
      const href = b.match(/<link[^>]*href="([^"]+)"/i)
      link = href ? decodeEntities(href[1]) : (link ?? '')
    }
    const published = tag(b, 'pubDate') ?? tag(b, 'published') ?? tag(b, 'updated') ?? undefined
    let snippet = tag(b, 'description') ?? tag(b, 'summary') ?? undefined
    if (snippet) snippet = snippet.replace(/<[^>]+>/g, '').slice(0, 180)
    items.push({ title: title.slice(0, 200), link: link ?? '', source: sourceName, published, snippet })
  }
  return items
}

async function fetchFeed(name: string, url: string, timeoutMs = 8000): Promise<NewsItem[]> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CirkleNewsBot/1.0; +https://cirkle.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    })
    clearTimeout(t)
    if (!res.ok) return []
    const xml = await res.text()
    return parseRss(xml, name)
  } catch {
    return []
  }
}

// ── Main entry: get live local news for a country (D1-cached 15 min) ────
export async function getCountryNews(db: D1Database, country: string, langOverride?: string): Promise<NewsResult> {
  const cc = country.toUpperCase()
  const cfg = configFor(cc)
  const lang = langOverride ?? cfg.language.default ?? 'en'
  const cacheKey = `news:${cc}:${lang}`

  // 1. Cache check (15 min TTL)
  try {
    const row = await db.prepare(
      `SELECT payload, fetched_at FROM news_cache WHERE cache_key = ? AND fetched_at > datetime('now', '-15 minutes')`
    ).bind(cacheKey).first<{ payload: string; fetched_at: string }>()
    if (row) {
      const cached = JSON.parse(row.payload) as NewsResult
      return { ...cached, cache: 'hit' }
    }
  } catch { /* table may not exist yet in edge cases */ }

  // 2. Live fetch — local famous outlets first, Google News local edition always
  const feeds: Array<[string, string]> = [...(LOCAL_FEEDS[cc] ?? [])]
  feeds.push(googleNewsFeed(cc, lang))

  const results = await Promise.all(feeds.map(([name, url]) => fetchFeed(name, url)))
  const merged: NewsItem[] = []
  const seen = new Set<string>()
  // Interleave sources so the top of the feed is diverse
  const maxLen = Math.max(...results.map((r) => r.length), 0)
  for (let i = 0; i < maxLen; i++) {
    for (const r of results) {
      const item = r[i]
      if (!item) continue
      const key = item.title.toLowerCase().slice(0, 80)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(item)
      if (merged.length >= 24) break
    }
    if (merged.length >= 24) break
  }

  const out: NewsResult = {
    country: cc,
    language: lang,
    items: merged,
    sources_used: feeds.filter((_, i) => results[i]?.length > 0).map(([n]) => n),
    fetched_at: new Date().toISOString(),
    cache: 'miss',
  }

  // 3. Store in cache
  try {
    await db.prepare(
      `INSERT INTO news_cache (cache_key, payload, fetched_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(cache_key) DO UPDATE SET payload = excluded.payload, fetched_at = CURRENT_TIMESTAMP`
    ).bind(cacheKey, JSON.stringify(out)).run()
  } catch { /* cache best-effort */ }

  return out
}
