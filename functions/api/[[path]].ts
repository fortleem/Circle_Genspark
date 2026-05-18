// Cloudflare Pages Functions catch-all
// Mounts the Hono /api router at /api/*. Receives D1 binding `DB` from wrangler.jsonc.
import { Hono } from 'hono'
import { api } from '../../src/server/api'
import type { Env } from '../../src/server/db'

const app = new Hono<{ Bindings: Env }>()
app.route('/api', api)

export const onRequest: PagesFunction<Env> = async (ctx) => {
  // Pages Functions passes ctx.env; Hono needs it via app.fetch(req, env, executionCtx)
  return app.fetch(ctx.request, ctx.env, ctx)
}
