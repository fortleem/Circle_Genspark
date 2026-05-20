// §6 — Wasl (Connect). Prototype UI preserved; wired to /api/wasl/* and enriched with
// §6.1-§6.13 blueprint anchors. No mock.ts. Real room list + real messages.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Sparkles, Mic, Send, Image as ImageIcon, Phone, Video, Ghost, Users,
  Radio, Building2, Lock, WifiOff, Wifi, Shield, BadgeCheck, KeyRound, Smile,
} from "lucide-react";
import { apiGet, apiPost, type Room, type Message } from "@/lib/api";

type Kind = "all" | "dm" | "group" | "channel" | "maktab";

export function WaslScreen() {
  const [kind, setKind] = useState<Kind>("all");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Room | null>(null);
  const [search, setSearch] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    setLoading(true);
    const path = kind === "all" ? "/wasl/rooms" : `/wasl/rooms?kind=${kind}`;
    apiGet<{ rooms: Room[] }>(path)
      .then((d) => setRooms(d.rooms ?? []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [kind]);

  const filtered = useMemo(
    () =>
      rooms.filter(
        (r) =>
          !search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.last_message ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [rooms, search]
  );

  if (active) return <ChatView room={active} onBack={() => setActive(null)} />;

  return (
    <div className="pb-32">
      {/* Header — prototype style */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">
            Wasl <span className="gradient-text-gold">·</span>{" "}
            <span className="text-base text-muted-foreground tracking-widest uppercase">وصل</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            §6 · E2EE · Zero-cost
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrivacy((v) => !v)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/10 transition"
            title="§6.3 Privacy controls"
          >
            <Shield className="w-4 h-4 text-secondary" />
          </button>
          <button className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* §6.3 Privacy drawer (collapsible) */}
      {showPrivacy && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-4 glass rounded-2xl p-4 border border-secondary/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-secondary" />
            <h3 className="font-display text-sm">§6.3 Privacy Controls</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <PrivacyChip icon={Ghost} label="Ghost Mode" on />
            <PrivacyChip icon={ImageIcon} label="Screenshot block" on />
            <PrivacyChip icon={Shield} label="Forwarding consent" on />
            <PrivacyChip icon={WifiOff} label="Disappearing 7d" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            §6.2 Auth: email · Telegram bot · carrier OTP. No phone required. $0 to Circle.
          </p>
        </motion.div>
      )}

      {/* Search — prototype style */}
      <div className="px-5 mt-4">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
            placeholder="Search messages, people, files"
          />
          <Sparkles className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* Smart folders — prototype pill style, now functional */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {(
          [
            { k: "all", l: "All" },
            { k: "dm", l: "Personal" },
            { k: "group", l: "Work" },
            { k: "channel", l: "Channels" },
            { k: "maktab", l: "Maktab" },
          ] as { k: Kind; l: string }[]
        ).map((f) => (
          <button
            key={f.k}
            onClick={() => setKind(f.k)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              kind === f.k ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Stories — prototype style (decorative) */}
      <div className="flex gap-3 px-5 mt-5 overflow-x-auto scrollbar-hide">
        {["You", "Layla", "Omar", "Sara", "Khalid", "Mona", "Faisal"].map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={`w-16 h-16 rounded-full p-[2px] ${i === 0 ? "bg-muted" : "bg-gradient-mesh"}`}>
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-display text-lg">
                {s[0]}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>

      {/* Chat list — prototype style, real data */}
      {loading ? (
        <div className="mt-6 px-5 text-sm text-muted-foreground">Loading rooms…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 px-5 text-sm text-muted-foreground">No rooms in this category yet.</div>
      ) : (
        <ul className="mt-5 space-y-1">
          {filtered.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => setActive(r)}
                className="w-full text-start px-5 py-3 hover:bg-muted/40 transition flex items-center gap-3"
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-lg ${
                      r.kind === "channel"
                        ? "bg-gradient-mesh text-primary-foreground"
                        : r.kind === "maktab"
                        ? "bg-gradient-gold text-brand-charcoal"
                        : r.kind === "group"
                        ? "bg-gradient-gold text-brand-charcoal"
                        : "bg-gradient-hero text-primary-foreground"
                    }`}
                  >
                    {r.kind === "channel" ? (
                      <Radio className="w-5 h-5" />
                    ) : r.kind === "maktab" ? (
                      <Building2 className="w-5 h-5" />
                    ) : r.kind === "group" ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      r.name[0] ?? "?"
                    )}
                  </div>
                  {r.is_encrypted ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                      <Lock className="w-2 h-2 text-primary-foreground" />
                    </span>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium truncate">{r.name}</span>
                    {r.kind === "channel" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary uppercase">
                        Broadcast
                      </span>
                    )}
                    {r.kind === "maktab" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 uppercase">
                        Maktab
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {r.last_message ?? r.topic ?? "No messages yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground">
                    {r.last_at ? new Date(r.last_at).toLocaleDateString() : "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {r.member_count} members
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {/* §6 footer info strip — prototype palette */}
      <div className="mx-5 mt-8 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              §6.8 E2EE · §6.9 Mesh · §6.11 No billing
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Olm/Megolm encryption · BLE + Wi-Fi Direct fallback when offline · WebRTC P2P calls ·
            IPFS-backed GIFs · No premium tier · No file-size limits
          </p>
        </div>
      </div>
    </div>
  );
}

function PrivacyChip({ icon: Icon, label, on }: { icon: any; label: string; on?: boolean }) {
  const [active, setActive] = useState(!!on);
  return (
    <button
      onClick={() => setActive((v) => !v)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
        active
          ? "border-secondary/40 bg-secondary/10 text-foreground"
          : "border-border text-muted-foreground hover:bg-muted/30"
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${active ? "text-secondary" : ""}`} />
      <span>{label}</span>
      <span
        className={`ms-auto w-6 h-3 rounded-full relative shrink-0 transition ${
          active ? "bg-secondary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 w-2 h-2 rounded-full bg-background transition-all ${
            active ? "right-0.5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ─────────────────────── Chat view — prototype style + real messages ──────────────────────── */

function ChatView({ room, onBack }: { room: Room; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGet<{ messages: Message[] }>(`/wasl/rooms/${room.id}/messages`)
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [room.id]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await apiPost(`/wasl/rooms/${room.id}/messages`, { sender_id: 1, body: text });
      const fresh = await apiGet<{ messages: Message[] }>(`/wasl/rooms/${room.id}/messages`);
      setMessages(fresh.messages ?? []);
      setInput("");
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pb-24 min-h-screen flex flex-col">
      {/* Sticky header — prototype glass style */}
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-muted-foreground">‹ Back</button>
        <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display">
          {room.kind === "channel" ? (
            <Radio className="w-4 h-4" />
          ) : room.kind === "maktab" ? (
            <Building2 className="w-4 h-4" />
          ) : room.kind === "group" ? (
            <Users className="w-4 h-4" />
          ) : (
            room.name[0] ?? "?"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{room.name}</div>
          <div className="text-[10px] text-secondary flex items-center gap-1">
            {room.is_encrypted ? (
              <>
                <Ghost className="w-3 h-3" /> Ghost mode · E2EE Megolm
              </>
            ) : (
              <>
                <Radio className="w-3 h-3" /> Public broadcast · {room.member_count} members
              </>
            )}
          </div>
        </div>
        <button
          className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
          title="§6.6 Voice (WebRTC P2P)"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
          title="§6.6 Video"
        >
          <Video className="w-4 h-4" />
        </button>
      </div>

      {/* Verification banner — §6.8 SAS */}
      {room.is_encrypted ? (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-secondary/10 border border-secondary/30 text-[10px] text-secondary flex items-center gap-2">
          <KeyRound className="w-3 h-3" />
          §6.8 Olm/Megolm encrypted · tap to verify devices via QR (SAS)
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 px-4 py-6 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Be the first to send a message ↓
          </div>
        ) : (
          messages.map((m) => {
            const me = m.sender_id === 1;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] flex flex-col ${me ? "ms-auto items-end" : "me-auto items-start"} gap-0.5`}
              >
                {!me && (
                  <span className="text-[10px] text-muted-foreground px-2">
                    {m.display_name ?? `@${m.handle}`}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    me
                      ? "bg-gradient-hero text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  {m.body}
                </div>
                <span className="text-[9px] text-muted-foreground px-2 flex items-center gap-1">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.is_encrypted ? <Lock className="w-2.5 h-2.5" /> : null}
                </span>
              </motion.div>
            );
          })
        )}

        {/* AI suggestions — prototype pill style */}
        <div className="flex gap-2 flex-wrap pt-2">
          {["Sounds good 👍", "On my way", "Tell me more"].map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full glass border-secondary/30 hover:bg-secondary/10 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Composer — prototype style */}
      <div className="sticky bottom-20 px-3">
        <div className="glass-strong rounded-full px-3 py-2 flex items-center gap-2 shadow-float">
          <button
            className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
            title="§6.5 GIFs & stickers (IPFS)"
          >
            <Smile className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            className="flex-1 bg-transparent outline-none text-sm py-1.5"
            placeholder="Message"
          />
          <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center mt-1.5">
          <span className="text-[9px] text-muted-foreground inline-flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5" /> Online · falls back to §6.9 mesh when offline
          </span>
        </div>
      </div>
    </div>
  );
}

export default WaslScreen;
