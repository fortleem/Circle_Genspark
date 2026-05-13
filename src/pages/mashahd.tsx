// Mashahd (مشاهد) — federated video. Blueprint §7.
import type { Context } from 'hono'
import { all, type Env, fmtCount, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function mashahdPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const videos = await all(c.env.DB,
    'SELECT v.*, u.display_name, u.handle, u.verified FROM videos v JOIN users u ON u.id=v.uploader_id ORDER BY v.published_at DESC')

  return c.render(
    <div class="fade-in space-y-6">
      <header class="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 class="font-display text-3xl text-ink">{n.module_video}</h1>
          <p class="text-sm text-charcoal/70">PeerTube + IPFS + WebTorrent · Every viewer is a seeder</p>
        </div>
        <button class="bg-ink text-gold px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <i class="fas fa-upload"></i> Upload
        </button>
      </header>

      <nav class="flex gap-2 overflow-x-auto pb-1">
        {['All','Cairo','Alexandria','Shanghai','Berlin','Tutorials','Music','Film'].map((t,i) => (
          <button class={`tab-btn ${i===0 ? 'tab-btn-active' : ''}`}>{t}</button>
        ))}
      </nav>

      {/* Featured */}
      {videos[0] && (
        <article class="pillar-card p-0 overflow-hidden">
          <div class="video-thumb !rounded-none !rounded-t-2xl" style="aspect-ratio:21/9">
            <i class="fas fa-play"></i>
            <span class="duration">{Math.floor(videos[0].duration_sec/60)}:{(videos[0].duration_sec%60).toString().padStart(2,'0')}</span>
            <span class="absolute top-2 left-2 chip chip-dark text-[10px]"><i class="fas fa-bolt"></i> Featured</span>
          </div>
          <div class="p-4">
            <h2 class="font-semibold text-lg">{videos[0].title}</h2>
            <p class="text-xs text-charcoal/60 mt-1">{videos[0].description}</p>
            <div class="text-xs text-charcoal/70 mt-2 flex items-center gap-3">
              <span class="font-semibold text-ink">{videos[0].display_name}</span>
              {videos[0].verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
              <span>· {fmtCount(videos[0].views)} views</span>
              <span>· {fmtCount(videos[0].likes)} likes</span>
              <span>· {timeAgo(videos[0].published_at)}</span>
              <span class="chip"><i class="fas fa-share-nodes"></i> Seeding</span>
            </div>
          </div>
        </article>
      )}

      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Recent</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.slice(1).map((v: any) => (
            <article class="pillar-card p-0 overflow-hidden">
              <div class="video-thumb !rounded-none !rounded-t-2xl">
                <i class="fas fa-play"></i>
                <span class="duration">{Math.floor(v.duration_sec/60)}:{(v.duration_sec%60).toString().padStart(2,'0')}</span>
              </div>
              <div class="p-3">
                <h3 class="font-semibold text-sm leading-tight line-clamp-2">{v.title}</h3>
                <div class="text-xs text-charcoal/60 mt-1 flex items-center gap-1">
                  <span>{v.display_name}</span>
                  {v.verified ? <span class="verified-badge"><i class="fas fa-check"></i></span> : null}
                </div>
                <div class="text-[11px] text-charcoal/60 mt-1 flex gap-3">
                  <span><i class="far fa-eye"></i> {fmtCount(v.views)}</span>
                  <span><i class="far fa-heart"></i> {fmtCount(v.likes)}</span>
                  <span class="ml-auto chip text-[9px]">{v.city}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section class="bg-ink text-cream rounded-2xl p-5 text-sm flex items-start gap-4">
        <i class="fas fa-share-nodes text-3xl text-gold"></i>
        <div>
          <div class="font-semibold text-gold">How Mashahd works — zero CDN cost</div>
          <p class="text-cream/80 text-xs mt-1 leading-relaxed">
            Videos are uploaded to IPFS and federated to community PeerTube instances. While you watch, your device seeds the video back to other peers via WebTorrent. The more popular a video gets, the cheaper it gets to distribute — eventually approaching $0.
          </p>
        </div>
      </section>
    </div>,
    { title: n.module_video, lang, country, active: 'mashahd' }
  )
}
