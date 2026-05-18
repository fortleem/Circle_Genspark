// Circle — D1 helpers (server-side, runs in Cloudflare Workers)
// Used only inside functions/api/* via the Pages Functions adapter.
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
