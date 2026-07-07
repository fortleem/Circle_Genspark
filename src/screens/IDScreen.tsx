// — Cirkle ID: Digital identity wallet with animated card, passkeys, verifications
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound, Fingerprint, ShieldCheck, Globe, QrCode, Copy, Check, Smartphone,
  Lock, Users, RefreshCw, Key, Clock, AlertCircle, BadgeCheck, Eye, EyeOff, Wallet
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useApi } from "@/hooks/useApi";

const LINKED_DEVICES = [
  { id: 1, name: "iPhone 15 Pro", os: "iOS 18", lastSeen: "Now", current: true },
  { id: 2, name: "MacBook Pro M3", os: "macOS 15", lastSeen: "2 min ago", current: false },
  { id: 3, name: "iPad Air", os: "iPadOS 18", lastSeen: "1 hour ago", current: false },
];

const VERIFICATION_BADGES = [
  { id: 1, type: "identity", label: "Haweya ID", status: "verified", verifiedAt: "2024-03-15", icon: Fingerprint },
  { id: 2, type: "phone", label: "+20 100 123 ****", status: "verified", verifiedAt: "2024-01-10", icon: Smartphone },
  { id: 3, type: "email", label: "y****@cirkle.eg", status: "verified", verifiedAt: "2024-01-10", icon: Globe },
  { id: 4, type: "payment", label: "InstaPay Account", status: "verified", verifiedAt: "2024-05-20", icon: Wallet },
];

const KEY_HISTORY = [
  { action: "Key rotation", date: "2024-06-08", detail: "Ed25519 primary key rotated" },
  { action: "Device added", date: "2024-05-15", detail: "iPad Air linked via QR" },
  { action: "Recovery updated", date: "2024-04-22", detail: "Guardian 3 replaced" },
  { action: "Identity verified", date: "2024-03-15", detail: "Haweya National ID confirmed" },
];

export function IDScreen() {
  const { names } = useApp();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const { data: identityData } = useApi<{ verifications: any[] }>("/auth/verify-identity/1");

  const copyDid = () => {
    navigator.clipboard?.writeText("did:cirkle:0x7f2a3b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9cae91");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-32">
      {/* Animated ID Card */}
      <div className="px-4 pt-2">
        <h1 className="font-display text-3xl">Cirkle ID</h1>
        <p className="text-sm text-muted-foreground mt-1">Your sovereign digital identity</p>
      </div>

      <div className="px-4 mt-4" style={{ perspective: "1000px" }}>
        <motion.div
          className="relative w-full aspect-[1.6/1] cursor-pointer"
          onClick={() => setFlipped(!flipped)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front of card */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-float" style={{ backfaceVisibility: "hidden" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a4a] via-[#0d2a3a] to-[#0a1f2e]" />
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "radial-gradient(cirkle at 20% 30%, rgba(56,189,248,0.3), transparent 50%), radial-gradient(cirkle at 80% 70%, rgba(168,85,247,0.2), transparent 40%)"
            }} />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }} />
            <div className="relative h-full p-6 flex flex-col justify-between text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Cirkle Decentralized ID</div>
                  <div className="font-display text-2xl mt-1">Yousef Al-Harbi</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-sky-400 flex items-center justify-center">
                  <Fingerprint className="w-7 h-7" />
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Handle</div>
                <div className="font-mono text-base">@yousef</div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">DID</div>
                  <div className="font-mono text-xs opacity-80">did:cirkle:0x7f2…ae91</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-sky-300" />
                  <span className="text-[10px] text-sky-300">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-float" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d2a3a] to-[#1a3a4a]" />
            <div className="relative h-full p-6 flex flex-col justify-between text-white">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">Public Key (Ed25519)</div>
                <div className="font-mono text-[11px] break-all opacity-80 bg-white/5 rounded-lg p-2">
                  {showKey ? "ed25519:7f2a3b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9cae91d0e1f2a3b4c5d6e7f8" : "••••••••••••••••••••••••••••••••"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button onClick={(e) => { e.stopPropagation(); setShowKey(!showKey); }} className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {showKey ? "Hide" : "Reveal"}
                </button>
                <button onClick={(e) => { e.stopPropagation(); copyDid(); }} className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copied ? "Copied!" : "Copy DID"}
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-[10px] opacity-50">
                  Created: Jan 10, 2024 · Algorithm: Ed25519+X25519<br/>
                  Recovery: 3-of-5 Shamir · Nodes: 4 federated
                </div>
                <QrCode className="w-10 h-10 opacity-40" />
              </div>
            </div>
          </div>
        </motion.div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">Tap card to flip</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2 px-4 mt-5">
        {[
          { icon: Key, label: "Ed25519", sub: "Algorithm" },
          { icon: Users, label: "3-of-5", sub: "Recovery" },
          { icon: Globe, label: "31/31", sub: "Modules" },
          { icon: RefreshCw, label: "12d", sub: "Last rotated" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-2.5 text-center">
            <s.icon className="w-4 h-4 mx-auto text-secondary" />
            <div className="font-display text-sm mt-1">{s.label}</div>
            <div className="text-[9px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Linked devices */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-secondary" /> Linked Devices
        </h3>
        <div className="space-y-2">
          {LINKED_DEVICES.map(d => (
            <div key={d.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${d.current ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  {d.name}
                  {d.current && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">This device</span>}
                </div>
                <div className="text-xs text-muted-foreground">{d.os} · {d.lastSeen}</div>
              </div>
              {!d.current && (
                <button className="text-[10px] px-2 py-1 rounded-full glass text-red-400">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Verifications */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-secondary" /> Verifications
        </h3>
        <div className="space-y-2">
          {VERIFICATION_BADGES.map(v => (
            <div key={v.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <v.icon className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{v.label}</div>
                <div className="text-xs text-muted-foreground">Verified {v.verifiedAt}</div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Key history */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-secondary" /> Key Activity Log
        </h3>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-border/50">
          {KEY_HISTORY.map((h, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <div className="flex-1">
                <div className="text-sm font-medium">{h.action}</div>
                <div className="text-xs text-muted-foreground">{h.detail}</div>
              </div>
              <span className="text-[10px] text-muted-foreground">{h.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default IDScreen;
