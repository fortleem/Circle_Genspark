// §27 Data Backup, Recovery & Phone Migration
import type { Context } from 'hono'
import { all, type Env } from '../db'
import { getNames } from '../i18n'

export async function backupPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const items = await all(c.env.DB, 'SELECT * FROM backups WHERE user_id = 1 ORDER BY created_at DESC')

  const methods = [
    { slug: 'local_file',     icon: 'fa-hard-drive',    name: 'Local encrypted file',  cost: '$0', desc: 'AES-256-GCM, PBKDF2 100k iterations. Save the .circlebackup to SD card, USB-OTG, or copy to a PC. No cloud touched.' },
    { slug: 'ipfs',           icon: 'fa-share-nodes',   name: 'IPFS + passphrase',     cost: '$0', desc: 'Same encrypted archive, added to IPFS. You get a CID + passphrase. Restore from anywhere with internet. Community nodes optionally pin.' },
    { slug: 'trusted_circle', icon: 'fa-users',         name: 'Trusted Circle (M-of-N)',cost: '$0', desc: 'Shamir Secret Sharing splits the key across N trusted contacts. Need any M (e.g. 3-of-5) shards to recover. The shards are encrypted to each contact\u2019s public key.' },
    { slug: 'matrix_keys',    icon: 'fa-key',           name: 'Matrix key backup',     cost: '$0', desc: 'Encrypted Megolm session keys, recoverable on a new device with your one-time recovery key. Default-on, opt-out.' }
  ]

  return c.render(
    <div class="fade-in space-y-8">
      <header class="card-dark rounded-3xl p-8">
        <div class="eyebrow text-gold-light">§27 · Never lose anything, never pay anyone</div>
        <h1 class="font-display text-4xl md:text-5xl text-gradient-gold mt-2">{n.module_backup}</h1>
        <p class="text-cream/80 mt-3 max-w-3xl">Four independent backup methods. All encrypted end-to-end. All zero-cost. No iCloud, no Google One, no billing details — ever. When you buy a new phone, sign in once and pick a restore method: minutes later, every message, every photo CID, every preference is back.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-3 fade-in-stagger">
        {methods.map(m => {
          const live = items.find((i: any) => i.method === m.slug)
          return (
            <article class="pillar-card p-5">
              <div class="flex items-start gap-3">
                <span class="avatar avatar-md"><i class={`fas ${m.icon}`}></i></span>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold">{m.name}</div>
                  <div class="text-[11px]" style="color: var(--muted);">Cost {m.cost} · {live ? 'configured' : 'not configured'}</div>
                </div>
                {live ? <span class="chip chip-success text-[10px]"><i class="fas fa-check"></i> Active</span> : <span class="chip text-[10px]">Available</span>}
              </div>
              <p class="text-sm mt-2" style="color: var(--muted);">{m.desc}</p>
              {live && (
                <div class="mt-2 text-[11px] font-mono" style="color: var(--muted-2);">
                  {live.size_mb ? <span>{live.size_mb} MB · </span> : null}
                  {live.cid && <span>{live.cid} · </span>}
                  {live.shards_threshold && <span>{live.shards_threshold}-of-{live.shards_total} shards · </span>}
                  {live.encrypted ? 'AES-256-GCM' : 'plain'}
                </div>
              )}
              <button class="btn btn-ghost mt-3 text-xs"><i class="fas fa-arrow-rotate-right"></i> {live ? 'Update' : 'Configure'}</button>
            </article>
          )
        })}
      </section>

      <section class="card-dark rounded-2xl p-6">
        <div class="eyebrow text-gold-light mb-3">Migration to a new phone</div>
        <ol class="space-y-2 text-sm text-cream/90 list-decimal pl-6 marker:text-gold">
          <li>Install Circle on the new phone, sign in with your Circle ID.</li>
          <li>Restore Matrix key backup — enter your recovery key. Chat history decrypts.</li>
          <li>Choose <strong>Restore from IPFS</strong>, paste the CID + passphrase. The encrypted archive downloads.</li>
          <li>Local interactions, settings, recommendation vector and IPFS CIDs are restored.</li>
          <li>Trusted Circle Recovery (optional fallback): if you lost the passphrase, request shards from your 3-of-5 contacts. After M acknowledgements, the key reconstructs.</li>
        </ol>
        <div class="mt-3 text-xs text-cream/60">No cloud account. No subscription. No "premium" tier. Just keys, math, and your own files.</div>
      </section>
    </div>,
    { title: n.module_backup, lang, country, active: 'backup' }
  )
}
