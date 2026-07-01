// — Unique: Showcase of Circle's signature features that no competitor has
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star, Fingerprint, Eye, Shield, Zap, Compass, Brain, Lock, Heart,
  Radio, Users, Globe, Sparkles, Layers, Palette, Clock, MessageCircle,
  Wifi, Vote, Wallet, Play, Camera
} from "lucide-react";
import { Link } from "react-router-dom";

const SIGNATURE_FEATURES = [
  {
    id: "constellation",
    icon: Sparkles,
    title: "Social Constellation",
    arabic: "البُرج الاجتماعي",
    desc: "Visualize your social universe as an interactive orbital system. Inner orbits = closest contacts. See relationship strength decay over time.",
    gradient: "from-purple-500 to-indigo-600",
    path: "/profile",
    category: "Social",
  },
  {
    id: "whispers",
    icon: Clock,
    title: "Whispers",
    arabic: "الهمسات",
    desc: "Messages that self-destruct after being read. View-once photos, timed texts, and vanishing voice notes. Not even Circle can recover them.",
    gradient: "from-pink-500 to-rose-600",
    path: "/wasl",
    category: "Privacy",
  },
  {
    id: "capsules",
    icon: Lock,
    title: "Time Capsules",
    arabic: "كبسولات الوقت",
    desc: "Seal messages, photos, or videos to be opened at a future date. Cryptographically locked — no one (including you) can open early.",
    gradient: "from-amber-500 to-orange-600",
    path: "/profile",
    category: "Social",
  },
  {
    id: "pulse",
    icon: Radio,
    title: "Activity Pulse",
    arabic: "نبض المجتمع",
    desc: "Real-time heatmap of community activity across all modules. See what's trending, where conversations are happening, without exposing individuals.",
    gradient: "from-red-500 to-pink-600",
    path: "/",
    category: "Social",
  },
  {
    id: "cultural",
    icon: Globe,
    title: "Cultural Interpreter",
    arabic: "المترجم الثقافي",
    desc: "Not just language — cultural norms, tipping etiquette, dress codes, taboos. AI-powered city guides that understand context.",
    gradient: "from-teal-500 to-cyan-600",
    path: "/rihla",
    category: "AI",
  },
  {
    id: "mesh",
    icon: Wifi,
    title: "Offline Mesh",
    arabic: "الشبكة المحلية",
    desc: "Send messages without internet using Bluetooth/WiFi-Direct. Works in protests, disasters, or remote areas. E2EE maintained.",
    gradient: "from-emerald-500 to-green-600",
    path: "/mesh",
    category: "Infrastructure",
  },
  {
    id: "family_vault",
    icon: Shield,
    title: "Family Vault",
    arabic: "خزنة العائلة",
    desc: "M-of-N social recovery using Shamir's Secret Sharing. Split your recovery key among family. 3 of 5 needed to restore — no single point of failure.",
    gradient: "from-blue-500 to-indigo-600",
    path: "/backup",
    category: "Security",
  },
  {
    id: "liquid_democracy",
    icon: Vote,
    title: "Liquid Democracy",
    arabic: "الديمقراطية السائلة",
    desc: "Delegate your votes to experts on specific topics. Revoke anytime. Override on individual proposals. Quadratic voting prevents plutocracy.",
    gradient: "from-sky-500 to-blue-600",
    path: "/governance",
    category: "Governance",
  },
  {
    id: "privacy_sim",
    icon: Eye,
    title: "Privacy Simulator",
    arabic: "محاكي الخصوصية",
    desc: "See exactly what data is visible to strangers, friends, and Circle itself. A live preview of your digital footprint.",
    gradient: "from-violet-500 to-purple-600",
    path: "/privacy",
    category: "Privacy",
  },
  {
    id: "ai_on_device",
    icon: Brain,
    title: "100% On-Device AI",
    arabic: "الذكاء المحلي",
    desc: "Recommendations, translations, moderation, search — all computed on YOUR device. Nothing sent to any cloud. Models update via CDN diffs.",
    gradient: "from-rose-500 to-pink-600",
    path: "/aicore",
    category: "AI",
  },
  {
    id: "tickets",
    icon: Wallet,
    title: "Crypto Tickets",
    arabic: "التذاكر المشفرة",
    desc: "Event passes anchored to your DID. Transferable, verifiable, un-forgeable. No scalper bots. Attendance proves itself.",
    gradient: "from-yellow-500 to-amber-600",
    path: "/profile",
    category: "Social",
  },
  {
    id: "reality_lens",
    icon: Camera,
    title: "Reality Lens",
    arabic: "عدسة الواقع",
    desc: "Geo-anchored AR memory layer. Leave digital notes at physical locations visible only to your circles. A private social layer on the real world.",
    gradient: "from-cyan-500 to-teal-600",
    path: "/maps",
    category: "AR",
  },
];

const CATEGORIES = ["All", "Social", "Privacy", "AI", "Infrastructure", "Security", "Governance", "AR"];

export function UniqueScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = activeCategory === "All" ? SIGNATURE_FEATURES : SIGNATURE_FEATURES.filter(f => f.category === activeCategory);

  return (
    <div className="pb-32">
      <div className="px-5 pt-2">
        <h1 className="font-display text-3xl">What Makes Circle Unique</h1>
        <p className="text-sm text-muted-foreground mt-1">12 signature features no other platform offers</p>
      </div>

      {/* Hero stat */}
      <div className="px-4 mt-4">
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-secondary/30 to-primary/20 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl">12 Innovations</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Features you won't find on WhatsApp, Telegram, Instagram, or any competitor.
                Built from scratch to respect your sovereignty.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
              activeCategory === cat ? 'bg-secondary text-secondary-foreground' : 'glass'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Features grid */}
      <div className="px-4 mt-4 space-y-3">
        {filtered.map((f, i) => (
          <motion.div key={f.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}>
            <Link to={f.path} className="block glass rounded-2xl p-4 hover:bg-muted/30 transition relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition" />
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shrink-0`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base">{f.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f.category}</span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5" dir="rtl">{f.arabic}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Comparison */}
      <div className="px-4 mt-6">
        <h3 className="font-display text-lg mb-3">Competitor Comparison</h3>
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left p-2.5 font-medium">Feature</th>
                <th className="p-2.5 font-medium text-center">Circle</th>
                <th className="p-2.5 font-medium text-center text-muted-foreground">WhatsApp</th>
                <th className="p-2.5 font-medium text-center text-muted-foreground">Telegram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {[
                { feat: "On-device AI", circle: true, wa: false, tg: false },
                { feat: "E2EE by default", circle: true, wa: true, tg: false },
                { feat: "Social recovery", circle: true, wa: false, tg: false },
                { feat: "Liquid democracy", circle: true, wa: false, tg: false },
                { feat: "Offline mesh", circle: true, wa: false, tg: false },
                { feat: "Open source", circle: true, wa: false, tg: true },
                { feat: "No phone required", circle: true, wa: false, tg: false },
                { feat: "Data portability", circle: true, wa: false, tg: true },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="p-2.5">{row.feat}</td>
                  <td className="p-2.5 text-center">{row.circle ? '✅' : '❌'}</td>
                  <td className="p-2.5 text-center">{row.wa ? '✅' : '❌'}</td>
                  <td className="p-2.5 text-center">{row.tg ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default UniqueScreen;
