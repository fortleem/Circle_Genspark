// Circle Payments (Nat) — fee-free federated transfers. Blueprint §21.
import type { Context } from 'hono'
import { all, first, type Env, fmtMoney, timeAgo } from '../db'
import { getNames } from '../i18n'
import { configFor } from '../dre'

export async function payPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const cfg = configFor(country)
  const userId = 1
  const [wallet, txns] = await Promise.all([
    first<any>(c.env.DB, 'SELECT * FROM wallets WHERE user_id = ?', userId),
    all(c.env.DB, `
      SELECT t.*, uf.display_name AS from_name, uf.handle AS from_handle,
             ut.display_name AS to_name, ut.handle AS to_handle
      FROM transactions t
      LEFT JOIN users uf ON uf.id=t.from_user
      LEFT JOIN users ut ON ut.id=t.to_user
      WHERE t.from_user = ? OR t.to_user = ? ORDER BY t.created_at DESC LIMIT 25`, userId, userId)
  ])

  return c.render(
    <div class="fade-in space-y-6">
      <header>
        <h1 class="font-display text-3xl text-ink">{n.module_payments}</h1>
        <p class="text-sm text-charcoal/70">Federated fee-free transfers · Handle, NFC, QR · Local methods via DRE</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
        {/* Wallet card */}
        <section class="bg-ink text-cream rounded-2xl p-6 border border-gold/30 relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-48 h-48 bg-gold/15 rounded-full blur-2xl"></div>
          <div class="relative">
            <div class="text-xs uppercase tracking-widest text-cream/60">Wallet · {wallet?.currency ?? 'EGP'}</div>
            <div class="font-display text-5xl text-gold mt-2">{fmtMoney(wallet?.balance ?? 0, wallet?.currency ?? 'EGP')}</div>
            <div class="text-xs text-cream/60 mt-1">Fee per transfer: <span class="text-gold font-semibold">$0.00</span></div>
            <div class="flex flex-wrap gap-2 mt-4 text-[11px]">
              {cfg.features.payment_methods.map(m => (
                <span class="chip chip-dark">{m.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Send form */}
        <section class="pillar-card p-5">
          <h2 class="font-semibold text-sm uppercase tracking-widest text-charcoal/60 mb-3">Send by handle</h2>
          <form id="pay-send" class="space-y-3">
            <label class="block">
              <span class="text-xs text-charcoal/70">To</span>
              <input name="to_handle" placeholder="layla" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm" />
            </label>
            <label class="block">
              <span class="text-xs text-charcoal/70">Amount ({wallet?.currency ?? 'EGP'})</span>
              <input name="amount" type="number" step="0.01" min="0.01" placeholder="100" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm" />
            </label>
            <label class="block">
              <span class="text-xs text-charcoal/70">Note</span>
              <input name="note" placeholder="Koshari ❤️" class="mt-1 w-full bg-white border border-gold/25 rounded-lg px-3 py-2 text-sm" />
            </label>
            <div class="flex gap-2">
              <button type="submit" data-method="handle" class="flex-1 bg-ink text-gold py-2 rounded-lg text-sm font-semibold"><i class="fas fa-at"></i> Handle</button>
              <button type="submit" data-method="qr"     class="flex-1 bg-gold text-ink py-2 rounded-lg text-sm font-semibold"><i class="fas fa-qrcode"></i> QR</button>
              <button type="submit" data-method="nfc"    class="flex-1 bg-charcoal text-gold py-2 rounded-lg text-sm font-semibold"><i class="fas fa-wifi rotate-90"></i> NFC</button>
            </div>
          </form>
          <div id="pay-result" class="mt-2 text-xs"></div>
        </section>
      </div>

      <section>
        <h2 class="section-title font-display text-2xl text-ink mb-3">Recent transactions</h2>
        <div class="pillar-card p-0 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-cream/60 text-charcoal/60 text-xs uppercase tracking-wider">
              <tr>
                <th class="text-left p-3">When</th>
                <th class="text-left p-3">From</th>
                <th class="text-left p-3">To</th>
                <th class="text-left p-3">Method</th>
                <th class="text-right p-3">Amount</th>
                <th class="text-left p-3">Note</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gold/10">
              {txns.map((t: any) => {
                const out = t.from_user === userId
                return (
                  <tr>
                    <td class="p-3 text-charcoal/70 text-xs">{timeAgo(t.created_at)}</td>
                    <td class="p-3">{t.from_name ?? '—'}</td>
                    <td class="p-3">{t.to_name ?? '—'}</td>
                    <td class="p-3"><span class="chip text-[10px]">{t.method}</span></td>
                    <td class={`p-3 text-right font-semibold ${out ? 'text-red-700' : 'text-green-700'}`}>{out ? '−' : '+'}{fmtMoney(t.amount, t.currency)}</td>
                    <td class="p-3 text-charcoal/70 text-xs">{t.note ?? ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>,
    { title: n.module_payments, lang, country, active: 'pay' }
  )
}
