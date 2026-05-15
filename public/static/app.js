// Circle — client-side enhancements for the web companion.
// Pages are server-rendered; this file wires up small interactive bits.

(function () {
  'use strict'

  // ── THEME TOGGLE ─────────────────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-toggle')
  const iconSun  = document.getElementById('icon-sun')
  const iconMoon = document.getElementById('icon-moon')
  function applyTheme(t) {
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
      if (iconSun)  iconSun.classList.add('hidden')
      if (iconMoon) iconMoon.classList.remove('hidden')
    } else {
      document.documentElement.classList.remove('dark')
      if (iconSun)  iconSun.classList.remove('hidden')
      if (iconMoon) iconMoon.classList.add('hidden')
    }
  }
  // Initial sync (theme was already applied pre-paint by inline script)
  applyTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
      try { localStorage.setItem('circle-theme', next) } catch {}
      applyTheme(next)
    })
  }

  // ── MOBILE NAV DRAWER ────────────────────────────────────────────────────
  const mobileBtn      = document.getElementById('mobile-menu-btn')
  const mobileClose    = document.getElementById('mobile-close-btn')
  const mobileNav      = document.getElementById('mobile-nav')
  const mobileBackdrop = document.getElementById('mobile-nav-backdrop')
  function openMobileNav() {
    if (!mobileNav) return
    mobileNav.classList.add('open')
    mobileNav.classList.remove('hidden')
    if (mobileBackdrop) mobileBackdrop.classList.remove('hidden')
  }
  function closeMobileNav() {
    if (!mobileNav) return
    mobileNav.classList.remove('open')
    mobileNav.classList.add('hidden')
    if (mobileBackdrop) mobileBackdrop.classList.add('hidden')
  }
  // Default closed on load
  closeMobileNav()
  if (mobileBtn)      mobileBtn.addEventListener('click', openMobileNav)
  if (mobileClose)    mobileClose.addEventListener('click', closeMobileNav)
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileNav)

  // ── COMMAND PALETTE (⌘K / Ctrl+K) ────────────────────────────────────────
  const cmdTrigger = document.getElementById('cmd-trigger')
  const cmdPalette = document.getElementById('cmd-palette')
  const cmdInput   = document.getElementById('cmd-input')
  const cmdResults = document.getElementById('cmd-results')

  const commands = [
    { label: 'Home — Dashboard',           href: '/',             icon: 'fa-house',           tags: 'home dashboard launchpad' },
    { label: 'Wasl — Chat',                href: '/wasl',         icon: 'fa-comments',        tags: 'chat message wasl matrix e2ee' },
    { label: 'Mashahd — Videos',           href: '/mashahd',      icon: 'fa-circle-play',     tags: 'video mashahd peertube' },
    { label: 'Lamahat — Photos',           href: '/lamahat',      icon: 'fa-images',          tags: 'photo lamahat instagram glimpses' },
    { label: 'Midan — Square',             href: '/midan',        icon: 'fa-hashtag',         tags: 'square midan twitter post' },
    { label: 'Circles — Groups',           href: '/circles',      icon: 'fa-circle-nodes',    tags: 'group circle community' },
    { label: 'Official Channels',          href: '/channels',     icon: 'fa-tower-broadcast', tags: 'official channel broadcast' },
    { label: 'Creator Channels',           href: '/creators',     icon: 'fa-palette',         tags: 'creator youtube channel' },
    { label: 'Pro Network — Jobs',         href: '/pro',          icon: 'fa-briefcase',       tags: 'pro linkedin job career' },
    { label: 'Rihla — Travel',             href: '/rihla',        icon: 'fa-plane',           tags: 'travel rihla itinerary' },
    { label: 'Maps — Offline',             href: '/maps',         icon: 'fa-map-location-dot', tags: 'maps osm offline tile' },
    { label: 'Pay — Wallet',               href: '/pay',          icon: 'fa-wallet',          tags: 'pay payment wallet nat fawry vodafone' },
    { label: 'Mail — Free email',          href: '/mail',         icon: 'fa-envelope',        tags: 'mail email circle inbox' },
    { label: 'Mini Apps',                  href: '/apps',         icon: 'fa-grid-2',          tags: 'apps mini hub uber didi' },
    { label: 'Self-Learning AI Core',      href: '/aicore',       icon: 'fa-microchip',       tags: 'ai self-learning federated learning ondevice' },
    { label: 'Local Mesh Offline',         href: '/mesh',         icon: 'fa-tower-cell',      tags: 'mesh bluetooth wifi direct libp2p sos' },
    { label: 'Translate — 200 languages',  href: '/translate',    icon: 'fa-language',        tags: 'translate nllb whisper tts language' },
    { label: 'Privacy Dashboard',          href: '/privacy',      icon: 'fa-user-shield',     tags: 'privacy consent ghost mode dashboard' },
    { label: 'AI Safety & Moderation',     href: '/aisafety',     icon: 'fa-shield-virus',    tags: 'ai safety moderation nsfw toxicity jury' },
    { label: 'Backup & Migration',         href: '/backup',       icon: 'fa-cloud-arrow-down',tags: 'backup recovery migration shamir' },
    { label: 'Unique Features',            href: '/unique',       icon: 'fa-wand-magic-sparkles', tags: 'unique echoes danmaku memoir vault ticketing' },
    { label: 'AI Model Catalogue',         href: '/models',       icon: 'fa-brain',           tags: 'models catalogue onnx distilgpt nllb whisper' },
    { label: 'Self-Host — Deployment',     href: '/selfhost',     icon: 'fa-server',          tags: 'self host deploy synapse peertube mailcow' },
    { label: 'Roadmap',                    href: '/roadmap',      icon: 'fa-route',           tags: 'roadmap phase plan' },
    { label: 'User Journeys',              href: '/journeys',     icon: 'fa-shoe-prints',     tags: 'journey scenario story layla ahmed' },
    { label: 'Governance — DAO',           href: '/governance',   icon: 'fa-scale-balanced',  tags: 'governance dao vote proposal' },
    { label: 'Transparency — Ledger',      href: '/transparency', icon: 'fa-eye',             tags: 'transparency ledger ad revenue' },
    { label: 'The Covenant',               href: '/covenant',     icon: 'fa-scroll',          tags: 'covenant promise charter' },
    { label: 'Circle ID — OIDC',           href: '/id',           icon: 'fa-id-card',         tags: 'identity oidc verify' },
    { label: 'Settings',                   href: '/settings',     icon: 'fa-gear',            tags: 'settings preferences region language' }
  ]
  let cmdSelected = 0
  function renderCmdResults(q) {
    if (!cmdResults) return
    const term = (q || '').trim().toLowerCase()
    const list = term
      ? commands.filter(c => (c.label + ' ' + c.tags).toLowerCase().includes(term))
      : commands
    cmdSelected = 0
    cmdResults.innerHTML = list.slice(0, 12).map((c, i) => `
      <li>
        <a href="${c.href}" data-idx="${i}"
           class="flex items-center gap-3 px-3 py-2 rounded-lg ${i === 0 ? 'bg-[var(--bg-soft)]' : ''} hover:bg-[var(--bg-soft)]">
          <i class="fas ${c.icon} text-gold w-4"></i>
          <span class="flex-1 text-[var(--ink)]">${escapeHtml(c.label)}</span>
          <i class="fas fa-arrow-turn-down rotate-90 text-[10px]" style="color: var(--muted-2);"></i>
        </a>
      </li>`).join('') || `<li class="px-3 py-6 text-center text-[var(--muted)]">No matches.</li>`
  }
  function openCmd() {
    if (!cmdPalette) return
    cmdPalette.classList.remove('hidden')
    cmdPalette.classList.add('flex')
    renderCmdResults('')
    setTimeout(() => cmdInput && cmdInput.focus(), 0)
  }
  function closeCmd() {
    if (!cmdPalette) return
    cmdPalette.classList.add('hidden')
    cmdPalette.classList.remove('flex')
    if (cmdInput) cmdInput.value = ''
  }
  if (cmdTrigger) cmdTrigger.addEventListener('click', openCmd)
  if (cmdInput)   cmdInput.addEventListener('input', (e) => renderCmdResults(e.target.value))
  if (cmdPalette) cmdPalette.addEventListener('click', (e) => { if (e.target === cmdPalette) closeCmd() })
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmd() }
    if (e.key === 'Escape') closeCmd()
    if (!cmdPalette || cmdPalette.classList.contains('hidden')) return
    if (e.key === 'Enter') {
      const items = cmdResults.querySelectorAll('a')
      if (items[cmdSelected]) { window.location.href = items[cmdSelected].getAttribute('href') }
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = cmdResults.querySelectorAll('a')
      if (!items.length) return
      items[cmdSelected]?.classList.remove('bg-[var(--bg-soft)]')
      cmdSelected = (cmdSelected + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[cmdSelected]?.classList.add('bg-[var(--bg-soft)]')
      items[cmdSelected]?.scrollIntoView({ block: 'nearest' })
    }
  })

  // ── COUNT-UP ANIMATIONS ──────────────────────────────────────────────────
  function animateCount(el) {
    const target = Number(el.dataset.count || '0')
    const dur = 1200
    const start = performance.now()
    const isFloat = String(el.dataset.count || '').includes('.')
    const suffix = el.dataset.suffix || ''
    const prefix = el.dataset.prefix || ''
    function tick(now) {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = target * eased
      el.textContent = prefix + (isFloat ? v.toFixed(1) : fmtCount(Math.floor(v))) + suffix
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  const counters = document.querySelectorAll('[data-count]')
  if (counters.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target) }
      })
    }, { threshold: 0.4 })
    counters.forEach(c => obs.observe(c))
  }

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
        btn.classList.add('text-red-500')
      } catch {}
    })
  })

  // ── Events: interested ───────────────────────────────────────────────────
  document.querySelectorAll('[data-action="interested"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.post(`/api/events/${btn.dataset.id}/interested`)
        btn.innerHTML = '<i class="fas fa-check mr-1"></i> Interested'
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
        let html = `<h3 class="font-display text-xl mb-2">${escapeHtml(body.city)} · ${body.days} days</h3><ol class="space-y-3 text-sm">`
        Object.entries(plan).forEach(([day, slots], i) => {
          html += `<li class="border-s-4 ps-3" style="border-color: var(--gold);"><div class="font-semibold capitalize">Day ${i + 1} (${day})</div>`
          html += `<ul class="text-xs mt-1 space-y-0.5" style="color: var(--muted);">`
          Object.entries(slots).forEach(([slot, txt]) => {
            html += `<li><span class="font-semibold capitalize" style="color: var(--gold-dark);">${escapeHtml(slot)}:</span> ${escapeHtml(txt)}</li>`
          })
          html += `</ul></li>`
        })
        html += '</ol><p class="text-[11px] mt-3" style="color: var(--muted-2);">Generated on-device · No personal data sent.</p>'
        result.innerHTML = html
      } catch (err) {
        result.innerHTML = '<span class="text-red-500">Generation failed: ' + escapeHtml(err.message) + '</span>'
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
      if (!body.to_handle || !body.amount) { out.innerHTML = '<span class="text-red-500">Recipient and amount required.</span>'; return }
      out.innerHTML = '<i class="fas fa-spinner fa-spin text-gold"></i> Settling on the federated ledger…'
      try {
        const r = await axios.post('/api/pay/send', body)
        if (r.data.ok) {
          out.innerHTML = `<span class="text-green-600 font-semibold">✓ Sent ${body.amount} ${r.data.currency} to @${escapeHtml(body.to_handle)} via ${method}. Fee: <strong>$0.00</strong>.</span>`
          setTimeout(() => window.location.reload(), 1200)
        } else {
          out.innerHTML = '<span class="text-red-500">Failed: ' + escapeHtml(r.data.error || 'unknown') + '</span>'
        }
      } catch (err) {
        const msg = (err.response && err.response.data && err.response.data.error) || err.message
        out.innerHTML = '<span class="text-red-500">Failed: ' + escapeHtml(msg) + '</span>'
      }
    })
  }

  // ── Translate: live demo ─────────────────────────────────────────────────
  const trans = document.getElementById('translate-form')
  if (trans) {
    trans.addEventListener('submit', async (e) => {
      e.preventDefault()
      const fd = new FormData(trans)
      const out = document.getElementById('translate-output')
      out.innerHTML = '<i class="fas fa-spinner fa-spin text-gold"></i> Running NLLB-200 on-device…'
      try {
        const r = await axios.post('/api/translate', {
          text: fd.get('text'),
          to:   fd.get('to'),
          from: fd.get('from') || 'auto'
        })
        out.innerHTML = `
          <div class="text-xs mb-1" style="color: var(--muted);">→ ${escapeHtml(r.data.to)} · model: ${escapeHtml(r.data.model)}</div>
          <div class="text-base">${escapeHtml(r.data.translated)}</div>
        `
      } catch (err) {
        out.innerHTML = '<span class="text-red-500">Translation failed.</span>'
      }
    })
  }

  // ── Mesh demo: simulate SOS broadcast ────────────────────────────────────
  const sosBtn = document.getElementById('mesh-sos')
  if (sosBtn) {
    sosBtn.addEventListener('click', async () => {
      sosBtn.disabled = true
      sosBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Broadcasting via BLE + Wi-Fi Direct…'
      try {
        const r = await axios.post('/api/mesh/sos', { user_id: 1, message: 'SOS broadcast (demo)' })
        const log = document.getElementById('mesh-log')
        if (log) {
          const li = document.createElement('li')
          li.className = 'glass p-3 text-xs'
          li.innerHTML = `<i class="fas fa-triangle-exclamation text-red-500"></i> SOS broadcast — relayed to ${r.data.peers_reached || 0} peers · ${new Date().toLocaleTimeString()}`
          log.prepend(li)
        }
        sosBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Broadcast sent'
        setTimeout(() => {
          sosBtn.disabled = false
          sosBtn.innerHTML = '<i class="fas fa-broadcast-tower mr-2"></i> Send SOS broadcast'
        }, 2500)
      } catch (err) {
        sosBtn.disabled = false
        sosBtn.innerHTML = '<i class="fas fa-broadcast-tower mr-2"></i> Send SOS broadcast'
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
