// §23 Zero-Cost Mapping Stack — OSM + TileServer GL + Nominatim + OSRM
import type { Context } from 'hono'
import { all, type Env, fmtCount } from '../db'
import { getNames } from '../i18n'

export async function mapsPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const regions = await all(c.env.DB, 'SELECT * FROM map_regions ORDER BY pinned_by DESC')

  const stack = [
    { name: 'TileServer GL', role: 'Vector + raster tiles', port: '8080', desc: 'Serves smooth-zoom vector maps and raster fallback from a 350 MB Egypt extract.' },
    { name: 'Nominatim',     role: 'Geocoding',             port: '8088', desc: 'Address lookup and reverse geocoding from OpenStreetMap. Standard, well-supported.' },
    { name: 'OSRM',          role: 'Routing',               port: '5000', desc: 'Fast turn-by-turn directions. Supports driving, walking, cycling profiles.' },
    { name: 'Valhalla',      role: 'Routing (advanced)',    port: '—',    desc: 'Optional: multi-modal, avoid-tolls, more memory but more flexibility.' }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§23 · Zero-cost, offline-first</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_maps}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">A complete OSM-based replacement for Google Maps and Mapbox. Self-hosted. Free for everyone. No API keys, no billing. Users can pre-download city or country packs over Wi-Fi and use maps, geocoding, and routing entirely offline.</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span class="chip chip-dark"><i class="fas fa-dollar-sign"></i> $0 software</span>
          <span class="chip chip-dark"><i class="fas fa-mobile-screen"></i> Offline region packs</span>
          <span class="chip chip-dark"><i class="fas fa-shield-halved"></i> No location tracking</span>
        </div>
      </header>

      <section>
        <h2 class="section-title font-display text-2xl mb-4">Self-hosted stack</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 fade-in-stagger">
          {stack.map(s => (
            <div class="pillar-card p-5">
              <div class="flex items-center gap-2 mb-2">
                <i class="fas fa-server text-gold"></i>
                <div class="font-semibold">{s.name}</div>
                <span class="chip text-[10px] ms-auto font-mono">:{s.port}</span>
              </div>
              <div class="text-[11px] font-semibold" style="color: var(--gold-dark);">{s.role}</div>
              <p class="text-xs mt-1" style="color: var(--muted);">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Offline region packs</h2>
          <span class="text-xs" style="color: var(--muted);">IPFS-pinned · downloaded over Wi-Fi · zero ongoing cost</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fade-in-stagger">
          {regions.map((r: any) => (
            <article class="pillar-card p-5">
              <div class="flex items-start gap-3">
                <span class="avatar avatar-md"><i class="fas fa-map-location-dot"></i></span>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold">{r.region_name}</div>
                  <div class="text-[11px]" style="color: var(--muted);">{r.country} · {r.size_mb} MB · pinned by {r.pinned_by} nodes</div>
                </div>
                {r.downloaded ? <span class="chip chip-success text-[10px]"><i class="fas fa-check"></i> Installed</span> : <span class="chip text-[10px]">Available</span>}
              </div>
              <div class="text-[10px] font-mono mt-2" style="color: var(--muted-2);">tile: {r.tile_cid}</div>
              <div class="mt-3 flex gap-2">
                {r.downloaded
                  ? <button class="btn btn-ghost text-xs flex-1"><i class="fas fa-arrow-rotate-right"></i> Update</button>
                  : <button class="btn btn-primary text-xs flex-1"><i class="fas fa-cloud-arrow-down"></i> Download ({r.size_mb} MB)</button>}
                <button class="btn-icon"><i class="fas fa-info"></i></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="pillar-card p-5">
          <i class="fas fa-route text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Turn-by-turn routing</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">OSRM handles driving, walking and cycling. When you're offline, the locally-bundled OSRM extract takes over and never phones home.</p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-magnifying-glass-location text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Fuzzy geocoding</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">A compressed SQLite FTS5 index ships with each region pack. Type "Zamalek cafes" without a connection and get instant results.</p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-circle-half-stroke text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Privacy by default</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">No tracking, no usage stats. Community nodes anonymise tile request logs and delete them weekly. The map remembers nothing.</p>
        </div>
      </section>
    </div>,
    { title: n.module_maps, lang, country, active: 'maps' }
  )
}
