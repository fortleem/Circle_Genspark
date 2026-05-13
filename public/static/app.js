// Circle — client-side enhancements for the web companion.
// Pages are server-rendered; this file only wires up small interactive bits.

(function () {
  'use strict'

  // ── Midan: compose + like ────────────────────────────────────────────────
  const midanCompose = document.getElementById('midan-compose')
  if (midanCompose) {
    midanCompose.addEventListener('submit', async (e) => {
      e.preventDefault()
      const fd = new FormData(midanCompose)
      const body = {
        author_id: 1,
        content: fd.get('content'),
        hashtags: fd.get('hashtags') || null,
        city: fd.get('city') || null,
        anonymous: fd.get('anonymous') ? 1 : 0
      }
      if (!body.content || body.content.toString().trim().length === 0) return
      try {
        const r = await axios.post('/api/midan/posts', body)
        if (r.data && r.data.ok) window.location.reload()
      } catch (err) { alert('Failed to post: ' + err.message) }
    })
  }

  document.querySelectorAll('[data-action="like-post"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      try {
        const r = await axios.post(`/api/midan/posts/${id}/like`)
        const span = document.querySelector(`[data-likes="${id}"]`)
        if (span && r.data) span.textContent = fmtCount(r.data.likes)
      } catch {}
    })
  })

  // ── Events: interested ───────────────────────────────────────────────────
  document.querySelectorAll('[data-action="interested"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.post(`/api/events/${btn.dataset.id}/interested`)
        btn.innerHTML = '<i class="fas fa-bookmark mr-1"></i> Interested ✓'
        btn.disabled = true
        btn.classList.add('opacity-70')
      } catch {}
    })
  })

  // ── Governance: vote ─────────────────────────────────────────────────────
  document.querySelectorAll('[data-action="vote"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.post(`/api/governance/proposals/${btn.dataset.id}/vote`, { vote: btn.dataset.vote })
        window.location.reload()
      } catch (err) { alert('Vote failed: ' + err.message) }
    })
  })

  // ── Wasl: send message ───────────────────────────────────────────────────
  const wasl = document.getElementById('wasl-send')
  if (wasl) {
    wasl.addEventListener('submit', async (e) => {
      e.preventDefault()
      const fd = new FormData(wasl)
      const body = (fd.get('body') || '').toString().trim()
      if (!body) return
      try {
        await axios.post(`/api/wasl/rooms/${encodeURIComponent(wasl.dataset.room)}/messages`, {
          sender_id: 1, body
        })
        window.location.reload()
      } catch (err) { alert('Send failed: ' + err.message) }
    })
  }

  // ── Rihla: generate itinerary ────────────────────────────────────────────
  const rihla = document.getElementById('rihla-plan')
  if (rihla) {
    rihla.addEventListener('submit', async (e) => {
      e.preventDefault()
      const fd = new FormData(rihla)
      const result = document.getElementById('rihla-result')
      result.classList.remove('hidden')
      result.innerHTML = '<i class="fas fa-spinner fa-spin text-gold mr-2"></i> Asking the on-device model…'
      try {
        const body = {
          user_id: 1,
          city: fd.get('city'),
          days: Number(fd.get('days') || 3),
          interests: (fd.get('interests') || '').toString().split(',').map((s) => s.trim()).filter(Boolean)
        }
        const r = await axios.post('/api/rihla/itinerary', body)
        const plan = r.data.plan
        let html = `<h3 class="font-display text-xl text-ink mb-2">${escapeHtml(body.city)} · ${body.days} days</h3><ol class="space-y-3 text-sm">`
        Object.entries(plan).forEach(([day, slots], i) => {
          html += `<li class="border-l-4 border-gold pl-3"><div class="font-semibold capitalize text-ink">Day ${i + 1} (${day})</div>`
          html += `<ul class="text-xs text-charcoal/80 mt-1 space-y-0.5">`
          Object.entries(slots).forEach(([slot, txt]) => {
            html += `<li><span class="font-semibold capitalize text-goldDark">${escapeHtml(slot)}:</span> ${escapeHtml(txt)}</li>`
          })
          html += `</ul></li>`
        })
        html += '</ol><p class="text-[11px] text-charcoal/50 mt-3">Generated on-device · No personal data sent.</p>'
        result.innerHTML = html
      } catch (err) {
        result.innerHTML = '<span class="text-red-700">Generation failed: ' + escapeHtml(err.message) + '</span>'
      }
    })
  }

  // ── Pay: send ────────────────────────────────────────────────────────────
  const pay = document.getElementById('pay-send')
  if (pay) {
    pay.addEventListener('submit', async (e) => {
      e.preventDefault()
      const method = (e.submitter && e.submitter.dataset.method) || 'handle'
      const fd = new FormData(pay)
      const body = {
        from_user: 1,
        to_handle: (fd.get('to_handle') || '').toString().trim(),
        amount: Number(fd.get('amount') || 0),
        method,
        note: fd.get('note') || null
      }
      const out = document.getElementById('pay-result')
      if (!body.to_handle || !body.amount) { out.innerHTML = '<span class="text-red-700">Recipient and amount required.</span>'; return }
      out.innerHTML = '<i class="fas fa-spinner fa-spin text-gold"></i> Settling on the federated ledger…'
      try {
        const r = await axios.post('/api/pay/send', body)
        if (r.data.ok) {
          out.innerHTML = `<span class="text-green-700">✓ Sent ${body.amount} ${r.data.currency} to @${escapeHtml(body.to_handle)} via ${method}. Fee: <strong>$0.00</strong>.</span>`
          setTimeout(() => window.location.reload(), 1200)
        } else {
          out.innerHTML = '<span class="text-red-700">Failed: ' + escapeHtml(r.data.error || 'unknown') + '</span>'
        }
      } catch (err) {
        const msg = (err.response && err.response.data && err.response.data.error) || err.message
        out.innerHTML = '<span class="text-red-700">Failed: ' + escapeHtml(msg) + '</span>'
      }
    })
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  function fmtCount(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(n)
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    )
  }
})()
