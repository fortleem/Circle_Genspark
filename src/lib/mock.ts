// Mock data for Circle screens
export const featured = [
  { id: "f1", kind: "alert", title: "Air-quality advisory", subtitle: "Riyadh • Moderate dust until 9pm", color: "rose" },
  { id: "f2", kind: "event", title: "Diriyah Light Festival", subtitle: "Tonight • 7:30 PM • 12 min away", color: "gold" },
  { id: "f3", kind: "ai", title: "Your weekly digest is ready", subtitle: "Curated by Circle AI", color: "teal" },
  { id: "f4", kind: "feature", title: "New: Voice rooms in Midan", subtitle: "Join the conversation", color: "steel" },
];

export const nearby = [
  { id: "n1", title: "Boulevard World", meta: "1.2 km · Open now", tag: "Entertainment" },
  { id: "n2", title: "Café Bateel", meta: "400 m · Coffee", tag: "Food" },
  { id: "n3", title: "Tuwaiq Palace", meta: "3.1 km · Cultural", tag: "Heritage" },
  { id: "n4", title: "Rooftop Cinema", meta: "2.4 km · Tonight", tag: "Movies" },
];

export const trending = [
  { id: "t1", tag: "#Diriyah_Festival", count: "12.4K" },
  { id: "t2", tag: "#GreenRiyadh", count: "8.7K" },
  { id: "t3", tag: "#FormulaE", count: "21.2K" },
  { id: "t4", tag: "#RamadanNights", count: "33.1K" },
];

export const chats = [
  { id: "c1", name: "Layla Al-Otaibi", last: "Will send the brief tonight ✨", time: "2m", unread: 3, online: true, ai: true },
  { id: "c2", name: "Design Workspace", last: "Omar shared 4 new mockups", time: "12m", unread: 12, group: true },
  { id: "c3", name: "Khalid", last: "Voice message · 0:42", time: "1h", voice: true },
  { id: "c4", name: "Family ❤", last: "Mom: Don't be late", time: "3h", group: true },
  { id: "c5", name: "Circle AI", last: "Here's a summary of today's news", time: "5h", ai: true, official: true },
  { id: "c6", name: "Sara H.", last: "📷 Photo", time: "Yesterday" },
];

export const reels = [
  { id: "r1", creator: "@dunes.studio", caption: "Sunset over AlUla — shot on Circle Pro", likes: "128K", music: "Ambient · Sahara" },
  { id: "r2", creator: "@chefnoura", caption: "3-minute kunafa hack", likes: "89K", music: "Original audio" },
  { id: "r3", creator: "@urbanksa", caption: "Riyadh Boulevard tour", likes: "212K", music: "Lo-fi beats" },
];

export const photos = Array.from({ length: 18 }).map((_, i) => ({
  id: `p${i}`,
  hue: (i * 37) % 360,
  ratio: i % 5 === 0 ? "tall" : i % 3 === 0 ? "wide" : "square",
}));

export const posts = [
  { id: "po1", user: "Mona K.", handle: "@monak", time: "4m",
    body: "The new Wasl AI replies are uncannily good. It actually sounds like me 😅",
    likes: 248, comments: 32, reposts: 14, verified: true },
  { id: "po2", user: "Tariq", handle: "@tariq.dev", time: "22m",
    body: "Hot take: Circle Pay's animation when NFC connects deserves an Oscar 🏆",
    likes: 1290, comments: 88, reposts: 220 },
  { id: "po3", user: "Riyadh Daily", handle: "@riyadhdaily", time: "1h",
    body: "Diriyah Light Festival opens tonight. Threads of gold and lanterns return for the 4th season.",
    likes: 4500, comments: 311, reposts: 980, verified: true, image: true },
];

export const trips = [
  { id: "tr1", city: "Istanbul", days: 5, dates: "Jun 12 – Jun 17", cover: "teal" },
  { id: "tr2", city: "Tokyo", days: 9, dates: "Aug 04 – Aug 13", cover: "rose" },
  { id: "tr3", city: "AlUla", days: 3, dates: "Oct 22 – Oct 25", cover: "gold" },
];

export const transactions = [
  { id: "x1", who: "Tamimi Markets", amount: -84.20, time: "Today · 18:42", cat: "Groceries" },
  { id: "x2", who: "Layla Al-Otaibi", amount: -120.00, time: "Today · 14:10", cat: "Transfer" },
  { id: "x3", who: "Salary · Aramco", amount: 18500.00, time: "Yesterday", cat: "Income" },
  { id: "x4", who: "Jarir Bookstore", amount: -245.00, time: "Yesterday", cat: "Shopping" },
  { id: "x5", who: "STC Pay top-up", amount: -200.00, time: "May 12", cat: "Recharge" },
];
