// §15 Local Mesh Offline Network — BLE + Wi-Fi Direct + libp2p + SOS
import type { Context } from 'hono'
import { all, type Env, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function meshPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const [peers, alerts] = await Promise.all([
    all(c.env.DB, 'SELECT m.*, u.display_name AS user_name FROM mesh_peers m LEFT JOIN users u ON u.id=m.user_id ORDER BY m.rssi_dbm DESC LIMIT 12'),
    all(c.env.DB, 'SELECT s.*, u.display_name FROM sos_alerts s JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC LIMIT 8')
  ])

  const transports = [
    { kind: 'ble',         icon: 'fa-bluetooth-b', label: 'Bluetooth LE',       range: '50 m',   power: 'Low',    note: 'Always-on peer discovery; encrypted via Noise protocol' },
    { kind: 'wifi-direct', icon: 'fa-wifi',         label: 'Wi-Fi Direct',       range: '200 m',  power: 'Med',    note: 'Used opportunistically for high-bandwidth transfers' },
    { kind: 'libp2p',      icon: 'fa-link',         label: 'libp2p (LAN/relay)', range: 'LAN',    power: 'Low',    note: 'Fallback over local Wi-Fi when not on the same SSID' },
    { kind: 'lora',        icon: 'fa-broadcast-tower', label: 'LoRa (optional)', range: '5 km',   power: 'Ultra-low', note: 'Future expansion for ultra-remote mesh' }
  ]

  return c.render(
    <div class="fade-in space-y-8">

      <header class="card-dark rounded-3xl p-8 relative">
        <div class="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div class="eyebrow text-gold-light mb-2">§15 · Offline-first</div>
            <h1 class="font-display text-4xl md:text-5xl text-gradient-gold">{n.module_mesh}</h1>
            <p class="text-cream/80 mt-3 max-w-2xl">When the cell tower is down, the subway is underground, or the regime cuts the cable — Circle keeps working. BLE, Wi-Fi Direct, libp2p and (soon) LoRa form a local peer-to-peer mesh that delivers messages, files, and SOS broadcasts without any centralised infrastructure.</p>
            <div class="flex flex-wrap gap-2 mt-4">
              <span class="chip chip-dark"><i class="fas fa-shield-halved"></i> Noise protocol E2EE</span>
              <span class="chip chip-dark"><i class="fas fa-circle-nodes"></i> Flooding routing</span>
              <span class="chip chip-dark"><i class="fas fa-battery-three-quarters"></i> Power-optimised</span>
            </div>
          </div>
          <button id="mesh-sos" class="btn btn-primary !bg-red-600 !from-red-600 !to-red-700 text-white" style="background: linear-gradient(135deg, #DC2626, #991B1B); color: white;">
            <i class="fas fa-broadcast-tower"></i> Send SOS broadcast
          </button>
        </div>
      </header>

      {/* Transport stack */}
      <section>
        <h2 class="section-title font-display text-2xl mb-4">Transport stack</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 fade-in-stagger">
          {transports.map(t => (
            <div class="pillar-card p-5">
              <div class="flex items-center gap-3 mb-3">
                <span class="avatar avatar-md"><i class={`fab ${t.icon}`}></i></span>
                <div>
                  <div class="font-semibold">{t.label}</div>
                  <div class="text-[11px]" style="color: var(--muted);">Range {t.range} · {t.power} power</div>
                </div>
              </div>
              <p class="text-xs" style="color: var(--muted);">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Peers nearby (live-ish) */}
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="flex items-end justify-between mb-3">
            <h2 class="section-title font-display text-2xl">Peers within range</h2>
            <span class="text-xs flex items-center gap-1" style="color: var(--muted);"><span class="status-dot status-on"></span> Live scan</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 fade-in-stagger">
            {peers.map((p: any) => (
              <div class="pillar-card p-4 flex items-center gap-3">
                <span class={`avatar avatar-md mesh-peer`} style={p.is_relaying ? 'background: linear-gradient(135deg, #22C55E, #16A34A); color: #fff;' : ''}>
                  <i class="fas fa-user"></i>
                </span>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm truncate">{p.user_name ?? p.display_name}</div>
                  <div class="text-[11px] flex items-center gap-2" style="color: var(--muted);">
                    <span class="chip text-[10px]"><i class={`fab ${p.transport === 'ble' ? 'fa-bluetooth-b' : p.transport === 'wifi-direct' ? 'fa-wifi' : 'fa-link'}`}></i> {p.transport}</span>
                    <span>{p.distance_m} m</span>
                    <span>{p.rssi_dbm} dBm</span>
                  </div>
                </div>
                {p.is_relaying ? <span class="chip chip-success text-[10px]"><i class="fas fa-share-nodes"></i> Relaying</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 class="section-title font-display text-2xl mb-3">Recent SOS broadcasts</h2>
          <ul id="mesh-log" class="space-y-2">
            {alerts.map((a: any) => (
              <li class="glass p-3 text-xs">
                <div class="flex items-center gap-2">
                  <span class={`status-dot ${a.resolved ? 'status-off' : 'status-warn'}`}></span>
                  <span class="font-semibold capitalize">{a.severity}</span>
                  <span class="ms-auto" style="color: var(--muted-2);">{timeAgo(a.created_at)}</span>
                </div>
                <div class="mt-1" style="color: var(--muted);">{a.message}</div>
                <div class="mt-1 text-[10px]" style="color: var(--muted-2);">
                  <i class="fas fa-share-nodes text-gold"></i> Relayed to {a.peers_reached} peers · {a.display_name} · {a.city}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mesh group chat + offline queue concept */}
      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="pillar-card p-5">
          <i class="fas fa-users text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Mesh group chats</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">Messages flood through every nearby peer with a TTL of 6 hops and an LRU dedup cache. Anyone with the room key can join — no homeserver required.</p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-clock-rotate-left text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Offline message queue</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">Outgoing messages persist locally with a deterministic ID. When mesh peers — or the internet — reappear, the queue drains and Matrix events sync without duplication.</p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-file-shield text-gold text-2xl mb-2"></i>
          <h3 class="font-display text-xl">IPFS file sharing</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">CIDs propagate over BLE so files can hop between phones in a metro car. Once a single phone re-attaches to the public IPFS swarm, the file is globally pinned automatically.</p>
        </div>
        <div class="pillar-card p-5">
          <i class="fas fa-triangle-exclamation text-red-500 text-2xl mb-2"></i>
          <h3 class="font-display text-xl">Emergency SOS</h3>
          <p class="text-sm mt-1" style="color: var(--muted);">A single tap floods every transport with a signed, time-stamped beacon containing your coarse location and medical info (opt-in). Peers acknowledge — you can <em>see</em> who heard you.</p>
        </div>
      </section>

    </div>,
    { title: n.module_mesh, lang, country, active: 'mesh' }
  )
}
