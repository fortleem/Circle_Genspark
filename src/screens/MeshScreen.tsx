// — Local Mesh (Offline backbone). Prototype design language.
// Covers Discovery, Relaying, SOS, Sync, Privacy.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Compass, Siren, Radio, Bluetooth, Wifi, ShieldCheck, Activity,
  Signal, AlertTriangle, RefreshCw,
} from "lucide-react";
import { apiGet, apiPost, type MeshPeer, type SOSAlert } from "@/lib/api";
import { ProtoHeader, ProtoFooter } from "@/components/shell/ProtoHeader";

type Transport = "all" | "ble" | "wifi";

export function MeshScreen() {
  const [peers, setPeers] = useState<MeshPeer[]>([]);
  const [sos, setSos] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [transport, setTransport] = useState<Transport>("all");
  const [scanning, setScanning] = useState(false);
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiGet<{ peers: MeshPeer[] }>("/mesh/peers").catch(() => ({ peers: [] as MeshPeer[] })),
      apiGet<{ sos: SOSAlert[] }>("/mesh/sos").catch(() => ({ sos: [] as SOSAlert[] })),
    ])
      .then(([p, s]) => {
        setPeers(p.peers ?? []);
        setSos(s.sos ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const rescan = () => {
    setScanning(true);
    setTimeout(() => { load(); setScanning(false); }, 700);
  };

  const sendSOS = async () => {
    if (sending) return;
    setSending(true);
    try {
      await apiPost("/mesh/sos", {
        user_id: 1,
        message: "Emergency broadcast from mesh",
        severity: "high",
        city: "Cairo",
      });
      load();
    } catch {/* offline ok */}
    finally { setSending(false); }
  };

  const filteredPeers = useMemo(() => {
    if (transport === "all") return peers;
    if (transport === "ble") return peers.filter(p => p.transport?.toLowerCase().includes("ble") || p.transport?.toLowerCase().includes("bluetooth"));
    return peers.filter(p => p.transport?.toLowerCase().includes("wifi"));
  }, [peers, transport]);

  const relaying = peers.filter(p => p.is_relaying).length;
  const avgRssi = peers.length ? Math.round(peers.reduce((a, b) => a + (b.rssi_dbm ?? 0), 0) / peers.length) : 0;

  return (
    <div className="pb-32 space-y-5">
      <ProtoHeader
        title="Mesh"
        arabic="الشبكة المحلية"
        section=""
        tagline="Bluetooth + Wi-Fi Direct · offline-first"
        right={
          <button
            onClick={rescan}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/15 transition"
            title="Rescan"
          >
            <RefreshCw className={`w-4 h-4 text-secondary ${scanning ? "animate-spin" : ""}`} />
          </button>
        }
      />

      {/* Stat tiles */}
      <div className="px-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { l: "Peers nearby", v: peers.length.toString(), i: Radio },
          { l: "Relaying", v: relaying.toString(), i: Activity },
          { l: "Active SOS", v: sos.length.toString(), i: Siren, danger: sos.length > 0 },
          { l: "Avg RSSI", v: peers.length ? `${avgRssi} dBm` : "—", i: Signal },
        ].map((s) => (
          <div key={s.l} className={`glass rounded-2xl p-3 ${s.danger ? "border-accent/40" : ""}`}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <s.i className={`w-3 h-3 ${s.danger ? "text-accent" : "text-secondary"}`} />
              {s.l}
            </div>
            <div className={`font-display text-2xl mt-1 ${s.danger ? "text-accent" : ""}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* SOS broadcast action */}
      <div className="px-5">
        <button
          onClick={sendSOS}
          disabled={sending}
          className="w-full rounded-2xl bg-gradient-to-br from-accent/90 to-accent text-accent-foreground p-4 flex items-center gap-3 shadow-float disabled:opacity-60 hover:scale-[1.01] transition"
        >
          <Siren className={`w-6 h-6 ${sending ? "animate-pulse" : ""}`} />
          <div className="text-start flex-1">
            <div className="font-display text-base">Broadcast SOS</div>
            <div className="text-[11px] opacity-90">— relayed 4-6 hops to all peers</div>
          </div>
          <AlertTriangle className="w-5 h-5 opacity-75" />
        </button>
      </div>

      {/* Transport filter */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {([
          { k: "all", l: "All transports", i: null },
          { k: "ble", l: "Bluetooth LE", i: Bluetooth },
          { k: "wifi", l: "Wi-Fi Direct", i: Wifi },
        ] as { k: Transport; l: string; i: any }[]).map((t) => (
          <button
            key={t.k}
            onClick={() => setTransport(t.k)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
              transport === t.k ? "bg-primary text-primary-foreground" : "glass"
            }`}
          >
            {t.i && <t.i className="w-3 h-3" />}
            {t.l}
          </button>
        ))}
      </div>

      {/* Peers list */}
      <section className="px-5">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-mono"></span>
          <h2 className="font-display text-lg">Peers nearby</h2>
        </div>
        <p className="-mt-1 mb-3 text-[11px] text-muted-foreground">
          Auto-discovered via BLE + Wi-Fi Direct · no servers needed
        </p>

        {loading ? (
          <div className="py-8 text-sm text-muted-foreground text-center">Scanning…</div>
        ) : filteredPeers.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground text-center">
            No peers in range. Tap rescan or move closer.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPeers.map((p, i) => {
              const isBle = p.transport?.toLowerCase().includes("ble") || p.transport?.toLowerCase().includes("bluetooth");
              const Icon = isBle ? Bluetooth : Wifi;
              const signalQuality = p.rssi_dbm > -60 ? "Strong" : p.rssi_dbm > -80 ? "Medium" : "Weak";
              const signalColor = p.rssi_dbm > -60 ? "text-secondary" : p.rssi_dbm > -80 ? "text-amber-600" : "text-muted-foreground";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card p-3 shadow-soft hover:shadow-float transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium truncate">{p.display_name}</span>
                        {p.is_relaying ? (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-secondary/15 text-secondary">
                            Relay
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{p.transport}</span>
                        <span>·</span>
                        <span>{p.distance_m}m</span>
                        <span>·</span>
                        <span className={signalColor}>{signalQuality} ({p.rssi_dbm} dBm)</span>
                      </div>
                    </div>
                    <Signal className={`w-4 h-4 ${signalColor} shrink-0`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* SOS broadcasts */}
      <section className="px-5">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-mono"></span>
          <h2 className="font-display text-lg">SOS broadcasts</h2>
        </div>
        <p className="-mt-1 mb-3 text-[11px] text-muted-foreground">
          Last 24h · relayed peer-to-peer until one node regains internet
        </p>

        {sos.length === 0 ? (
          <div className="py-6 text-sm text-muted-foreground text-center rounded-2xl border border-border bg-card/50">
            No active alerts in your area.
          </div>
        ) : (
          <div className="space-y-2">
            {sos.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-accent/40 bg-accent/5 p-3"
              >
                <div className="flex items-start gap-3">
                  <Siren className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{s.display_name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                        {s.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.message ?? "Emergency broadcast"}</p>
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                      <span>{s.city}</span>
                      <span>·</span>
                      <span>{s.peers_reached} peers reached</span>
                      <span>·</span>
                      <span>{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Privacy chips */}
      <div className="px-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Mesh privacy
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { i: ShieldCheck, l: "Rotating peer IDs" },
            { i: ShieldCheck, l: "Onion-style routing" },
            { i: ShieldCheck, l: "No location leaks" },
            { i: ShieldCheck, l: "Opt-in only" },
          ].map((c) => (
            <span key={c.l} className="glass rounded-full px-3 py-1 text-[11px] text-foreground/80 flex items-center gap-1">
              <c.i className="w-3 h-3 text-secondary" />
              {c.l}
            </span>
          ))}
        </div>
      </div>

      <ProtoFooter section="" title="Offline-first backbone">
        When networks fail, Circle keeps working. Bluetooth LE and Wi-Fi Direct discover phones nearby,
        messages hop 4-6 peers, and SOS alerts spread until one device regains internet — then everything
        syncs back. No towers. No servers. No surveillance. Just neighbours helping neighbours.
      </ProtoFooter>
    </div>
  );
}

export default MeshScreen;
