// Circle — Dynamic Naming Convention
// 7 languages + 2 English variants (Brand / US).
// Per blueprint §2: one binary, same backend, locally adapted labels.

export type Lang = 'ar' | 'en' | 'en-BRAND' | 'zh' | 'fr' | 'es' | 'de' | 'it'

export const RTL_LANGS: Lang[] = ['ar']

export interface NameMatrix {
  brand_name: string            // App name itself
  tagline: string
  module_chat: string           // Wasl
  module_video: string          // Mashahd
  module_photos: string         // Lamahat
  module_square: string         // Midan
  module_groups: string         // The Circle
  module_official: string
  module_creators: string
  module_professional: string
  module_travel: string         // Rihla
  module_mail: string
  module_payments: string
  module_id: string
  module_verify: string
  nav_home: string
  nav_dashboard: string
  nav_governance: string
  nav_transparency: string
  nav_apps: string
  covenant: string
}

const dict: Record<Lang, NameMatrix> = {
  'ar': {
    brand_name: 'دواير',
    tagline: 'تطبيق واحد، حياة كاملة — مجاني للأبد',
    module_chat: 'وصل',
    module_video: 'مشاهد',
    module_photos: 'لمحات',
    module_square: 'ميدان',
    module_groups: 'الدائرة',
    module_official: 'القنوات الرسمية',
    module_creators: 'قنوات المبدعين',
    module_professional: 'الشبكة المهنية',
    module_travel: 'رحلة',
    module_mail: 'بريد دواير',
    module_payments: 'نَط',
    module_id: 'هوية دواير',
    module_verify: 'توثيق دواير',
    nav_home: 'الرئيسية',
    nav_dashboard: 'لوحة التحكم',
    nav_governance: 'الحوكمة',
    nav_transparency: 'الشفافية',
    nav_apps: 'التطبيقات المصغّرة',
    covenant: 'العهد'
  },
  'en-BRAND': {
    brand_name: 'Circle',
    tagline: 'One app, every life — free forever',
    module_chat: 'Wasl',
    module_video: 'Mashahd',
    module_photos: 'Lamahat',
    module_square: 'Midan',
    module_groups: 'The Circle',
    module_official: 'Official Channels',
    module_creators: 'Creator Channels',
    module_professional: 'Professional Network',
    module_travel: 'Rihla',
    module_mail: 'Circle Mail',
    module_payments: 'Nat',
    module_id: 'Circle ID',
    module_verify: 'Circle Verify',
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_governance: 'Governance',
    nav_transparency: 'Transparency',
    nav_apps: 'Mini Apps',
    covenant: 'The Covenant'
  },
  'en': {
    brand_name: 'Circle',
    tagline: 'One app, every life — free forever',
    module_chat: 'Connect',
    module_video: 'Watch',
    module_photos: 'Glimpses',
    module_square: 'Square',
    module_groups: 'The Circle',
    module_official: 'Official Channels',
    module_creators: 'Creator Channels',
    module_professional: 'Pro Network',
    module_travel: 'Travel',
    module_mail: 'Mail',
    module_payments: 'Pay',
    module_id: 'Circle ID',
    module_verify: 'Verify',
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_governance: 'Governance',
    nav_transparency: 'Transparency',
    nav_apps: 'Mini Apps',
    covenant: 'The Covenant'
  },
  'zh': {
    brand_name: '圆圈',
    tagline: '一个应用，整个人生 — 永久免费',
    module_chat: '连接',
    module_video: '景象',
    module_photos: '一瞥',
    module_square: '广场',
    module_groups: '圆圈',
    module_official: '官方频道',
    module_creators: '创作者频道',
    module_professional: '职业网络',
    module_travel: '旅行',
    module_mail: '邮件',
    module_payments: '支付',
    module_id: '圆圈身份',
    module_verify: '认证',
    nav_home: '主页',
    nav_dashboard: '仪表板',
    nav_governance: '治理',
    nav_transparency: '透明度',
    nav_apps: '小程序',
    covenant: '盟约'
  },
  'fr': {
    brand_name: 'Cercle',
    tagline: 'Une app, toute la vie — gratuite à vie',
    module_chat: 'Relier',
    module_video: 'Regards',
    module_photos: 'Aperçus',
    module_square: 'Place',
    module_groups: 'Le Cercle',
    module_official: 'Canaux Officiels',
    module_creators: 'Canaux Créateurs',
    module_professional: 'Réseau Pro',
    module_travel: 'Voyage',
    module_mail: 'Courriel',
    module_payments: 'Paiement',
    module_id: 'Identité Cercle',
    module_verify: 'Vérifier',
    nav_home: 'Accueil',
    nav_dashboard: 'Tableau',
    nav_governance: 'Gouvernance',
    nav_transparency: 'Transparence',
    nav_apps: 'Mini-apps',
    covenant: 'Le Pacte'
  },
  'es': {
    brand_name: 'Círculo',
    tagline: 'Una app, toda la vida — gratis para siempre',
    module_chat: 'Conectar',
    module_video: 'Mirar',
    module_photos: 'Vistazos',
    module_square: 'Plaza',
    module_groups: 'El Círculo',
    module_official: 'Canales Oficiales',
    module_creators: 'Canales de Creadores',
    module_professional: 'Red Profesional',
    module_travel: 'Viajar',
    module_mail: 'Correo',
    module_payments: 'Pagar',
    module_id: 'Identidad Círculo',
    module_verify: 'Verificar',
    nav_home: 'Inicio',
    nav_dashboard: 'Panel',
    nav_governance: 'Gobernanza',
    nav_transparency: 'Transparencia',
    nav_apps: 'Mini-apps',
    covenant: 'El Pacto'
  },
  'de': {
    brand_name: 'Kreis',
    tagline: 'Eine App, ein ganzes Leben — für immer kostenlos',
    module_chat: 'Verbinden',
    module_video: 'Sehen',
    module_photos: 'Einblicke',
    module_square: 'Platz',
    module_groups: 'Der Kreis',
    module_official: 'Offizielle Kanäle',
    module_creators: 'Kreator-Kanäle',
    module_professional: 'Pro-Netzwerk',
    module_travel: 'Reise',
    module_mail: 'Post',
    module_payments: 'Zahlen',
    module_id: 'Kreis-ID',
    module_verify: 'Verifizieren',
    nav_home: 'Start',
    nav_dashboard: 'Übersicht',
    nav_governance: 'Governance',
    nav_transparency: 'Transparenz',
    nav_apps: 'Mini-Apps',
    covenant: 'Der Pakt'
  },
  'it': {
    brand_name: 'Cerchio',
    tagline: 'Una app, una vita intera — gratuita per sempre',
    module_chat: 'Collegare',
    module_video: 'Guardare',
    module_photos: 'Sguardi',
    module_square: 'Piazza',
    module_groups: 'Il Cerchio',
    module_official: 'Canali Ufficiali',
    module_creators: 'Canali Creatori',
    module_professional: 'Rete Pro',
    module_travel: 'Viaggio',
    module_mail: 'Posta',
    module_payments: 'Pagare',
    module_id: 'Identità Cerchio',
    module_verify: 'Verificare',
    nav_home: 'Inizio',
    nav_dashboard: 'Pannello',
    nav_governance: 'Governance',
    nav_transparency: 'Trasparenza',
    nav_apps: 'Mini-app',
    covenant: 'Il Patto'
  }
}

export function getNames(lang: string | undefined | null): NameMatrix {
  const l = (lang ?? 'en-BRAND') as Lang
  return dict[l] ?? dict['en-BRAND']
}

export function isRTL(lang: string | undefined | null): boolean {
  return RTL_LANGS.includes((lang ?? '') as Lang)
}

export const ALL_LANGS: { code: Lang; label: string }[] = [
  { code: 'ar',        label: 'العربية' },
  { code: 'en-BRAND',  label: 'English (Brand)' },
  { code: 'en',        label: 'English (US)' },
  { code: 'zh',        label: '中文' },
  { code: 'fr',        label: 'Français' },
  { code: 'es',        label: 'Español' },
  { code: 'de',        label: 'Deutsch' },
  { code: 'it',        label: 'Italiano' }
]
