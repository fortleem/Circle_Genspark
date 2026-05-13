// Lamahat (لمحات) — photos / glimpses. Blueprint §8.
import type { Context } from 'hono'
import { all, type Env, fmtCount, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function lamahatPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const photos = await all(c.env.DB,
    'SELECT p.*, u.display_name, u.handle, u.verified FROM photos p JOIN users u ON u.id=p.uploader_id ORDER BY p.published_at DESC')

  return c.render(
    <div class="fade-in space-y-6">
      <header class="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 class="font-display text-3xl text-ink">{n.module_photos}</h1>
          <p class="text-sm text-charcoal/70">Pinned on IPFS · NSFW blur runs on your device</p>
        </div>
        <button class="bg-ink text-gold px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <i class="fas fa-camera"></i> Share
        </button>
      </header>

      <nav class="flex gap-2 overflow-x-auto pb-1">
        {['Feed','Cairo','Riyadh','Shanghai','Berlin','Following'].map((t,i) => (
          <button class={`tab-btn ${i===0 ? 'tab-btn-active' : ''}`}>{t}</button>
        ))}
      </nav>

      <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((p: any) => (
          <figure class="pillar-card p-0 overflow-hidden">
            <div class="photo-tile rounded-none">
              <i class="fas fa-image"></i>
              <div class="overlay">{p.caption ?? ''}</div>
            </div>
            <figcaption class="p-2 text-xs">
              <div class="flex items-center gap-1 text-ink">
                <span class="font-semibold">{p.display_name}</span>
                {p.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
              </div>
              <div class="flex justify-between text-charcoal/60 mt-1">
                <span><i class="far fa-heart"></i> {fmtCount(p.likes)} · <i class="far fa-comment"></i> {fmtCount(p.comments_count)}</span>
                <span>{timeAgo(p.published_at)}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </section>
    </div>,
    { title: n.module_photos, lang, country, active: 'lamahat' }
  )
}
