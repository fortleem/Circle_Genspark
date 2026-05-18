import { chats } from "@/lib/mock";
import { Search, Plus, Sparkles, Mic, Send, Image as ImageIcon, Phone, Video, Ghost, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function WaslScreen() {
  const [active, setActive] = useState<string | null>(null);
  const chat = chats.find(c => c.id === active);

  if (chat) return <ChatView chat={chat} onBack={() => setActive(null)} />;

  return (
    <div className="pb-32">
      <div className="px-5 pt-2 flex items-center justify-between">
        <h1 className="font-display text-4xl">Wasl <span className="gradient-text-gold">·</span> <span className="text-base text-muted-foreground tracking-widest uppercase">وصل</span></h1>
        <button className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center"><Plus className="w-5 h-5" /></button>
      </div>

      <div className="px-5 mt-4">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent flex-1 outline-none text-sm" placeholder="Search messages, people, files" />
          <Sparkles className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* Smart folders */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {["All", "Personal", "Work", "AI", "Unread", "Channels"].map((f, i) => (
          <button key={f} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${i === 0 ? "bg-primary text-primary-foreground" : "glass"}`}>{f}</button>
        ))}
      </div>

      {/* Stories */}
      <div className="flex gap-3 px-5 mt-5 overflow-x-auto scrollbar-hide">
        {["You", "Layla", "Omar", "Sara", "Khalid", "Mona", "Faisal"].map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={`w-16 h-16 rounded-full p-[2px] ${i === 0 ? "bg-muted" : "bg-gradient-mesh"}`}>
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-display text-lg">{s[0]}</div>
            </div>
            <span className="text-[10px] text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>

      {/* Chat list */}
      <ul className="mt-5 space-y-1">
        {chats.map((c, i) => (
          <motion.li key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
            <button onClick={() => setActive(c.id)} className="w-full text-start px-5 py-3 hover:bg-muted/40 transition flex items-center gap-3">
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-lg ${c.ai ? "bg-gradient-mesh text-primary-foreground" : c.group ? "bg-gradient-gold text-brand-charcoal" : "bg-gradient-hero text-primary-foreground"}`}>
                  {c.group ? <Users className="w-5 h-5" /> : c.ai ? <Sparkles className="w-5 h-5" /> : c.name[0]}
                </div>
                {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-secondary border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium truncate">{c.name}</span>
                  {c.official && <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">OFFICIAL</span>}
                </div>
                <p className="text-sm text-muted-foreground truncate">{c.last}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground">{c.time}</span>
                {c.unread && <span className="text-[10px] min-w-5 h-5 px-1.5 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-medium">{c.unread}</span>}
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function ChatView({ chat, onBack }: { chat: any; onBack: () => void }) {
  const messages = [
    { id: 1, me: false, text: "Hey, the brief looks great. One thing — can we tighten the intro?" },
    { id: 2, me: true, text: "Sure, on it now. AI is helping me rewrite ✨" },
    { id: 3, me: false, text: "Perfect. Also, will send the new visual direction tonight." },
    { id: 4, me: true, text: "Take your time. I'll be at Boulevard till 9." },
  ];
  return (
    <div className="pb-24 min-h-screen flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-muted-foreground">‹ Back</button>
        <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display">{chat.name[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{chat.name}</div>
          <div className="text-[10px] text-secondary flex items-center gap-1">
            <Ghost className="w-3 h-3" /> Ghost mode · End-to-end encrypted
          </div>
        </div>
        <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"><Phone className="w-4 h-4" /></button>
        <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"><Video className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 px-4 py-6 space-y-3">
        {messages.map(m => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.me ? "ms-auto bg-gradient-hero text-primary-foreground rounded-br-md" : "me-auto bg-muted rounded-bl-md"}`}>
            {m.text}
          </motion.div>
        ))}
        {/* AI suggestions */}
        <div className="flex gap-2 flex-wrap pt-2">
          {["Sounds good 👍", "On my way", "Tell me more"].map(s => (
            <button key={s} className="text-xs px-3 py-1.5 rounded-full glass border-secondary/30">{s}</button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-20 px-3">
        <div className="glass-strong rounded-full px-3 py-2 flex items-center gap-2 shadow-float">
          <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
          <input className="flex-1 bg-transparent outline-none text-sm py-1.5" placeholder="Message" />
          <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></button>
          <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center"><Mic className="w-4 h-4" /></button>
          <button className="w-9 h-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
