// Cirkle — UI copy strings (separate from NameMatrix which holds module/brand names)
// Falls back to en-BRAND for any locale that hasn't been translated yet.

import type { Lang } from "@/lib/i18n";

export interface UIStrings {
  home: {
    hello: string;
    ask: string;
    featured: string;
    nearby: string;
    trending: string;
    quickActions: string;
  };
  onboarding: {
    slide1: { title: string; body: string };
    slide2: { title: string; body: string };
    slide3: { title: string; body: string };
    skip: string;
    cta: string;
  };
  common: {
    loading: string;
    error: string;
    seeAll: string;
    search: string;
  };
}

const en: UIStrings = {
  home: {
    hello: "Hello",
    ask: "Ask anything — Wasl, Mashahd, Rihla…",
    featured: "Featured for you",
    nearby: "Near you",
    trending: "Trending",
    quickActions: "Quick actions",
  },
  onboarding: {
    slide1: { title: "Your connected world", body: "One app for messaging, video, photos, payments, travel and more — privacy first, federated, AI-native." },
    slide2: { title: "Owned by you", body: "Federated nodes, IPFS storage, on-device AI. Your data never enters a surveillance economy." },
    slide3: { title: "Built for everyone", body: "Eight languages, six data planes, and full offline operation via Bluetooth mesh." },
    skip: "Skip",
    cta: "Get started",
  },
  common: { loading: "Loading…", error: "Something went wrong", seeAll: "See all", search: "Search" },
};

const ar: UIStrings = {
  home: {
    hello: "أهلاً",
    ask: "اسأل عن أي شيء — وصل، مشاهد، رحلة…",
    featured: "مختار لك",
    nearby: "قربك",
    trending: "الأكثر تداولاً",
    quickActions: "إجراءات سريعة",
  },
  onboarding: {
    slide1: { title: "عالمك المتصل", body: "تطبيق واحد للرسائل، الفيديو، الصور، الدفع، السفر، والمزيد — خصوصية أولاً، اتحادي، يعتمد على الذكاء الاصطناعي." },
    slide2: { title: "ملك لك أنت", body: "عقد اتحادية، تخزين IPFS، ذكاء اصطناعي على الجهاز. بياناتك لا تدخل أبداً اقتصاد المراقبة." },
    slide3: { title: "مبني للجميع", body: "ثماني لغات، ست مناطق بيانات، وعمل كامل دون اتصال عبر شبكة Bluetooth." },
    skip: "تخطي",
    cta: "ابدأ",
  },
  common: { loading: "جارٍ التحميل…", error: "حدث خطأ", seeAll: "عرض الكل", search: "بحث" },
};

export const uiStrings: Record<Lang, UIStrings> = {
  "en": en,
  "en-BRAND": en,
  "ar": ar,
  "zh": en, // TODO: translate
  "fr": en,
  "es": en,
  "de": en,
  "it": en,
};

export function ui(lang: Lang): UIStrings {
  return uiStrings[lang] ?? uiStrings["en-BRAND"];
}
