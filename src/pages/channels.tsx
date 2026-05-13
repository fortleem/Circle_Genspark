// Official Channels & Creator Channels. Blueprint §11, §13.
import type { Context } from 'hono'
import { all, first, type Env, fmtCount, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function channelsPage(c: Context<{ Bindings: Env }>, lang: string, country: string, kind: 'official' | 'creator') {
  const n = getNames(lang)
  const channels = await all(c.env.DB, 'SELECT * FROM channels WHERE channel_type = ? ORDER BY subscriber_count DESC', kind)
  const title = kind === 'official' ? n.module_official : n.module_creators
  const active = kind === 'official' ? 'channels' : 'creators'

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{title}</h1>
        <p class="text-sm text-charcoal/70">
          {kind === 'official' ? 'Governments, schools, services — verified, free, and federated.' : 'Independent creators publishing on the open network.'}
        </p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch: any) => (
          <article class="pillar-card p-5">
            <header class="flex items-start gap-3">
              <span class="w-12 h-12 rounded-full bg-ink text-gold flex items-center justify-center text-lg shrink-0">
                <i class={`fas ${ch.category === 'gov' ? 'fa-landmark' : ch.category === 'edu' ? 'fa-graduation-cap' : ch.category === 'art' ? 'fa-palette' : ch.category === 'film' ? 'fa-film' : ch.category === 'tech' ? 'fa-code' : 'fa-tower-broadcast'}`}></i>
              </span>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base text-ink flex items-center gap-1">
                  <a href={`/channels/${ch.slug}`} class="hover:underline">{ch.name}</a>
                  {ch.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
                </h3>
                <div class="text-[11px] text-charcoal/60 flex items-center gap-2 mt-0.5">
                  <span class="chip text-[10px]">{ch.category}</span>
                  {ch.country ? <span class="chip text-[10px]"><i class="fas fa-globe"></i> {ch.country}</span> : null}
                </div>
              </div>
            </header>
            <p class="text-xs text-charcoal/70 mt-3">{ch.description}</p>
            <footer class="mt-4 flex items-center justify-between">
              <span class="text-xs text-charcoal/60"><i class="fas fa-users text-gold"></i> {fmtCount(ch.subscriber_count)}</span>
              <button class="bg-gold text-ink text-xs font-semibold px-3 py-1.5 rounded">Follow</button>
            </footer>
          </article>
        ))}
      </section>
    </div>,
    { title, lang, country, active }
  )
}

export async function channelDetailPage(c: Context<{ Bindings: Env }>, lang: string, country: string, slug: string) {
  const n = getNames(lang)
  const ch = await first<any>(c.env.DB, 'SELECT * FROM channels WHERE slug = ?', slug)
  if (!ch) return c.notFound()
  const posts = await all(c.env.DB, 'SELECT * FROM channel_posts WHERE channel_id = ? ORDER BY created_at DESC', ch.id)
  const active = ch.channel_type === 'official' ? 'channels' : ch.channel_type === 'creator' ? 'creators' : 'channels'

  return c.render(
    <div class="fade-in space-y-6">
      <header class="pillar-card p-6">
        <div class="flex items-center gap-4">
          <span class="w-16 h-16 rounded-full bg-ink text-gold flex items-center justify-center text-2xl">
            <i class="fas fa-tower-broadcast"></i>
          </span>
          <div class="flex-1 min-w-0">
            <h1 class="font-display text-2xl text-ink flex items-center gap-2">
              {ch.name}
              {ch.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
            </h1>
            <p class="text-sm text-charcoal/70">{ch.description}</p>
            <div class="mt-1 text-xs text-charcoal/60">
              <span class="chip text-[10px]">{ch.channel_type}</span> · {fmtCount(ch.subscriber_count)} subscribers
            </div>
          </div>
          <button class="bg-gold text-ink text-sm font-semibold px-4 py-2 rounded">Follow</button>
        </div>
      </header>

      <section class="space-y-3">
        {posts.map((p: any) => (
          <article class="pillar-card p-4">
            {p.title && <h3 class="font-semibold text-base mb-1">{p.title}</h3>}
            <p class="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">{p.body}</p>
            <div class="text-[11px] text-charcoal/60 mt-2">{timeAgo(p.created_at)}</div>
          </article>
        ))}
        {posts.length === 0 && <p class="text-sm text-charcoal/60">No posts yet.</p>}
      </section>
    </div>,
    { title: ch.name, lang, country, active }
  )
}
