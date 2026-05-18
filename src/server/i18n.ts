// Circle — Dynamic Naming Convention (Blueprint §2)
// 7 languages + 2 English variants. One binary, locally adapted labels.

export type Lang = 'ar' | 'en' | 'en-BRAND' | 'zh' | 'fr' | 'es' | 'de' | 'it'

export const RTL_LANGS: Lang[] = ['ar']

export interface NameMatrix {
  brand_name: string
  tagline: string
  module_chat: string
  module_video: string
  module_photos: string
  module_square: string
  module_groups: string
  module_official: string
  module_creators: string
  module_professional: string
  module_travel: string
  module_mail: string
  module_payments: string
  module_id: string
  module_verify: string
  module_maktab: string
  nav_home: string
  nav_dashboard: string
  nav_governance: string
  nav_transparency: string
  nav_apps: string
  covenant: string
  module_mesh: string
  module_aisafety: string
  module_aicore: string
  module_maps: string
  module_translate: string
  module_unique: string
  module_backup: string
  module_privacy: string
  module_models: string
  module_selfhost: string
  module_roadmap: string
  module_journeys: string
  module_techstack: string
  module_dre: string
  module_architecture: string
  module_vision: string
  module_monetization: string
}

const dict: Record<Lang, NameMatrix> = {
  'ar': {
    brand_name: 'دواير', tagline: 'تطبيق واحد، حياة كاملة — مجاني للأبد',
    module_chat: 'وصل', module_video: 'مشاهد', module_photos: 'لمحات', module_square: 'ميدان',
    module_groups: 'الدائرة', module_official: 'القنوات الرسمية', module_creators: 'قنوات المبدعين',
    module_professional: 'الشبكة المهنية', module_travel: 'رحلة', module_mail: 'بريد دواير',
    module_payments: 'نَط', module_id: 'هوية دواير', module_verify: 'توثيق دواير', module_maktab: 'وصل المكتب',
    nav_home: 'الرئيسية', nav_dashboard: 'لوحة التحكم', nav_governance: 'الحوكمة',
    nav_transparency: 'الشفافية', nav_apps: 'التطبيقات المصغّرة', covenant: 'العهد',
    module_mesh: 'الشبكة المحلية', module_aisafety: 'الأمان والإشراف', module_aicore: 'الذكاء الذاتي',
    module_maps: 'الخرائط', module_translate: 'الترجمة', module_unique: 'المميزات الفريدة',
    module_backup: 'النسخ الاحتياطي', module_privacy: 'الخصوصية', module_models: 'كتالوج النماذج',
    module_selfhost: 'الاستضافة الذاتية', module_roadmap: 'خارطة الطريق', module_journeys: 'رحلات المستخدمين',
    module_techstack: 'مجموعة التقنيات', module_dre: 'محرك المناطق', module_architecture: 'البنية',
    module_vision: 'الرؤية', module_monetization: 'نموذج العائد'
  },
  'en-BRAND': {
    brand_name: 'Circle', tagline: 'One app, every life — free forever',
    module_chat: 'Wasl', module_video: 'Mashahd', module_photos: 'Lamahat', module_square: 'Midan',
    module_groups: 'The Circle', module_official: 'Official Channels', module_creators: 'Creator Channels',
    module_professional: 'Professional Network', module_travel: 'Rihla', module_mail: 'Circle Mail',
    module_payments: 'Nat', module_id: 'Circle ID', module_verify: 'Circle Verify', module_maktab: 'Wasl Maktab',
    nav_home: 'Home', nav_dashboard: 'Dashboard', nav_governance: 'Governance',
    nav_transparency: 'Transparency', nav_apps: 'Mini Apps', covenant: 'The Covenant',
    module_mesh: 'Local Mesh', module_aisafety: 'AI Safety', module_aicore: 'Self-Learning AI',
    module_maps: 'Maps', module_translate: 'Translate', module_unique: 'Unique Features',
    module_backup: 'Backup & Migration', module_privacy: 'Privacy', module_models: 'Model Catalogue',
    module_selfhost: 'Self-Host', module_roadmap: 'Roadmap', module_journeys: 'User Journeys',
    module_techstack: 'Tech Stack', module_dre: 'Regional Engine', module_architecture: 'Architecture',
    module_vision: 'Vision', module_monetization: 'Monetization'
  },
  'en': {
    brand_name: 'Circle', tagline: 'One app, every life — free forever',
    module_chat: 'Connect', module_video: 'Watch', module_photos: 'Glimpses', module_square: 'Square',
    module_groups: 'The Circle', module_official: 'Official Channels', module_creators: 'Creator Channels',
    module_professional: 'Pro Network', module_travel: 'Travel', module_mail: 'Mail',
    module_payments: 'Pay', module_id: 'Circle ID', module_verify: 'Verify', module_maktab: 'Workspace',
    nav_home: 'Home', nav_dashboard: 'Dashboard', nav_governance: 'Governance',
    nav_transparency: 'Transparency', nav_apps: 'Mini Apps', covenant: 'The Covenant',
    module_mesh: 'Local Mesh', module_aisafety: 'AI Safety', module_aicore: 'Self-Learning AI',
    module_maps: 'Maps', module_translate: 'Translate', module_unique: 'Unique Features',
    module_backup: 'Backup & Migration', module_privacy: 'Privacy', module_models: 'Model Catalogue',
    module_selfhost: 'Self-Host', module_roadmap: 'Roadmap', module_journeys: 'User Journeys',
    module_techstack: 'Tech Stack', module_dre: 'Regional Engine', module_architecture: 'Architecture',
    module_vision: 'Vision', module_monetization: 'Monetization'
  },
  'zh': {
    brand_name: '圆圈', tagline: '一个应用，整个人生 — 永久免费',
    module_chat: '连接', module_video: '景象', module_photos: '一瞥', module_square: '广场',
    module_groups: '圆圈', module_official: '官方频道', module_creators: '创作者频道',
    module_professional: '职业网络', module_travel: '旅行', module_mail: '邮件',
    module_payments: '支付', module_id: '圆圈身份', module_verify: '认证', module_maktab: '工作空间',
    nav_home: '主页', nav_dashboard: '仪表板', nav_governance: '治理',
    nav_transparency: '透明度', nav_apps: '小程序', covenant: '盟约',
    module_mesh: '本地网络', module_aisafety: '内容安全', module_aicore: '自学习AI',
    module_maps: '地图', module_translate: '翻译', module_unique: '独特功能',
    module_backup: '备份迁移', module_privacy: '隐私', module_models: '模型库',
    module_selfhost: '自托管', module_roadmap: '路线图', module_journeys: '用户旅程',
    module_techstack: '技术栈', module_dre: '地区引擎', module_architecture: '架构',
    module_vision: '愿景', module_monetization: '商业模式'
  },
  'fr': {
    brand_name: 'Cercle', tagline: 'Une app, toute la vie — gratuite à vie',
    module_chat: 'Relier', module_video: 'Regards', module_photos: 'Aperçus', module_square: 'Place',
    module_groups: 'Le Cercle', module_official: 'Canaux Officiels', module_creators: 'Canaux Créateurs',
    module_professional: 'Réseau Pro', module_travel: 'Voyage', module_mail: 'Courriel',
    module_payments: 'Paiement', module_id: 'Identité Cercle', module_verify: 'Vérifier', module_maktab: 'Espace Pro',
    nav_home: 'Accueil', nav_dashboard: 'Tableau', nav_governance: 'Gouvernance',
    nav_transparency: 'Transparence', nav_apps: 'Mini-apps', covenant: 'Le Pacte',
    module_mesh: 'Maillage Local', module_aisafety: 'Sécurité IA', module_aicore: 'IA Auto-Apprenante',
    module_maps: 'Cartes', module_translate: 'Traduire', module_unique: 'Fonctions Uniques',
    module_backup: 'Sauvegarde', module_privacy: 'Confidentialité', module_models: 'Catalogue IA',
    module_selfhost: 'Auto-Hébergement', module_roadmap: 'Feuille de Route', module_journeys: 'Parcours Utilisateurs',
    module_techstack: 'Pile Technique', module_dre: 'Moteur Régional', module_architecture: 'Architecture',
    module_vision: 'Vision', module_monetization: 'Monétisation'
  },
  'es': {
    brand_name: 'Círculo', tagline: 'Una app, toda la vida — gratis para siempre',
    module_chat: 'Conectar', module_video: 'Mirar', module_photos: 'Vistazos', module_square: 'Plaza',
    module_groups: 'El Círculo', module_official: 'Canales Oficiales', module_creators: 'Canales de Creadores',
    module_professional: 'Red Profesional', module_travel: 'Viajar', module_mail: 'Correo',
    module_payments: 'Pagar', module_id: 'Identidad Círculo', module_verify: 'Verificar', module_maktab: 'Espacio Laboral',
    nav_home: 'Inicio', nav_dashboard: 'Panel', nav_governance: 'Gobernanza',
    nav_transparency: 'Transparencia', nav_apps: 'Mini-apps', covenant: 'El Pacto',
    module_mesh: 'Malla Local', module_aisafety: 'Seguridad IA', module_aicore: 'IA Auto-Aprendizaje',
    module_maps: 'Mapas', module_translate: 'Traducir', module_unique: 'Funciones Únicas',
    module_backup: 'Respaldo', module_privacy: 'Privacidad', module_models: 'Catálogo IA',
    module_selfhost: 'Auto-Alojamiento', module_roadmap: 'Hoja de Ruta', module_journeys: 'Recorridos',
    module_techstack: 'Pila Técnica', module_dre: 'Motor Regional', module_architecture: 'Arquitectura',
    module_vision: 'Visión', module_monetization: 'Monetización'
  },
  'de': {
    brand_name: 'Kreis', tagline: 'Eine App, ein ganzes Leben — für immer kostenlos',
    module_chat: 'Verbinden', module_video: 'Sehen', module_photos: 'Einblicke', module_square: 'Platz',
    module_groups: 'Der Kreis', module_official: 'Offizielle Kanäle', module_creators: 'Kreator-Kanäle',
    module_professional: 'Pro-Netzwerk', module_travel: 'Reise', module_mail: 'Post',
    module_payments: 'Zahlen', module_id: 'Kreis-ID', module_verify: 'Verifizieren', module_maktab: 'Arbeitsraum',
    nav_home: 'Start', nav_dashboard: 'Übersicht', nav_governance: 'Governance',
    nav_transparency: 'Transparenz', nav_apps: 'Mini-Apps', covenant: 'Der Pakt',
    module_mesh: 'Lokales Mesh', module_aisafety: 'KI-Sicherheit', module_aicore: 'Selbstlernende KI',
    module_maps: 'Karten', module_translate: 'Übersetzen', module_unique: 'Einzigartige Funktionen',
    module_backup: 'Sicherung', module_privacy: 'Privatsphäre', module_models: 'KI-Katalog',
    module_selfhost: 'Selbst-Hosten', module_roadmap: 'Roadmap', module_journeys: 'Nutzerreisen',
    module_techstack: 'Tech-Stack', module_dre: 'Regional-Engine', module_architecture: 'Architektur',
    module_vision: 'Vision', module_monetization: 'Monetarisierung'
  },
  'it': {
    brand_name: 'Cerchio', tagline: 'Una app, una vita intera — gratuita per sempre',
    module_chat: 'Collegare', module_video: 'Guardare', module_photos: 'Sguardi', module_square: 'Piazza',
    module_groups: 'Il Cerchio', module_official: 'Canali Ufficiali', module_creators: 'Canali Creatori',
    module_professional: 'Rete Pro', module_travel: 'Viaggio', module_mail: 'Posta',
    module_payments: 'Pagare', module_id: 'Identità Cerchio', module_verify: 'Verificare', module_maktab: 'Spazio Lavoro',
    nav_home: 'Inizio', nav_dashboard: 'Pannello', nav_governance: 'Governance',
    nav_transparency: 'Trasparenza', nav_apps: 'Mini-app', covenant: 'Il Patto',
    module_mesh: 'Rete Locale', module_aisafety: 'Sicurezza IA', module_aicore: 'IA Auto-Apprendente',
    module_maps: 'Mappe', module_translate: 'Tradurre', module_unique: 'Funzioni Uniche',
    module_backup: 'Backup', module_privacy: 'Privacy', module_models: 'Catalogo IA',
    module_selfhost: 'Auto-Hosting', module_roadmap: 'Roadmap', module_journeys: 'Percorsi Utente',
    module_techstack: 'Stack Tecnico', module_dre: 'Motore Regionale', module_architecture: 'Architettura',
    module_vision: 'Visione', module_monetization: 'Monetizzazione'
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

export { dict }
