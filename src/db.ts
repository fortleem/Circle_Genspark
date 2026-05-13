// Lightweight D1 helpers shared by all route modules
import type { D1Database } from '@cloudflare/workers-types'

export interface Env {
  DB: D1Database
}

export async function all<T = any>(db: D1Database, sql: string, ...params: any[]): Promise<T[]> {
  const r = await db.prepare(sql).bind(...params).all<T>()
  return (r.results ?? []) as T[]
}

export async function first<T = any>(db: D1Database, sql: string, ...params: any[]): Promise<T | null> {
  const r = await db.prepare(sql).bind(...params).first<T>()
  return (r ?? null) as T | null
}

export async function run(db: D1Database, sql: string, ...params: any[]) {
  return db.prepare(sql).bind(...params).run()
}

export function timeAgo(iso: string | undefined | null): string {
  if (!iso) return ''
  const t = new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z')).getTime()
  if (isNaN(t)) return iso
  const diff = Math.max(1, Math.floor((Date.now() - t) / 1000))
  if (diff < 60)         return diff + 's ago'
  if (diff < 3600)       return Math.floor(diff/60) + 'm ago'
  if (diff < 86400)      return Math.floor(diff/3600) + 'h ago'
  if (diff < 86400 * 7)  return Math.floor(diff/86400) + 'd ago'
  return Math.floor(diff / 86400) + 'd ago'
}

export function fmtMoney(n: number, currency: string): string {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n) }
  catch { return `${n.toFixed(2)} ${currency}` }
}

export function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}
