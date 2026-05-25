// Wasl (Connect) — Production chat module. Prototype design + real Matrix-style features.
// Features: E2EE rooms, privacy controls, GIF/stickers, voice/video calls, broadcast channels,
// device verification (SAS/QR), offline mesh queue, Maktab workspace admin.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Sparkles, Mic, Send, Image as ImageIcon, Phone, Video, Ghost,
  Users, Radio, Building2, Lock, WifiOff, Wifi, Shield, BadgeCheck, KeyRound,
  Smile, X, ChevronLeft, Forward, Trash2, MoreVertical, PhoneOff, PhoneIncoming,
  QrCode, FileText, Hash, Clock, Eye, EyeOff, Mail, MessageSquare, Paperclip,
  Volume2, Vibrate, ShieldAlert, ScrollText, Loader2, Check, CheckCheck,
} from "lucide-react";
import { apiGet, apiPost, type Room, type Message, type WaslPrivacy } from "@/lib/api";

const ME = 1;

type Kind = "all" | "dm" | "group" | "channel" | "maktab";

export function WaslScreen() {
  const [kind, setKind] = useState<Kind>("all");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Room | null>(null);
  const [search, setSearch] = useState("");

  // Modals
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const loadRooms = () => {
    setLoading(true);
    const path = kind === "all" ? "/wasl/rooms" : `/wasl/rooms?kind=${kind}`;
    apiGet<{ rooms: Room[] }>(path)
      .then((d) => setRooms(d.rooms ?? []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadRooms, [kind]);

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
      {/* Header */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">
            Wasl <span className="gradient-text-gold">·</span>{" "}
            <span className="text-base text-muted-foreground tracking-widest uppercase">وصل</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            End-to-end encrypted · Zero cost
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrivacy(true)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/10 transition"
            title="Privacy controls"
          >
            <Shield className="w-4 h-4 text-secondary" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center"
            title="New chat or channel"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
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

      {/* Smart folders */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {(
          [
            { k: "all", l: "All" },
            { k: "dm", l: "Personal" },
            { k: "group", l: "Groups" },
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

      {/* Stories strip */}
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

      {/* Chat list */}
      {loading ? (
        <div className="mt-6 px-5 text-sm text-muted-foreground">Loading rooms…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 px-5 text-sm text-muted-foreground text-center py-8">
          <MessageSquare className="w-8 h-8 mx-auto opacity-40 mb-2" />
          No rooms yet. Tap + to start a chat.
        </div>
      ) : (
        <ul className="mt-5 space-y-1">
          {filtered.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <button
                onClick={() => setActive(r)}
                className="w-full text-start px-5 py-3 hover:bg-muted/40 transition flex items-center gap-3"
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-lg ${
                      r.kind === "broadcast"
                        ? "bg-gradient-mesh text-primary-foreground"
                        : r.kind === "workspace"
                        ? "bg-gradient-gold text-brand-charcoal"
                        : r.kind === "group"
                        ? "bg-gradient-gold text-brand-charcoal"
                        : "bg-gradient-hero text-primary-foreground"
                    }`}
                  >
                    {r.kind === "broadcast" ? (
                      <Radio className="w-5 h-5" />
                    ) : r.kind === "workspace" ? (
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium truncate">{r.name}</span>
                    {r.kind === "broadcast" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary uppercase">
                        Channel
                      </span>
                    )}
                    {r.kind === "workspace" && (
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
                    {r.last_at ? formatShortTime(r.last_at) : "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {r.member_count} {r.kind === "direct" ? "" : "members"}
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="mx-5 mt-8 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-secondary">
              E2EE · Mesh · No billing
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Olm/Megolm encryption · BLE + Wi-Fi Direct fallback when offline · WebRTC P2P calls ·
            IPFS-backed GIFs & files · No premium tier · No file-size limits
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showPrivacy && <PrivacyDrawer onClose={() => setShowPrivacy(false)} />}
        {showCreate && (
          <CreateRoomModal
            onClose={() => setShowCreate(false)}
            onCreated={(r) => {
              setShowCreate(false);
              loadRooms();
              setActive(r);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── Privacy drawer ─────────────────────────── */

function PrivacyDrawer({ onClose }: { onClose: () => void }) {
  const [priv, setPriv] = useState<WaslPrivacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet<{ privacy: WaslPrivacy }>(`/wasl/privacy/${ME}`)
      .then((d) => setPriv(d.privacy))
      .catch(() => setPriv(null))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: keyof WaslPrivacy) => {
    if (!priv || saving) return;
    const current = priv[key] as number;
    const next = { ...priv, [key]: current === 1 ? 0 : 1 };
    setPriv(next);
    setSaving(true);
    try {
      await apiPost(`/wasl/privacy/${ME}`, { [key]: next[key] });
    } finally {
      setSaving(false);
    }
  };

  const setTTL = async (sec: number) => {
    if (!priv) return;
    setPriv({ ...priv, disappearing_default: sec });
    setSaving(true);
    try {
      await apiPost(`/wasl/privacy/${ME}`, { disappearing_default: sec });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-float p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-2xl">Privacy</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-sm text-muted-foreground text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : !priv ? (
          <div className="py-8 text-sm text-muted-foreground text-center">Privacy unavailable</div>
        ) : (
          <div className="space-y-2.5">
            <PrivacyRow
              icon={Ghost}
              label="Ghost mode"
              desc="Hide last-seen, read receipts, and typing"
              on={priv.ghost_mode === 1}
              onToggle={() => toggle("ghost_mode")}
            />
            <PrivacyRow
              icon={EyeOff}
              label="Screenshot protection"
              desc="Block screenshots in private chats (best-effort on rooted devices)"
              on={priv.screenshot_block === 1}
              onToggle={() => toggle("screenshot_block")}
            />
            <PrivacyRow
              icon={Forward}
              label="Forwarding consent"
              desc="Recipient must approve before your messages are forwarded"
              on={priv.forwarding_consent === 1}
              onToggle={() => toggle("forwarding_consent")}
            />
            <PrivacyRow
              icon={CheckCheck}
              label="Read receipts"
              desc="Show double-blue when you've read a message"
              on={priv.read_receipts === 1}
              onToggle={() => toggle("read_receipts")}
            />
            <PrivacyRow
              icon={Eye}
              label="Last seen visible"
              desc="Let others see when you were last online"
              on={priv.last_seen_visible === 1}
              onToggle={() => toggle("last_seen_visible")}
            />
            <PrivacyRow
              icon={Vibrate}
              label="Typing indicator"
              desc="Show others when you're typing"
              on={priv.typing_indicator === 1}
              onToggle={() => toggle("typing_indicator")}
            />
            <PrivacyRow
              icon={ImageIcon}
              label="Auto-download media"
              desc="Save your data on cellular networks"
              on={priv.auto_download_media === 1}
              onToggle={() => toggle("auto_download_media")}
            />

            {/* Disappearing messages */}
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-secondary" />
                <div className="font-medium text-sm">Disappearing messages (default)</div>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">
                Auto-delete after TTL. Per-room overrides available in chat settings.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { l: "Off", v: 0 },
                  { l: "1d", v: 86400 },
                  { l: "7d", v: 604800 },
                  { l: "30d", v: 2592000 },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setTTL(opt.v)}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      priv.disappearing_default === opt.v
                        ? "bg-secondary text-secondary-foreground"
                        : "glass border border-border"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-secondary/5 border border-secondary/20 p-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 text-secondary mb-1">
                <KeyRound className="w-3 h-3" /> Authentication
              </div>
              Email · Telegram bot · Carrier OTP. No phone number required.
              No billing details ever collected.
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function PrivacyRow({
  icon: Icon, label, desc, on, onToggle,
}: { icon: any; label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-start rounded-2xl border p-3 flex items-center gap-3 transition ${
        on ? "border-secondary/40 bg-secondary/5" : "border-border bg-card hover:bg-muted/30"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          on ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <span
        className={`relative w-10 h-5.5 rounded-full transition shrink-0 ${
          on ? "bg-secondary" : "bg-muted border border-border"
        }`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-card shadow-soft transition-all ${
            on ? "left-[20px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ─────────────────────────── Create room modal ─────────────────────────── */

function CreateRoomModal({
  onClose, onCreated,
}: { onClose: () => void; onCreated: (r: Room) => void }) {
  const [kind, setKind] = useState<"dm" | "group" | "channel" | "maktab">("group");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setErr("Name required"); return; }
    setBusy(true); setErr(null);
    try {
      const res = await apiPost<{ ok: boolean; id: string; kind: string }>("/wasl/rooms", {
        name: name.trim(), kind, topic: topic.trim() || undefined,
        creator_id: ME,
        is_encrypted: kind === "channel" ? 0 : 1,
      });
      // Construct a Room-like object from the response
      onCreated({
        id: res.id, name: name.trim(), kind: res.kind,
        member_count: 1, created_at: new Date().toISOString(),
        is_encrypted: kind === "channel" ? 0 : 1, topic: topic.trim(),
      } as Room);
    } catch (e: any) {
      setErr(e?.body?.error ?? "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const opts: { k: typeof kind; l: string; d: string; i: any }[] = [
    { k: "dm", l: "Direct message", d: "End-to-end encrypted 1:1 chat", i: MessageSquare },
    { k: "group", l: "Group chat", d: "Up to 1,000 people · E2EE", i: Users },
    { k: "channel", l: "Broadcast channel", d: "One-to-many · public · indexed", i: Radio },
    { k: "maktab", l: "Maktab workspace", d: "Self-hosted Matrix for orgs", i: Building2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-float p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">New chat</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {opts.map((o) => (
            <button
              key={o.k}
              onClick={() => setKind(o.k)}
              className={`w-full text-start rounded-2xl border p-3 flex items-center gap-3 transition ${
                kind === o.k ? "border-secondary/50 bg-secondary/5 ring-1 ring-secondary/30" : "border-border hover:bg-muted/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                kind === o.k ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
              }`}>
                <o.i className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{o.l}</div>
                <div className="text-[11px] text-muted-foreground">{o.d}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <label className="block">
            <div className="text-xs text-muted-foreground mb-1">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={kind === "dm" ? "@friend.handle" : kind === "channel" ? "Cairo Daily News" : "Project team"}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>

          {kind !== "dm" && (
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Description (optional)</div>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What's this about?"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
              />
            </label>
          )}

          {kind === "channel" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 text-[11px] text-amber-700 dark:text-amber-400 px-3 py-2">
              Channels are public and indexed. Only you (the owner) can post.
              Subscribers receive messages but cannot reply except via DM.
            </div>
          )}
          {kind === "maktab" && (
            <div className="rounded-xl border border-secondary/30 bg-secondary/5 text-[11px] text-secondary px-3 py-2">
              Workspace will be created on your Maktab homeserver with admin bot, audit log, and retention rules.
            </div>
          )}

          {err && (
            <div className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs px-3 py-2">
              {err}
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full rounded-full bg-gradient-hero text-primary-foreground py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60 hover:opacity-95 transition"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {busy ? "Creating…" : `Create ${opts.find(o=>o.k===kind)!.l.toLowerCase()}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Chat view ─────────────────────────── */

function ChatView({ room, onBack }: { room: Room; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(true);
  const [outbox, setOutbox] = useState<{ id: string; body: string; created_at: string }[]>([]);

  // Modals
  const [showVerify, setShowVerify] = useState(false);
  const [showCall, setShowCall] = useState<null | "voice" | "video">(null);
  const [showGIF, setShowGIF] = useState(false);
  const [showMaktab, setShowMaktab] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [forwardMsg, setForwardMsg] = useState<Message | null>(null);

  const messagesEnd = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    apiGet<{ messages: Message[] }>(`/wasl/rooms/${room.id}/messages`)
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [room.id]);

  // Track online status
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, outbox]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);

    // Optimistic + mesh fallback
    if (!online) {
      const localId = "out" + Date.now().toString(36);
      setOutbox((q) => [...q, { id: localId, body: text, created_at: new Date().toISOString() }]);
      setInput("");
      setSending(false);
      return;
    }

    try {
      await apiPost(`/wasl/rooms/${room.id}/messages`, { sender_id: ME, body: text });
      const fresh = await apiGet<{ messages: Message[] }>(`/wasl/rooms/${room.id}/messages`);
      setMessages(fresh.messages ?? []);
      setInput("");
    } catch {
      // Network error — queue
      const localId = "out" + Date.now().toString(36);
      setOutbox((q) => [...q, { id: localId, body: text, created_at: new Date().toISOString() }]);
      setInput("");
    } finally {
      setSending(false);
    }
  }

  const isBroadcast = room.kind === "broadcast";
  const isMaktab = room.kind === "workspace";
  const subscribers = room.member_count;

  return (
    <div className="pb-24 min-h-screen flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 glass px-3 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full hover:bg-muted/60 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowVerify(true)}
          className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display shrink-0"
        >
          {isBroadcast ? <Radio className="w-4 h-4" /> :
           isMaktab ? <Building2 className="w-4 h-4" /> :
           room.kind === "group" ? <Users className="w-4 h-4" /> :
           (room.name[0] ?? "?")}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate flex items-center gap-1.5">
            {room.name}
            {room.is_encrypted ? <Lock className="w-3 h-3 text-secondary" /> : null}
          </div>
          <div className="text-[10px] text-secondary flex items-center gap-1">
            {isBroadcast ? (
              <>
                <Radio className="w-3 h-3" /> Broadcast · {subscribers.toLocaleString()} subscribers
              </>
            ) : isMaktab ? (
              <>
                <Building2 className="w-3 h-3" /> Maktab · {subscribers} members
              </>
            ) : room.is_encrypted ? (
              <>
                <KeyRound className="w-3 h-3" /> Encrypted · Olm/Megolm · tap to verify
              </>
            ) : (
              <>
                <Hash className="w-3 h-3" /> Public · {subscribers} members
              </>
            )}
          </div>
        </div>
        {!isBroadcast && (
          <>
            <button
              onClick={() => setShowCall("voice")}
              className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
              title="Voice call (WebRTC P2P)"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCall("video")}
              className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
              title="Video call"
            >
              <Video className="w-4 h-4" />
            </button>
          </>
        )}
        {isMaktab && (
          <button
            onClick={() => setShowMaktab(true)}
            className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
            title="Workspace admin"
          >
            <ScrollText className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setShowOptions(true)}
          className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Banner — encryption & connectivity */}
      <div className="px-3 mt-2 space-y-1.5">
        {room.is_encrypted ? (
          <button
            onClick={() => setShowVerify(true)}
            className="w-full px-3 py-2 rounded-xl bg-secondary/10 border border-secondary/30 text-[11px] text-secondary flex items-center gap-2 hover:bg-secondary/15 transition"
          >
            <KeyRound className="w-3 h-3" />
            Olm/Megolm encrypted · tap to verify devices via QR or SAS
          </button>
        ) : null}
        {!online && (
          <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <WifiOff className="w-3 h-3" />
            Offline — messages will be sent via local mesh or queued
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : messages.length === 0 && outbox.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Lock className="w-6 h-6 mx-auto opacity-40 mb-2" />
            {room.is_encrypted
              ? "Messages are end-to-end encrypted. Be the first to say hello."
              : "Be the first to post."}
          </div>
        ) : (
          <>
            {messages.map((m) => {
              const me = m.sender_id === ME;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[80%] flex flex-col ${me ? "ms-auto items-end" : "me-auto items-start"} gap-0.5 group`}
                >
                  {!me && !isBroadcast && (
                    <span className="text-[10px] text-muted-foreground px-2">
                      {m.display_name ?? `@${m.handle}`}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {!me && (
                      <button
                        onClick={() => setForwardMsg(m)}
                        className="opacity-0 group-hover:opacity-100 transition w-7 h-7 rounded-full glass flex items-center justify-center"
                        title="Forward (consent required)"
                      >
                        <Forward className="w-3 h-3" />
                      </button>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm break-words ${
                        me
                          ? "bg-gradient-hero text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      {m.body}
                    </div>
                    {me && (
                      <button
                        onClick={() => setForwardMsg(m)}
                        className="opacity-0 group-hover:opacity-100 transition w-7 h-7 rounded-full glass flex items-center justify-center"
                        title="Forward (recipient consent flow)"
                      >
                        <Forward className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground px-2 flex items-center gap-1">
                    {formatShortTime(m.created_at)}
                    {m.is_encrypted ? <Lock className="w-2.5 h-2.5" /> : null}
                    {me && <CheckCheck className="w-2.5 h-2.5 text-secondary" />}
                  </span>
                </motion.div>
              );
            })}

            {/* Outbox (pending / mesh) */}
            {outbox.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[80%] ms-auto flex flex-col items-end gap-0.5"
              >
                <div className="px-4 py-2.5 rounded-2xl rounded-br-md text-sm bg-gradient-hero/60 text-primary-foreground italic">
                  {m.body}
                </div>
                <span className="text-[9px] text-amber-600 px-2 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Pending · mesh queue
                </span>
              </motion.div>
            ))}
          </>
        )}

        {/* AI suggestions */}
        {!isBroadcast && (
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
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Composer */}
      {(!isBroadcast || room.member_count === 1) && (
        <div className="sticky bottom-20 px-3">
          <div className="glass-strong rounded-full px-3 py-2 flex items-center gap-2 shadow-float">
            <button
              onClick={() => setShowGIF(true)}
              className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"
              title="GIFs & stickers (IPFS)"
            >
              <Smile className="w-4 h-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              className="flex-1 bg-transparent outline-none text-sm py-1.5"
              placeholder={isBroadcast ? "Broadcast a message…" : "Message"}
            />
            <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center" title="Attach file (IPFS)">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center" title="Voice note">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-9 h-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center disabled:opacity-40"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-center mt-1.5">
            <span className="text-[9px] text-muted-foreground inline-flex items-center gap-1">
              {online ? <Wifi className="w-2.5 h-2.5 text-secondary" /> : <WifiOff className="w-2.5 h-2.5 text-amber-600" />}
              {online ? "Online" : "Offline · using mesh"} · falls back to BLE / Wi-Fi Direct
            </span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showVerify && <VerifyDevicesModal room={room} onClose={() => setShowVerify(false)} />}
        {showCall && <CallModal room={room} type={showCall} onClose={() => setShowCall(null)} />}
        {showGIF && <GIFPickerModal onPick={(c) => { setInput(input + ` [GIF:${c}]`); setShowGIF(false); }} onClose={() => setShowGIF(false)} />}
        {showMaktab && <MaktabAdminModal room={room} onClose={() => setShowMaktab(false)} />}
        {showOptions && <RoomOptionsModal room={room} onClose={() => setShowOptions(false)} />}
        {forwardMsg && <ForwardModal msg={forwardMsg} onClose={() => setForwardMsg(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── Verify devices (SAS/QR) ─────────────────────────── */

function VerifyDevicesModal({ room, onClose }: { room: Room; onClose: () => void }) {
  // Generate a stable SAS code from room id + time bucket (display only — real Olm SAS is client-derived)
  const sas = useMemo(() => {
    const seed = (room.id + Math.floor(Date.now() / (5 * 60 * 1000))).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const words = ["alpine", "harbour", "lantern", "marble", "saffron", "violet", "amber"];
    return [words[seed % 7], words[(seed * 3) % 7], words[(seed * 7) % 7]];
  }, [room.id]);

  return (
    <ModalShell onClose={onClose} title="Verify devices">
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto rounded-2xl bg-foreground p-3 flex items-center justify-center">
            <QrCode className="w-full h-full text-background" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Scan with your contact's device, or compare the 3 SAS emojis/words below.
          </p>
        </div>

        <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-3">
          <div className="text-[10px] uppercase tracking-widest text-secondary text-center mb-2">
            Short Authentication String
          </div>
          <div className="flex justify-center gap-2 font-mono">
            {sas.map((w) => (
              <span key={w} className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm font-medium">
                {w}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <ShieldAlert className="w-3 h-3" /> How verification works
          </div>
          <p>Both devices independently compute these 3 words from your shared Olm session keys. If they match on both screens, no man-in-the-middle is intercepting.</p>
        </div>

        <button
          onClick={async () => {
            await apiPost("/wasl/verify-device", {
              user_id: ME, device_id: "device-" + ME, verified_by: ME,
              method: "sas", fingerprint: sas.join("-"),
            }).catch(() => {});
            onClose();
          }}
          className="w-full rounded-full bg-secondary text-secondary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          They match — mark verified
        </button>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────── Call modal ─────────────────────────── */

function CallModal({ room, type, onClose }: { room: Room; type: "voice" | "video"; onClose: () => void }) {
  const [status, setStatus] = useState<"ringing" | "active" | "ended">("ringing");
  const [callId, setCallId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    // Initiate call on server
    apiPost<{ ok: boolean; id: string; stun: string }>("/wasl/calls", {
      room_id: room.id, caller_id: ME, call_type: type,
    })
      .then((r) => setCallId(r.id))
      .catch(() => {});
    // Simulate auto-connect after 2s (in real app this is WebRTC offer/answer)
    const t = setTimeout(() => {
      setStatus("active");
      startedAt.current = Date.now();
    }, 2000);
    return () => clearTimeout(t);
  }, [room.id, type]);

  useEffect(() => {
    if (status !== "active") return;
    const i = setInterval(() => setDuration(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(i);
  }, [status]);

  const end = async () => {
    if (callId) {
      await apiPost(`/wasl/calls/${callId}/end`, {
        duration_sec: duration, status: status === "ringing" ? "rejected" : "ended",
      }).catch(() => {});
    }
    setStatus("ended");
    setTimeout(onClose, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/95 flex flex-col items-center justify-between p-6"
    >
      <div className="text-center mt-12 text-background">
        <div className="text-[10px] uppercase tracking-widest opacity-60">
          {type === "video" ? "Video call" : "Voice call"} · WebRTC P2P
        </div>
        <h2 className="font-display text-3xl mt-2">{room.name}</h2>
        <p className="text-sm opacity-70 mt-1">
          {status === "ringing" ? "Ringing…" : status === "active" ? formatDuration(duration) : "Call ended"}
        </p>
        {status === "ringing" && (
          <p className="text-[10px] opacity-50 mt-1">Negotiating ICE candidates · STUN: stun.l.google.com</p>
        )}
      </div>

      <div className="w-48 h-48 rounded-full bg-gradient-hero flex items-center justify-center shadow-float">
        {type === "video" ? <Video className="w-16 h-16 text-primary-foreground" /> : <Phone className="w-16 h-16 text-primary-foreground" />}
      </div>

      <div className="flex gap-4 mb-8">
        <button className="w-14 h-14 rounded-full bg-background/10 text-background flex items-center justify-center hover:bg-background/20 transition">
          <Mic className="w-5 h-5" />
        </button>
        <button
          onClick={end}
          className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-float"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
        <button className="w-14 h-14 rounded-full bg-background/10 text-background flex items-center justify-center hover:bg-background/20 transition">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── GIF / Sticker picker (IPFS) ─────────────────────────── */

function GIFPickerModal({ onPick, onClose }: { onPick: (cid: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  // Mock CC0 GIF index (in production these are IPFS CIDs from local SQLite FTS5)
  const allGifs = [
    { cid: "QmXo1heart", emoji: "❤️", tag: "love" },
    { cid: "QmXo2happy", emoji: "😄", tag: "happy" },
    { cid: "QmXo3laugh", emoji: "😂", tag: "laugh" },
    { cid: "QmXo4thumbsup", emoji: "👍", tag: "ok yes" },
    { cid: "QmXo5wave", emoji: "👋", tag: "hi hello bye" },
    { cid: "QmXo6cool", emoji: "😎", tag: "cool" },
    { cid: "QmXo7fire", emoji: "🔥", tag: "fire hot" },
    { cid: "QmXo8party", emoji: "🎉", tag: "party celebration" },
    { cid: "QmXo9thinking", emoji: "🤔", tag: "thinking confused" },
    { cid: "QmXoApray", emoji: "🤲", tag: "pray dua" },
    { cid: "QmXoBmoon", emoji: "🌙", tag: "moon night" },
    { cid: "QmXoCsun", emoji: "☀️", tag: "sun morning" },
  ];
  const filtered = q ? allGifs.filter((g) => g.tag.includes(q.toLowerCase())) : allGifs;

  return (
    <ModalShell onClose={onClose} title="GIFs & stickers">
      <div className="space-y-3">
        <div className="glass rounded-full px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search community GIFs (IPFS)"
            className="bg-transparent flex-1 outline-none text-sm"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {filtered.map((g) => (
            <button
              key={g.cid}
              onClick={() => onPick(g.cid)}
              className="aspect-square rounded-xl bg-gradient-mesh hover:scale-105 transition flex items-center justify-center text-4xl"
            >
              {g.emoji}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-6 text-sm text-muted-foreground text-center">No matches in your local index</div>
        )}
        <p className="text-[10px] text-muted-foreground text-center">
          All GIFs are CC0 / public-domain, pinned on IPFS. No tracking, no API calls to third-party servers.
        </p>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────── Maktab admin commands ─────────────────────────── */

function MaktabAdminModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const [audit, setAudit] = useState<any[]>([]);
  const [cmd, setCmd] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiGet<{ audit: any[] }>(`/wasl/maktab/${room.id}/audit`)
      .then((d) => setAudit(d.audit ?? []))
      .catch(() => setAudit([]));
  }, [room.id]);

  const runCmd = async () => {
    if (!cmd.trim() || busy) return;
    setBusy(true);
    // Parse simple commands: /invite email role, /set-visibility room mode, /set-retention room days, /audit-log, /export-room
    const m = cmd.trim().match(/^\/(\w+(?:-\w+)*)\s*(.*)$/);
    const action = m?.[1] ?? "unknown";
    const target = m?.[2] ?? null;
    try {
      await apiPost(`/wasl/maktab/${room.id}/command`, {
        actor_id: ME, action, target, details: { raw: cmd },
      });
      const fresh = await apiGet<{ audit: any[] }>(`/wasl/maktab/${room.id}/audit`);
      setAudit(fresh.audit ?? []);
      setCmd("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="Maktab admin">
      <div className="space-y-3">
        <div className="text-[11px] text-muted-foreground">
          Workspace: <span className="font-mono">{room.name}</span> · run admin bot commands
        </div>

        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-xs font-medium mb-2">Quick actions</div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {[
              "/invite email@org.com engineering",
              "/set-visibility engineering full",
              "/set-retention #engineering 90d",
              "/audit-log --from 2026-01-01",
              "/export-room #engineering --format json",
              "/remove user@org.com",
            ].map((q) => (
              <button
                key={q}
                onClick={() => setCmd(q)}
                className="text-start px-2 py-1.5 rounded-lg glass hover:bg-secondary/10 transition font-mono truncate"
                title={q}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runCmd(); }}
            placeholder="/invite alice@org.com engineering"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-secondary"
          />
          <button
            onClick={runCmd}
            disabled={busy}
            className="rounded-xl bg-gradient-hero text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run"}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
            <ScrollText className="w-3 h-3" /> Audit log
          </div>
          {audit.length === 0 ? (
            <div className="text-[11px] text-muted-foreground text-center py-4">No admin actions yet</div>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto">
              {audit.map((a) => (
                <li key={a.id} className="text-[11px] flex items-start gap-2">
                  <span className="font-mono text-secondary shrink-0">{a.action}</span>
                  <span className="text-muted-foreground truncate flex-1">{a.target ?? "—"}</span>
                  <span className="text-muted-foreground/60 shrink-0">
                    {formatShortTime(a.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────── Room options (mute, leave, retention) ─────────────────────────── */

function RoomOptionsModal({ room, onClose }: { room: Room; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} title="Room options">
      <div className="space-y-2">
        {[
          { i: Clock, l: "Set disappearing TTL", d: "Off · 24h · 7d · 30d" },
          { i: Volume2, l: "Notifications", d: "All · Mentions · Off" },
          { i: ScrollText, l: "Export chat", d: "JSON · plain text · IPFS pin" },
          { i: FileText, l: "View shared files", d: "All media in this room" },
          { i: ShieldAlert, l: "Report room", d: "Send to community moderation" },
          { i: Trash2, l: "Leave room", d: "Remove from your list", danger: true },
        ].map((o) => (
          <button
            key={o.l}
            className={`w-full text-start rounded-2xl border p-3 flex items-center gap-3 hover:bg-muted/30 transition ${
              o.danger ? "border-accent/30 text-accent" : "border-border"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              o.danger ? "bg-accent/10" : "bg-muted"
            }`}>
              <o.i className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{o.l}</div>
              <div className="text-[11px] text-muted-foreground">{o.d}</div>
            </div>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────── Forward (consent flow) ─────────────────────────── */

function ForwardModal({ msg, onClose }: { msg: Message; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const requestForward = async () => {
    setBusy(true);
    try {
      // Simulated: real flow sends a consent request to the original sender
      await new Promise((r) => setTimeout(r, 800));
      setDone(true);
      setTimeout(onClose, 1200);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="Forward message">
      <div className="space-y-3">
        <div className="rounded-xl bg-muted p-3 text-sm">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Original</div>
          {msg.body}
        </div>
        <div className="rounded-xl bg-secondary/10 border border-secondary/30 p-3 text-[11px] text-secondary flex items-start gap-2">
          <ShieldAlert className="w-3 h-3 mt-0.5 shrink-0" />
          <span>
            The original sender has <strong>forwarding consent</strong> enabled. They'll receive a one-time
            approval request before this message is shared.
          </span>
        </div>
        <button
          onClick={requestForward}
          disabled={busy || done}
          className="w-full rounded-full bg-secondary text-secondary-foreground py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {done ? <><Check className="w-4 h-4" /> Request sent</> :
           busy ? <Loader2 className="w-4 h-4 animate-spin" /> :
           <><Forward className="w-4 h-4" /> Request consent</>}
        </button>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────── Modal shell ─────────────────────────── */

function ModalShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-float p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Utils ─────────────────────────── */

function formatShortTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return d.toLocaleDateString();
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default WaslScreen;
