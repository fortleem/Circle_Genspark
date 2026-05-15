// §33 Deployment Scripts & Self-Hosting
import type { Context } from 'hono'
import { all, type Env, fmtCount } from '../db'
import { getNames } from '../i18n'

export async function selfhostPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const nodes = await all(c.env.DB, 'SELECT * FROM self_host_nodes ORDER BY users_served DESC')

  const installers = [
    { kind: 'Wasl Maktab (Workspace)',    file: 'circle-workspace-installer.sh', cost: '~$8/mo VPS',   for: 'Schools, companies, NGOs',  components: 'Synapse + ntfy + React admin', icon: 'fa-building' },
    { kind: 'Community PeerTube',         file: 'deploy-peertube.sh',            cost: '~$25/mo VPS',  for: 'Video federation',           components: 'PeerTube + IPFS pin',          icon: 'fa-circle-play' },
    { kind: 'Mailcow Mail Server',        file: 'deploy-mailcow.sh',             cost: '~$15/mo VPS',  for: 'Free email at your domain',  components: 'Mailcow Docker stack',         icon: 'fa-envelope' },
    { kind: 'Mapping Stack',              file: 'deploy-maps.sh',                cost: '~$10/mo VPS',  for: 'Tiles + geocoding + routing',components: 'TileServer GL + Nominatim + OSRM', icon: 'fa-map-location-dot' },
    { kind: 'China Data Plane',           file: 'deploy-china-plane.sh',         cost: 'Alibaba ECS',  for: 'CN-compliant deployment',    components: 'Synapse-CN + ModelScope + CTID',icon: 'fa-flag' },
    { kind: 'IPFS Pinning Node',          file: 'deploy-ipfs-pin.sh',            cost: '~$5/mo VPS',   for: 'Community pinning',          components: 'IPFS + Kubo',                  icon: 'fa-share-nodes' }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§33 · Run your own Circle</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_selfhost}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">Every piece of Circle infrastructure has a one-line installer. Schools, families, dissidents, or anyone who wants their own homeserver can deploy in minutes for the cost of a $5–25 VPS. The community node list below shows who's already doing it.</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span class="chip chip-dark"><i class="fab fa-docker"></i> Docker compose</span>
          <span class="chip chip-dark"><i class="fab fa-github"></i> github.com/circle-app/deployment-scripts</span>
          <span class="chip chip-dark"><i class="fas fa-scale-balanced"></i> Apache 2.0</span>
        </div>
      </header>

      <section>
        <h2 class="section-title font-display text-2xl mb-4">One-line installers</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 fade-in-stagger">
          {installers.map(i => (
            <article class="pillar-card p-5">
              <div class="flex items-start gap-3">
                <span class="avatar avatar-md"><i class={`fas ${i.icon}`}></i></span>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold">{i.kind}</div>
                  <div class="text-[11px]" style="color: var(--muted);">For {i.for}</div>
                </div>
                <span class="chip text-[10px]">{i.cost}</span>
              </div>
              <p class="text-xs mt-2" style="color: var(--muted);">{i.components}</p>
              <pre class="mt-3 rounded-lg p-3 text-[11px] font-mono overflow-x-auto" style="background: var(--ink); color: var(--gold-light);">curl -sSL https://circle.app/{i.file} | bash</pre>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div class="flex items-end justify-between mb-4">
          <h2 class="section-title font-display text-2xl">Community-operated nodes</h2>
          <span class="text-xs" style="color: var(--muted);">Live network registry</span>
        </div>
        <div class="pillar-card overflow-hidden">
          <table class="w-full text-sm">
            <thead style="background: var(--bg-soft); color: var(--muted);">
              <tr class="text-xs uppercase tracking-wider">
                <th class="text-start p-3">Kind</th>
                <th class="text-start p-3">Domain</th>
                <th class="text-start p-3">Operator</th>
                <th class="text-start p-3">Plane</th>
                <th class="text-end p-3">Users</th>
                <th class="text-end p-3">Uptime</th>
                <th class="text-end p-3">$/mo</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((nd: any) => (
                <tr class="border-t" style="border-color: var(--border);">
                  <td class="p-3 text-xs"><span class="chip text-[10px]">{nd.node_kind}</span></td>
                  <td class="p-3 font-mono text-xs">{nd.domain}</td>
                  <td class="p-3 text-xs">{nd.operator}</td>
                  <td class="p-3 text-xs uppercase">{nd.region}</td>
                  <td class="p-3 text-end">{fmtCount(nd.users_served)}</td>
                  <td class="p-3 text-end font-mono text-xs">{nd.uptime_pct}%</td>
                  <td class="p-3 text-end font-mono text-xs">${nd.monthly_cost_usd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>,
    { title: n.module_selfhost, lang, country, active: 'selfhost' }
  )
}
