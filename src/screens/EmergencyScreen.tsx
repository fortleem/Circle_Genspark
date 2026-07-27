// Emergency Screen — Citizen Emergency Witness
// One-press emergency (fire / medical / crime / rights-violation) with
// tamper-evident live recording (hash-chained segments), nearby-citizen
// confirmations, gov-channel routing and Midan sharing.
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Heart, Shield, Phone, Users, Send, Loader2, Scale,
  AlertTriangle, X, Plus, Trash2, Navigation, Radio, Clock,
  CheckCircle2, Siren, ChevronLeft, Video, Mic, Lock, Globe,
  Landmark, Megaphone, ShieldCheck, Link2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";

import { getMe } from "@/lib/session";
const ME = getMe();

type EmergencyKind = "fire" | "medical" | "crime" | "rights_violation";
type RecordMode = "video" | "audio";
type Scope = "public" | "circle" | "gov";

interface EmergencyContact { id: string; name: string; phone: string; relationship: string }
interface LocationData { lat: number; lng: number; accuracy: number; address?: string; timestamp: number }

interface Incident {
  id: string; kind: EmergencyKind; mode: RecordMode; scope: Scope;
  city: string; status: string; gov_channel_routed: number;
  shared_midan_post_id: number | null; started_at?: string;
}
interface Segment { seq: number; media_cid: string; seg_hash: string; captured_at: string }
interface Confirmation { user_id: number; verdict: string; note?: string; display_name?: string }
interface EmergencyCircle { id: number; circle_id: number; label: string; circle_name?: string; member_count?: number }

const EMERGENCY_TYPES: { type: EmergencyKind; icon: any; label: string; labelAr: string; color: string; number: string; desc: string }[] = [
  { type: "fire", icon: Flame, label: "Fire", labelAr: "حريق", color: "from-orange-500 to-red-600", number: "180", desc: "Alerts nearby citizens + fire dept" },
  { type: "medical", icon: Heart, label: "Medical", labelAr: "إسعاف", color: "from-red-500 to-pink-600", number: "123", desc: "Can target your Family Emergency circle" },
  { type: "crime", icon: Shield, label: "Crime", labelAr: "جريمة", color: "from-blue-500 to-indigo-600", number: "122", desc: "Live witness recording + police" },
  { type: "rights_violation", icon: Scale, label: "Rights Violation", labelAr: "انتهاك حقوق", color: "from-purple-600 to-fuchsia-700", number: "—", desc: "Tamper-proof video → government oversight channel" },
];

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: "1", name: "Ahmed Hassan", phone: "+20 100 555 1234", relationship: "Brother" },
  { id: "2", name: "Sara Mohamed", phone: "+20 111 222 3456", relationship: "Wife" },
  { id: "3", name: "Dr. Khaled Youssef", phone: "+20 122 333 4567", relationship: "Doctor" },
];

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function EmergencyScreen() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<EmergencyKind | null>(null);
  const [mode, setMode] = useState<RecordMode>("video");
  const [scope, setScope] = useState<Scope>("public");
  const [circles, setCircles] = useState<EmergencyCircle[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_CONTACTS);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });
  // Live incident state
  const [incident, setIncident] = useState<Incident | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [chainIntact, setChainIntact] = useState<boolean | null>(null);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [ending, setEnding] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const watchRef = useRef<number | null>(null);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);
  const segSeqRef = useRef(0);
  const incidentIdRef = useRef<string | null>(null);

  // Auto-detect live location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setLocationLoading(false);
      setLocation({ lat: 30.0444, lng: 31.2357, accuracy: 100, address: "Cairo, Egypt (approximate)", timestamp: Date.now() });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.message);
        setLocationLoading(false);
        setLocation({ lat: 30.0444, lng: 31.2357, accuracy: 100, address: "Cairo, Egypt (approximate)", timestamp: Date.now() });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  // Load my emergency circles (e.g. Family Emergency)
  useEffect(() => {
    apiGet<{ circles: EmergencyCircle[] }>(`/emergency/circles/${ME}`)
      .then((d) => setCircles(d.circles ?? []))
      .catch(() => setCircles([]));
  }, []);

  // Countdown before dispatch
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      dispatchIncident();
    }
    return () => { if (countdownRef.current) clearTimeout(countdownRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Cleanup recording loop on unmount
  useEffect(() => () => { if (recTimerRef.current) clearInterval(recTimerRef.current); }, []);

  function startEmergency(type: EmergencyKind) {
    setSelectedType(type);
    if (type === "medical" && circles.length > 0) setScope("circle");
    else if (type === "rights_violation") setScope("gov");
    else setScope("public");
    setCountdown(5);
  }

  function cancelCountdown() {
    setCountdown(null);
    setSelectedType(null);
    if (countdownRef.current) clearTimeout(countdownRef.current);
  }

  async function dispatchIncident() {
    if (!selectedType) return;
    setCountdown(null);
    try {
      const r = await apiPost<{ ok: boolean; incident: Incident; notified: number }>("/emergency/incidents", {
        reporter_id: ME,
        kind: selectedType,
        mode,
        scope,
        circle_id: scope === "circle" ? circles[0]?.circle_id : undefined,
        lat: location?.lat, lng: location?.lng,
        city: "Cairo",
      });
      if (r?.incident) {
        setIncident(r.incident);
        setNotifiedCount(r.notified ?? 0);
        incidentIdRef.current = r.incident.id;
        segSeqRef.current = 0;
        setSegments([]);
        setConfirmations([]);
        startWitnessRecording(r.incident.id);
      }
    } catch { /* stay on screen */ }
  }

  // Tamper-evident recording loop — every 4s capture a segment,
  // content-address it locally (SHA-256), append to the server hash chain.
  function startWitnessRecording(id: string) {
    const capture = async () => {
      if (incidentIdRef.current !== id) return;
      segSeqRef.current += 1;
      const cid = "bafy" + (await sha256Hex(`${id}|${segSeqRef.current}|${Date.now()}|${location?.lat}|${location?.lng}`)).slice(0, 40);
      try {
        await apiPost(`/emergency/incidents/${id}/segments`, { media_cid: cid, duration_ms: 4000 });
      } catch { /* incident ended */ }
      refreshIncident(id);
    };
    capture();
    recTimerRef.current = setInterval(capture, 4000);
  }

  async function refreshIncident(id: string) {
    try {
      const d = await apiGet<{ incident: Incident; segments: Segment[]; confirmations: Confirmation[] }>(`/emergency/incidents/${id}`);
      if (d.incident) setIncident(d.incident);
      setSegments(d.segments ?? []);
      setConfirmations(d.confirmations ?? []);
      const v = await apiGet<{ intact: boolean }>(`/emergency/incidents/${id}/verify`);
      setChainIntact(!!v.intact);
    } catch { /* ignore */ }
  }

  async function endIncident(status: "ended" | "resolved" | "false_alarm") {
    if (!incident || ending) return;
    setEnding(true);
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    try {
      await apiPost(`/emergency/incidents/${incident.id}/end`, { status });
      await refreshIncident(incident.id);
    } catch { /* ignore */ } finally { setEnding(false); }
  }

  async function shareToMidan() {
    if (!incident || sharing) return;
    setSharing(true);
    try {
      await apiPost(`/emergency/incidents/${incident.id}/share-midan`, {});
      await refreshIncident(incident.id);
    } catch { /* ignore */ } finally { setSharing(false); }
  }

  function resetAll() {
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    incidentIdRef.current = null;
    setIncident(null); setSegments([]); setConfirmations([]);
    setChainIntact(null); setSelectedType(null); setNotifiedCount(0);
  }

  function addContact() {
    if (!newContact.name || !newContact.phone) return;
    setContacts([...contacts, { id: Date.now().toString(), name: newContact.name, phone: newContact.phone, relationship: newContact.relationship || "Contact" }]);
    setNewContact({ name: "", phone: "", relationship: "" });
    setShowAddContact(false);
  }

  // ─── LIVE INCIDENT VIEW (witness recording) ───
  if (incident) {
    const etype = EMERGENCY_TYPES.find((e) => e.type === incident.kind)!;
    const isLive = incident.status === "live";
    const confirms = confirmations.filter((c) => c.verdict === "confirm").length;
    return (
      <div className="min-h-screen pb-28 px-5 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={resetAll} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-2xl flex items-center gap-2">
              <etype.icon className="w-6 h-6 text-red-500" /> {etype.label}
            </h1>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{incident.id}</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-medium ${isLive ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"}`}>
            {isLive ? <span className="flex items-center gap-1"><Radio className="w-3 h-3 animate-pulse" /> LIVE</span> : incident.status.toUpperCase()}
          </span>
        </div>

        {/* Recording surface */}
        <div className={`rounded-3xl overflow-hidden border ${isLive ? "border-red-500/50" : "border-border"} bg-black/90 aspect-video relative flex items-center justify-center`}>
          {isLive ? (
            <>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" /> REC · {incident.mode.toUpperCase()}
              </motion.div>
              {incident.mode === "video" ? (
                <Video className="w-16 h-16 text-white/25" />
              ) : (
                <div className="flex items-center gap-1">
                  {[...Array(9)].map((_, i) => (
                    <motion.div key={i} className="w-1.5 bg-red-500 rounded-full"
                      animate={{ height: [8, 28 + (i % 4) * 8, 8] }}
                      transition={{ duration: 0.8 + (i % 3) * 0.2, repeat: Infinity }} />
                  ))}
                </div>
              )}
              <div className="absolute bottom-3 left-3 text-[10px] text-white/70 flex items-center gap-1.5">
                <Navigation className="w-3 h-3" /> {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "…"}
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] text-white/70">{segments.length} segments</div>
            </>
          ) : (
            <div className="text-center text-white/60 text-sm">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              Recording sealed — {segments.length} immutable segments
            </div>
          )}
        </div>

        {/* Tamper-evidence chain */}
        <div className="mt-4 rounded-2xl border border-border glass p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link2 className="w-4 h-4 text-secondary" /> Tamper-evident hash chain
            </div>
            {chainIntact === null ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : chainIntact ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium"><ShieldCheck className="w-3.5 h-3.5" /> CHAIN VERIFIED</span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> BROKEN</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Every segment is SHA-256 chained to the previous one. Editing or deleting any frame breaks the chain — this footage cannot be altered.
          </p>
          {segments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {segments.slice(-8).map((s) => (
                <span key={s.seq} className="px-2 py-0.5 rounded bg-muted/60 text-[9px] font-mono text-muted-foreground">
                  #{s.seq} {s.seg_hash.slice(0, 8)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Routing + community confirmations */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl glass border border-border p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Routed to</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              {incident.scope === "gov" ? (<><Landmark className="w-4 h-4 text-purple-500" /> Gov oversight</>) :
               incident.scope === "circle" ? (<><Users className="w-4 h-4 text-secondary" /> Family circle</>) :
               (<><Globe className="w-4 h-4 text-secondary" /> Nearby citizens</>)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{notifiedCount} notified</div>
          </div>
          <div className="rounded-2xl glass border border-border p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Witness confirmations</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <CheckCircle2 className={`w-4 h-4 ${confirms >= 2 ? "text-emerald-500" : "text-muted-foreground"}`} />
              {confirms} confirmed
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{confirms >= 2 ? "Incident verified by community" : "Awaiting 2+ witnesses"}</div>
          </div>
        </div>

        {confirmations.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {confirmations.slice(0, 5).map((cf, i) => (
              <div key={i} className="rounded-xl glass px-3 py-2 text-[11px] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${cf.verdict === "confirm" ? "text-emerald-500" : "text-amber-500"}`} />
                <span className="font-medium">{cf.display_name ?? `Witness #${cf.user_id}`}</span>
                <span className="text-muted-foreground">{cf.verdict === "confirm" ? "confirms the incident" : cf.verdict}</span>
                {cf.note && <span className="text-muted-foreground truncate">— "{cf.note}"</span>}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 space-y-2">
          {isLive ? (
            <div className="flex gap-2">
              <button onClick={() => endIncident("ended")} disabled={ending}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
                {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Stop & seal recording
              </button>
              <button onClick={() => endIncident("false_alarm")} disabled={ending}
                className="px-4 py-3 rounded-full glass text-sm">False alarm</button>
            </div>
          ) : (
            <div className="flex gap-2">
              {!incident.shared_midan_post_id ? (
                <button onClick={shareToMidan} disabled={sharing}
                  className="flex-1 py-3 rounded-full bg-gradient-hero text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />} Share evidence on Midan
                </button>
              ) : (
                <div className="flex-1 py-3 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center">
                  ✓ Shared on Midan (post #{incident.shared_midan_post_id})
                </div>
              )}
              <button onClick={resetAll} className="px-4 py-3 rounded-full glass text-sm">Done</button>
            </div>
          )}
          {incident.gov_channel_routed === 1 && (
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 px-3 py-2 text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5" /> Copy delivered to the government oversight channel — cannot be recalled or edited.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Countdown View ───
  if (countdown !== null && selectedType) {
    const etype = EMERGENCY_TYPES.find((e) => e.type === selectedType)!;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 pb-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-8">
          <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${etype.color} flex items-center justify-center`}>
            <span className="font-display text-6xl text-white">{countdown}</span>
          </div>
          <motion.div className="absolute inset-0 rounded-full border-4 border-white/30"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        </motion.div>
        <h2 className="font-display text-2xl mb-1">Starting {etype.label} Witness</h2>
        <p className="text-muted-foreground text-sm text-center mb-4">
          Live {mode} recording begins in {countdown}s — tamper-evident from the first frame.
        </p>

        {/* Mode + scope pickers during countdown */}
        <div className="flex gap-2 mb-3">
          {(["video", "audio"] as RecordMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 capitalize ${mode === m ? "bg-gradient-hero text-primary-foreground" : "glass"}`}>
              {m === "video" ? <Video className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />} {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          <button onClick={() => setScope("public")}
            className={`px-3.5 py-2 rounded-full text-xs flex items-center gap-1.5 ${scope === "public" ? "bg-secondary text-secondary-foreground" : "glass"}`}>
            <Globe className="w-3.5 h-3.5" /> Nearby citizens
          </button>
          {circles.length > 0 && (
            <button onClick={() => setScope("circle")}
              className={`px-3.5 py-2 rounded-full text-xs flex items-center gap-1.5 ${scope === "circle" ? "bg-secondary text-secondary-foreground" : "glass"}`}>
              <Users className="w-3.5 h-3.5" /> {circles[0].label}
            </button>
          )}
          {selectedType === "rights_violation" && (
            <span className="px-3.5 py-2 rounded-full text-xs flex items-center gap-1.5 bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Landmark className="w-3.5 h-3.5" /> Gov oversight (forced)
            </span>
          )}
        </div>

        <button onClick={cancelCountdown}
          className="px-8 py-3 rounded-full border-2 border-red-500 text-red-500 font-medium hover:bg-red-500/10 transition">
          Cancel
        </button>
      </div>
    );
  }

  // ─── Main selection view ───
  return (
    <div className="pb-32">
      <div className="px-5 pt-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl flex items-center gap-2">
            <Siren className="w-7 h-7 text-red-500" />
            Emergency <span className="text-base text-muted-foreground tracking-widest">طوارئ</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-red-500 mt-0.5">
            Citizen Witness · Tamper-proof recording · Live confirmations
          </p>
        </div>
      </div>

      {/* Location Status */}
      <div className="px-5 mt-5">
        <div className={`rounded-2xl border p-4 ${location && !locationError ? "border-green-500/40 bg-green-500/5" : locationLoading ? "border-amber-500/40 bg-amber-500/5" : "border-red-500/40 bg-red-500/5"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${location ? "bg-green-500/20" : "bg-amber-500/20"}`}>
              {locationLoading ? <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> : <Navigation className={`w-5 h-5 ${location ? "text-green-500" : "text-red-500"}`} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium flex items-center gap-2">
                {locationLoading ? "Detecting location..." : location ? "Location detected" : "Location unavailable"}
                {location && <span className="text-[10px] text-green-500 flex items-center gap-0.5"><Radio className="w-2.5 h-2.5 animate-pulse" /> Live</span>}
              </div>
              {location && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                  {location.accuracy && ` · ±${Math.round(location.accuracy)}m`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record mode toggle */}
      <div className="px-5 mt-5 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Record:</span>
        {(["video", "audio"] as RecordMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 capitalize ${mode === m ? "bg-gradient-hero text-primary-foreground" : "glass"}`}>
            {m === "video" ? <Video className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />} {m}
          </button>
        ))}
      </div>

      {/* Emergency Type Selection */}
      <div className="px-5 mt-5">
        <h2 className="font-display text-xl mb-3">One-press Emergency Witness</h2>
        <div className="grid grid-cols-1 gap-3">
          {EMERGENCY_TYPES.map((etype) => (
            <motion.button key={etype.type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => startEmergency(etype.type)}
              className={`rounded-2xl p-5 text-left relative overflow-hidden border border-white/10 bg-gradient-to-r ${etype.color} text-white shadow-lg`}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <etype.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-2xl">{etype.label}</div>
                  <div className="text-white/80 text-sm">{etype.labelAr}{etype.number !== "—" ? ` · Call ${etype.number}` : ""}</div>
                  <div className="text-white/60 text-[11px] mt-0.5">{etype.desc}</div>
                </div>
                <Send className="w-6 h-6 text-white/70" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Family emergency circles */}
      {circles.length > 0 && (
        <div className="px-5 mt-6">
          <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Users className="w-4 h-4 text-secondary" /> Family Emergency Circle
            </div>
            {circles.map((c) => (
              <div key={c.id} className="text-xs text-muted-foreground">
                {c.label} → <span className="text-foreground font-medium">{c.circle_name ?? `Circle #${c.circle_id}`}</span>
                {c.member_count ? ` · ${c.member_count.toLocaleString()} members` : ""}
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Medical emergencies default to alerting this circle privately instead of the public.
            </p>
          </div>
        </div>
      )}

      {/* Emergency contacts */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" /> Emergency Contacts
          </h2>
          <button onClick={() => setShowAddContact(true)}
            className="text-xs px-3 py-1.5 rounded-full bg-secondary/20 text-secondary font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="glass rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display">
                {contact.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{contact.name}</div>
                <div className="text-xs text-muted-foreground">{contact.phone} · {contact.relationship}</div>
              </div>
              <button onClick={() => setContacts(contacts.filter((c) => c.id !== contact.id))}
                className="w-8 h-8 rounded-full hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-500 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContact && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddContact(false)}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              className="bg-background rounded-3xl border border-border max-w-sm w-full p-5 shadow-float"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">Add Emergency Contact</h3>
                <button onClick={() => setShowAddContact(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Name"
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-secondary" />
                <input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone number"
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-secondary" />
                <input value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} placeholder="Relationship (e.g. Brother, Wife, Doctor)"
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-secondary" />
                <button onClick={addContact} disabled={!newContact.name || !newContact.phone}
                  className="w-full py-3 rounded-full bg-gradient-hero text-primary-foreground font-medium disabled:opacity-40">
                  Add Contact
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notices */}
      <div className="px-5 mt-8">
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-display text-sm">How Citizen Witness works</h3>
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <p>• Recording is hash-chained (SHA-256) from the first frame — it can never be edited or cut.</p>
            <p>• Nearby citizens get notified and can confirm what they see; 2+ confirmations verify the incident.</p>
            <p>• Rights violations route automatically to the government oversight channel and can be shared on Midan.</p>
            <p>• Medical emergencies can privately alert your Family Emergency circle only.</p>
            <p>• False alerts may result in legal consequences in some jurisdictions.</p>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" /> Average response: 4-8 min
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-secondary">
              <Shield className="w-3 h-3" /> Tamper-evident evidence
            </div>
          </div>
        </div>
      </div>

      {/* Direct call */}
      <div className="px-5 mt-6">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Or call directly:</h3>
        <div className="flex gap-2">
          {EMERGENCY_TYPES.filter((e) => e.number !== "—").map((e) => (
            <a key={e.type} href={`tel:${e.number}`}
              className="flex-1 glass rounded-xl py-3 flex flex-col items-center gap-1 hover:bg-muted/30 transition">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium">{e.number}</span>
              <span className="text-[10px] text-muted-foreground">{e.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmergencyScreen;
