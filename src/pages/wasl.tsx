// Wasl (وصل) — E2EE chat module. Blueprint §6.
import type { Context } from 'hono'
import { all, type Env, timeAgo } from '../db'
import { getNames } from '../i18n'

export async function waslPage(c: Context<{ Bindings: Env }>, lang: string, country: string) {
  const n = getNames(lang)
  const rooms = await all(c.env.DB, `
    SELECT r.*, (SELECT body FROM messages m WHERE m.room_id=r.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
           (SELECT created_at FROM messages m WHERE m.room_id=r.id ORDER BY m.created_at DESC LIMIT 1) AS last_at
    FROM rooms r ORDER BY last_at DESC`)

  const activeRoomId = c.req.query('room') ?? rooms[0]?.id
  const messages = activeRoomId
    ? await all(c.env.DB, `
        SELECT m.*, u.handle, u.display_name FROM messages m JOIN users u ON u.id=m.sender_id
        WHERE m.room_id = ? ORDER BY m.created_at ASC LIMIT 200`, activeRoomId)
    : []
  const activeRoom = rooms.find((r: any) => r.id === activeRoomId)

  return c.render(
    <div class="fade-in">
      <header class="mb-4">
        <h1 class="font-display text-3xl text-ink">{n.module_chat}</h1>
        <p class="text-sm text-charcoal/70">End-to-end encrypted · Olm/Megolm · No phone number required</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 bg-cream border border-gold/20 rounded-2xl overflow-hidden" style="min-height:560px">
        {/* Room list */}
        <aside class="border-r border-gold/15 bg-parchment/40">
          <div class="p-3 border-b border-gold/15 flex items-center gap-2">
            <input placeholder="Search Wasl…" class="flex-1 bg-white border border-gold/25 rounded-lg px-3 py-1.5 text-sm" />
            <button class="text-gold hover:text-goldDark"><i class="fas fa-plus-circle text-lg"></i></button>
          </div>
          <ul>
            {rooms.map((r: any) => (
              <li>
                <a href={`/wasl?room=${encodeURIComponent(r.id)}`}
                   class={`flex items-start gap-3 px-3 py-3 border-b border-gold/10 ${r.id === activeRoomId ? 'bg-gold/15' : 'hover:bg-gold/5'}`}>
                  <span class="w-10 h-10 rounded-full bg-ink text-gold flex items-center justify-center text-sm shrink-0">
                    <i class={`fas ${r.room_type === 'broadcast' ? 'fa-tower-broadcast' : r.room_type === 'workspace' ? 'fa-building' : r.room_type === 'group' ? 'fa-users' : 'fa-user'}`}></i>
                  </span>
                  <span class="flex-1 min-w-0">
                    <span class="flex items-center justify-between">
                      <span class="font-semibold text-sm text-ink truncate">{r.name}</span>
                      <span class="text-[10px] text-charcoal/50">{timeAgo(r.last_at)}</span>
                    </span>
                    <span class="block text-xs text-charcoal/60 truncate">{r.last_message ?? r.topic ?? ''}</span>
                    <span class="block text-[10px] text-gold mt-0.5"><i class="fas fa-lock"></i> E2EE · {r.room_type}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Conversation */}
        <section class="flex flex-col">
          {activeRoom ? (
            <>
              <div class="px-4 py-3 border-b border-gold/15 flex items-center gap-3 bg-white">
                <span class="w-9 h-9 rounded-full bg-ink text-gold flex items-center justify-center text-sm"><i class="fas fa-users"></i></span>
                <span class="flex-1">
                  <span class="block font-semibold text-ink">{activeRoom.name}</span>
                  <span class="block text-[11px] text-charcoal/60">{activeRoom.topic ?? activeRoom.room_type}</span>
                </span>
                <button class="text-charcoal/60 hover:text-gold"><i class="fas fa-phone"></i></button>
                <button class="text-charcoal/60 hover:text-gold"><i class="fas fa-video"></i></button>
                <button class="text-charcoal/60 hover:text-gold"><i class="fas fa-ellipsis-vertical"></i></button>
              </div>

              <div class="flex-1 p-4 space-y-2 overflow-y-auto bg-parchment/30" style="max-height:480px">
                {messages.map((m: any) => {
                  const mine = m.sender_id === 1
                  return (
                    <div class={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div class={`msg-bubble ${mine ? 'msg-mine' : 'msg-theirs'}`}>
                        {!mine && <div class="text-[10px] font-semibold opacity-70 mb-0.5">{m.display_name}</div>}
                        <div>{m.body}</div>
                        <div class="text-[9px] opacity-60 mt-1 text-right">
                          <i class="fas fa-lock"></i> {timeAgo(m.created_at)} {mine && m.status >= 3 ? '· read' : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {messages.length === 0 && <div class="text-center text-charcoal/50 text-sm py-12">No messages yet — start the conversation</div>}
              </div>

              <form id="wasl-send" data-room={activeRoomId} class="p-3 border-t border-gold/15 bg-white flex items-center gap-2">
                <button type="button" class="text-charcoal/60 hover:text-gold"><i class="fas fa-paperclip"></i></button>
                <button type="button" class="text-charcoal/60 hover:text-gold"><i class="fas fa-face-smile"></i></button>
                <input name="body" placeholder="Type a message — encrypted before it leaves your device"
                       class="flex-1 bg-parchment border border-gold/25 rounded-full px-4 py-2 text-sm" />
                <button type="submit" class="bg-ink text-gold rounded-full w-9 h-9 flex items-center justify-center"><i class="fas fa-paper-plane"></i></button>
              </form>
            </>
          ) : (
            <div class="flex-1 flex items-center justify-center text-charcoal/60">Select a conversation</div>
          )}
        </section>
      </div>

      {/* Privacy panel */}
      <section class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: 'fa-lock',          title: 'E2EE by default',     body: 'Olm (1:1) + Megolm (groups). Keys never leave your device.' },
          { icon: 'fa-ghost',         title: 'Ghost mode',          body: 'Disappearing messages, screenshot blocking, forwarding consent.' },
          { icon: 'fa-tower-cell',    title: 'Offline + mesh',      body: 'Wi-Fi Direct / Bluetooth mesh when there is no internet.' }
        ].map(card => (
          <div class="pillar-card p-4">
            <i class={`fas ${card.icon} text-gold text-xl mb-2`}></i>
            <div class="font-semibold text-sm">{card.title}</div>
            <p class="text-xs text-charcoal/70 mt-1">{card.body}</p>
          </div>
        ))}
      </section>
    </div>,
    { title: n.module_chat, lang, country, active: 'wasl' }
  )
}
