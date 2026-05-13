// Midan (ميدان) — Square, ActivityPub-style public posts. Blueprint §9.
import type { Context } from 'hono'
import { all, type Env, fmtCount, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function midanPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const posts = await all(c.env.DB,
    'SELECT p.*, u.handle, u.display_name, u.verified FROM posts p JOIN users u ON u.id=p.author_id ORDER BY p.created_at DESC')

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.module_square}</h1>
        <p class="text-sm text-charcoal/70">Federated public timeline (ActivityPub / Mastodon-compatible)</p>
      </header>

      <form id="midan-compose" class="pillar-card p-4 space-y-3">
        <textarea name="content" maxlength={500} placeholder="What's happening in the square?"
                  class="w-full bg-white border border-gold/25 rounded-lg p-3 text-sm" rows={3}></textarea>
        <div class="flex items-center gap-3 text-xs text-charcoal/70 flex-wrap">
          <label class="flex items-center gap-1"><input type="checkbox" name="anonymous" /> <i class="fas fa-user-secret"></i> Anonymous</label>
          <input name="hashtags" placeholder="#cairo #life" class="bg-white border border-gold/25 rounded px-2 py-1 text-xs flex-1 min-w-[140px]" />
          <input name="city" placeholder="City" class="bg-white border border-gold/25 rounded px-2 py-1 text-xs w-28" />
          <span class="ml-auto"></span>
          <button type="submit" class="bg-ink text-gold px-4 py-1.5 rounded-lg text-sm font-semibold">Post</button>
        </div>
      </form>

      <nav class="flex gap-2 overflow-x-auto pb-1">
        {['Home','Local','Federated','Trending'].map((t,i) => (
          <button class={`tab-btn ${i===0 ? 'tab-btn-active' : ''}`}>{t}</button>
        ))}
      </nav>

      <section class="space-y-3">
        {posts.map((p: any) => (
          <article class="pillar-card p-4">
            <header class="flex items-center gap-2 text-xs text-charcoal/70 mb-1">
              <span class="w-8 h-8 rounded-full bg-ink text-gold flex items-center justify-center text-xs">
                <i class={`fas ${p.anonymous ? 'fa-user-secret' : 'fa-user'}`}></i>
              </span>
              <span class="font-semibold text-ink">{p.anonymous ? 'Anonymous' : p.display_name}</span>
              {!p.anonymous && p.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
              {!p.anonymous && <span class="text-charcoal/50">@{p.handle}</span>}
              <span class="text-charcoal/40">· {timeAgo(p.created_at)}</span>
              {p.city ? <span class="ml-auto chip text-[10px]"><i class="fas fa-location-dot"></i> {p.city}</span> : null}
            </header>
            <p class="text-sm leading-relaxed whitespace-pre-line">{p.content ?? <span class="italic text-charcoal/50">(empty)</span>}</p>
            {p.hashtags && <div class="mt-2 text-xs text-goldDark font-semibold">{p.hashtags}</div>}
            <footer class="flex gap-5 mt-3 text-xs text-charcoal/60">
              <button data-action="like-post" data-id={p.id} class="hover:text-red-600"><i class="far fa-heart"></i> <span data-likes={p.id}>{fmtCount(p.likes)}</span></button>
              <span><i class="far fa-comment"></i> {fmtCount(p.replies_count)}</span>
              <span><i class="fas fa-retweet"></i> {fmtCount(p.reposts)}</span>
              <span class="ml-auto"><i class="fas fa-share-nodes"></i> ActivityPub</span>
            </footer>
          </article>
        ))}
      </section>
    </div>,
    { title: n.module_square, lang, country, active: 'midan' }
  )
}
