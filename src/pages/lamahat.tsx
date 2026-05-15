// Lamahat (لمحات) — photos / glimpses. Blueprint §8. Modernized masonry layout.
import type { Context } from 'hono'
import { all, type Env, fmtCount, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function lamahatPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const photos = await all(c.env.DB,
    'SELECT p.*, u.display_name, u.handle, u.verified FROM photos p JOIN users u ON u.id=p.uploader_id ORDER BY p.published_at DESC')

  return c.render(
    <div class="fade-in space-y-6">
      <header class="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div class="eyebrow mb-1">§8 · Pinned on IPFS</div>
          <h1 class="font-display text-4xl">{n.module_photos}</h1>
          <p class="text-sm mt-1" style="color: var(--muted);">On-device NSFW blur runs before anything leaves your phone. Originals never auto-uploaded.</p>
        </div>
        <button class="btn btn-primary">
          <i class="fas fa-camera"></i> Share a glimpse
        </button>
      </header>

      <nav class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['Feed','Cairo','Riyadh','Shanghai','Berlin','Paris','Following','Saved'].map((t,i) => (
          <button class={`tab-btn ${i===0 ? 'tab-btn-active' : ''}`}>{t}</button>
        ))}
      </nav>

      <section class="masonry fade-in-stagger">
        {photos.map((p: any, i: number) => {
          const h = ['h-3','h-2','h-1','h-2','h-3','h-1'][i % 6]
          return (
            <article class={`masonry-tile ${h}`}>
              <div class="flex items-start justify-between">
                <span class="chip-dark chip text-[10px]"><i class="fas fa-image"></i> IPFS</span>
                {p.verified ? <span class="chip-dark chip text-[10px]"><i class="fas fa-check"></i> Verified</span> : null}
              </div>
              <div>
                <div class="flex items-center gap-2 text-[#1B1B1B] text-xs font-semibold">
                  <span class="avatar avatar-sm" style="background: rgba(0,0,0,0.25); color: #fff;">{(p.display_name || '?').charAt(0)}</span>
                  <span class="truncate">{p.display_name}</span>
                  <span class="ms-auto opacity-70">{timeAgo(p.published_at)}</span>
                </div>
                <div class="text-[#1B1B1B] text-xs mt-1 line-clamp-2 leading-snug">{p.caption ?? ''}</div>
                <div class="flex gap-3 mt-2 text-[#1B1B1B] text-[11px] font-semibold opacity-80">
                  <button data-action="like-photo" data-id={p.id}><i class="fas fa-heart"></i> {fmtCount(p.likes)}</button>
                  <button><i class="fas fa-comment"></i> {fmtCount(p.comments_count)}</button>
                  <span class="ms-auto"><i class="fas fa-location-dot"></i> {p.city ?? ''}</span>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </div>,
    { title: n.module_photos, lang, country, active: 'lamahat' }
  )
}
