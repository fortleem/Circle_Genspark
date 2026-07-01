// Circle — Dynamic Regional Engine (DRE)
// Per Blueprint v12.0 §3: six data planes, instant compliance, no app update needed.
// Every node (payment rails, content rules, language, homeserver) depends on country.

export type DataPlane = 'global' | 'china' | 'russia' | 'iran' | 'vietnam' | 'eu'

export interface PaymentMethod {
  id: string                       // 'vodafone_cash' | 'instapay' | 'fawry' | …
  label: string                    // human display
  category: 'wallet' | 'instant' | 'card' | 'cash' | 'crypto'
  deeplink_scheme?: string         // e.g. 'vfcash://pay'  → opens native wallet app
  qr_supported: boolean
  ussd_code?: string               // fallback for offline / feature phones
  min: number                      // min txn (in local currency)
  max: number                      // max txn (KYC tier 2)
  fee_pct: number                  // gross merchant fee shown to user
  currency: string                 // local currency code
  provider?: string                // 'paymob' | 'fawry' | 'direct'
  icon: string                     // emoji or short ID for UI
}

export interface RegionConfig {
  country: string
  country_name: string
  region: DataPlane
  language: { default: string; fallback: string; rtl: boolean }
  currency: string
  features: {
    voip_calling: boolean
    local_mesh: boolean
    screenshot_protection: boolean
    anonymous_posting: boolean
    payment_methods: string[]      // ordered list of PaymentMethod.id (preferred → fallback)
    nfc_payments: boolean
    qr_payments: boolean
    crypto_allowed: boolean
    cultural_events: string[]
    emergency_alerts: boolean
  }
  payments: PaymentMethod[]        // full method definitions for UI rendering
  compliance: {
    data_retention_days: number    // 0 = ephemeral, only client-side ledger
    real_name_required: boolean
    content_filtering: boolean
    gdpr_applies?: boolean
    right_to_be_forgotten?: boolean
    minor_protection: boolean
    crypto_prohibited?: boolean
    notes?: string
  }
  homeserver: string
  peertube_instance: string
  ntfy_server: string
  maps_tile_server: string
  models_source: 'huggingface' | 'modelscope' | 'yandex'
  blocked_domains: string[]
}

// ─── EU member states (GDPR / MiCAR / data plane = eu) ───
const EU_COUNTRIES = new Set([
  'DE','FR','ES','IT','NL','BE','AT','FI','SE','PL','PT','IE','GR','DK','CZ',
  'RO','HU','BG','HR','SI','SK','EE','LV','LT','LU','MT','CY'
])

export function planeFor(country: string): DataPlane {
  const c = country.toUpperCase()
  if (c === 'CN') return 'china'
  if (c === 'RU') return 'russia'
  if (c === 'IR') return 'iran'
  if (c === 'VN') return 'vietnam'
  if (EU_COUNTRIES.has(c)) return 'eu'
  return 'global'
}

const DEFAULTS = {
  homeserver: 'matrix.circle.app',
  peertube_instance: 'https://peertube.circle.app',
  ntfy_server: 'https://ntfy.circle.app',
}

// ──────────────────────────────────────────────────────────────────────────
// 🇪🇬 EGYPT — Vodafone Cash, Orange, Etisalat, WE Pay, InstaPay, Fawry, Meeza
// ──────────────────────────────────────────────────────────────────────────
const EGYPT_PAYMENTS: PaymentMethod[] = [
  { id: 'instapay',      label: 'InstaPay',            category: 'instant', deeplink_scheme: 'instapay://pay',     qr_supported: true,  ussd_code: '*199#', min: 1,  max: 60000, fee_pct: 0,    currency: 'EGP', provider: 'direct', icon: '⚡' },
  { id: 'vodafone_cash', label: 'Vodafone Cash',       category: 'wallet',  deeplink_scheme: 'vfcash://pay',       qr_supported: true,  ussd_code: '*9#',   min: 1,  max: 30000, fee_pct: 0.5,  currency: 'EGP', provider: 'paymob', icon: '🔴' },
  { id: 'orange_money',  label: 'Orange Money',        category: 'wallet',  deeplink_scheme: 'orangemoney://pay',  qr_supported: true,  ussd_code: '#7000#',min: 1,  max: 30000, fee_pct: 0.5,  currency: 'EGP', provider: 'paymob', icon: '🟠' },
  { id: 'etisalat_cash', label: 'Etisalat Cash',       category: 'wallet',  deeplink_scheme: 'etisalatcash://pay', qr_supported: true,  ussd_code: '*777#', min: 1,  max: 30000, fee_pct: 0.5,  currency: 'EGP', provider: 'paymob', icon: '🟢' },
  { id: 'we_pay',        label: 'WE Pay (Telecom EG)', category: 'wallet',  deeplink_scheme: 'wepay://pay',        qr_supported: true,  ussd_code: '*4545#',min: 1,  max: 30000, fee_pct: 0.5,  currency: 'EGP', provider: 'paymob', icon: '💜' },
  { id: 'fawry',         label: 'Fawry retail / QR',   category: 'cash',                                            qr_supported: true,                       min: 1,  max: 25000, fee_pct: 1.0,  currency: 'EGP', provider: 'fawry',  icon: '🏪' },
  { id: 'meeza',         label: 'Meeza card',          category: 'card',                                            qr_supported: true,                       min: 1,  max: 100000,fee_pct: 1.5,  currency: 'EGP', provider: 'paymob', icon: '💳' },
  { id: 'visa_master',   label: 'Visa / Mastercard',   category: 'card',                                            qr_supported: false,                      min: 1,  max: 100000,fee_pct: 2.4,  currency: 'EGP', provider: 'paymob', icon: '💳' },
]

// ──────────────────────────────────────────────────────────────────────────
// Helper: build a sane default config (used by countries without override)
// ──────────────────────────────────────────────────────────────────────────
function baseDefault(c: string, opts: Partial<RegionConfig>): RegionConfig {
  const plane = planeFor(c)
  const isEU = plane === 'eu'
  return {
    country: c,
    country_name: opts.country_name ?? c,
    region: plane,
    language: { default: 'en', fallback: 'en', rtl: false },
    currency: opts.currency ?? 'USD',
    features: {
      voip_calling: true, local_mesh: true, screenshot_protection: false,
      anonymous_posting: !isEU,
      payment_methods: ['handle','qr','nfc'],
      nfc_payments: true, qr_payments: true,
      crypto_allowed: !isEU,
      cultural_events: [],
      emergency_alerts: true,
    },
    payments: [],
    compliance: isEU
      ? { data_retention_days: 30, real_name_required: false, content_filtering: false, gdpr_applies: true, right_to_be_forgotten: true, minor_protection: true, notes: 'GDPR + MiCAR. Data plane: eu. 30-day retention max.' }
      : { data_retention_days: 0, real_name_required: false, content_filtering: false, minor_protection: true },
    ...DEFAULTS,
    maps_tile_server: 'https://tiles.circle.app',
    models_source: 'huggingface',
    blocked_domains: [],
    ...opts,
  } as RegionConfig
}

// ──────────────────────────────────────────────────────────────────────────
// Country configurations (Blueprint v12.0 §3 — 20 priority regions)
// ──────────────────────────────────────────────────────────────────────────
export function configFor(country: string): RegionConfig {
  const c = (country || 'EG').toUpperCase()

  switch (c) {
    // ─── MENA ─────────────────────────────────────────────────────────────
    case 'EG': return {
      country: 'EG', country_name: 'Egypt', region: 'global',
      language: { default: 'ar', fallback: 'en', rtl: true },
      currency: 'EGP',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: true,
        payment_methods: ['instapay','vodafone_cash','orange_money','etisalat_cash','we_pay','fawry','meeza','visa_master'],
        nfc_payments: true, qr_payments: true,
        crypto_allowed: false,
        cultural_events: ['ramadan','eid_fitr','eid_adha','coptic_christmas'],
        emergency_alerts: true,
      },
      payments: EGYPT_PAYMENTS,
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false, minor_protection: true, crypto_prohibited: true,
                    notes: 'CBE-compliant. Local fiat only. Child Protection Law + Personal Data Protection Law 151/2020.' },
      ...DEFAULTS,
      maps_tile_server: 'https://tiles.circle.eg',
      models_source: 'huggingface',
      blocked_domains: [],
    }

    case 'SA': return {
      country: 'SA', country_name: 'Saudi Arabia', region: 'global',
      language: { default: 'ar', fallback: 'en', rtl: true },
      currency: 'SAR',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['mada','stc_pay','sarie','apple_pay','tabby','handle'],
        nfc_payments: true, qr_payments: true,
        crypto_allowed: false,
        cultural_events: ['ramadan','eid_fitr','eid_adha','national_day'],
        emergency_alerts: true,
      },
      payments: [
        { id: 'mada',      label: 'Mada',     category: 'card',    qr_supported: true,  min: 1, max: 200000, fee_pct: 0.5, currency: 'SAR', provider: 'paymob', icon: '💳' },
        { id: 'stc_pay',   label: 'STC Pay',  category: 'wallet',  deeplink_scheme: 'stcpay://pay', qr_supported: true, min: 1, max: 100000, fee_pct: 0, currency: 'SAR', icon: '🟢' },
        { id: 'sarie',     label: 'Sarie',    category: 'instant', qr_supported: true,  min: 1, max: 250000, fee_pct: 0,   currency: 'SAR', icon: '⚡' },
        { id: 'apple_pay', label: 'Apple Pay',category: 'wallet',  qr_supported: false, min: 1, max: 100000, fee_pct: 1.5, currency: 'SAR', icon: '🍎' },
        { id: 'tabby',     label: 'Tabby (BNPL)', category: 'instant', qr_supported: false, min: 50, max: 10000, fee_pct: 0, currency: 'SAR', icon: '🪪' },
      ],
      compliance: { data_retention_days: 30, real_name_required: true, content_filtering: false, minor_protection: true,
                    notes: 'SAMA regulatory sandbox. Personal Data Protection Law 2023.' },
      ...DEFAULTS,
      maps_tile_server: 'https://tiles.circle.sa',
      models_source: 'huggingface',
      blocked_domains: [],
    }

    case 'AE': return {
      country: 'AE', country_name: 'United Arab Emirates', region: 'global',
      language: { default: 'ar', fallback: 'en', rtl: true },
      currency: 'AED',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['aani','uaepay','apple_pay','usdc','usdt','handle'],
        nfc_payments: true, qr_payments: true,
        crypto_allowed: true,
        cultural_events: ['ramadan','eid_fitr','national_day'],
        emergency_alerts: true,
      },
      payments: [
        { id: 'aani',      label: 'Aani (instant)', category: 'instant', deeplink_scheme: 'aani://pay', qr_supported: true,  min: 1, max: 50000, fee_pct: 0,   currency: 'AED', icon: '⚡' },
        { id: 'uaepay',    label: 'UAEPAY',         category: 'instant', qr_supported: true,  min: 1, max: 50000, fee_pct: 0,   currency: 'AED', icon: '🇦🇪' },
        { id: 'apple_pay', label: 'Apple Pay',      category: 'wallet',  qr_supported: false, min: 1, max: 50000, fee_pct: 1.5, currency: 'AED', icon: '🍎' },
        { id: 'usdc',      label: 'USDC',           category: 'crypto',  qr_supported: true,  min: 1, max: 100000,fee_pct: 0.1, currency: 'USD', icon: '🔵' },
        { id: 'usdt',      label: 'USDT',           category: 'crypto',  qr_supported: true,  min: 1, max: 100000,fee_pct: 0.1, currency: 'USD', icon: '🟢' },
      ],
      compliance: { data_retention_days: 30, real_name_required: true, content_filtering: false, minor_protection: true,
                    notes: 'VARA + CBUAE. USDC/USDT accepted at major merchants.' },
      ...DEFAULTS,
      maps_tile_server: 'https://tiles.circle.ae',
      models_source: 'huggingface',
      blocked_domains: [],
    }

    // ─── ASIA ─────────────────────────────────────────────────────────────
    case 'IN': return {
      country: 'IN', country_name: 'India', region: 'global',
      language: { default: 'en', fallback: 'en', rtl: false },
      currency: 'INR',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['upi','rupay','digital_rupee','handle'],
        nfc_payments: true, qr_payments: true,
        crypto_allowed: false,
        cultural_events: ['diwali','holi','eid_fitr','republic_day'],
        emergency_alerts: true,
      },
      payments: [
        { id: 'upi',           label: 'UPI (Paytm · PhonePe · GPay)', category: 'instant', deeplink_scheme: 'upi://pay', qr_supported: true, min: 1, max: 100000, fee_pct: 0, currency: 'INR', icon: '⚡' },
        { id: 'rupay',         label: 'RuPay',           category: 'card',    qr_supported: true,  min: 1, max: 200000, fee_pct: 0.5, currency: 'INR', icon: '💳' },
        { id: 'digital_rupee', label: 'Digital Rupee (e₹)', category: 'instant', qr_supported: true, min: 1, max: 200000, fee_pct: 0, currency: 'INR', icon: '🇮🇳' },
      ],
      compliance: { data_retention_days: 180, real_name_required: true, content_filtering: false, minor_protection: true,
                    notes: 'RBI compliance. UPI primary. DPDP Act 2023.' },
      ...DEFAULTS,
      maps_tile_server: 'https://tiles.circle.app',
      models_source: 'huggingface',
      blocked_domains: [],
    }

    case 'CN': return {
      country: 'CN', country_name: 'China', region: 'china',
      language: { default: 'zh', fallback: 'en', rtl: false },
      currency: 'CNY',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['wechat_pay','alipay','unionpay','dcep_yuan'],
        nfc_payments: true, qr_payments: true,
        crypto_allowed: false,
        cultural_events: ['spring_festival','golden_week','mooncake'],
        emergency_alerts: true,
      },
      payments: [
        { id: 'wechat_pay', label: 'WeChat Pay', category: 'wallet', deeplink_scheme: 'weixin://wxpay', qr_supported: true, min: 1, max: 200000, fee_pct: 0.6, currency: 'CNY', icon: '💚' },
        { id: 'alipay',     label: 'Alipay',     category: 'wallet', deeplink_scheme: 'alipay://platformapi', qr_supported: true, min: 1, max: 200000, fee_pct: 0.6, currency: 'CNY', icon: '🔵' },
        { id: 'unionpay',   label: 'UnionPay',   category: 'card',   qr_supported: true,  min: 1, max: 500000, fee_pct: 0.5, currency: 'CNY', icon: '💳' },
        { id: 'dcep_yuan',  label: 'Digital Yuan (e-CNY)', category: 'instant', qr_supported: true, min: 1, max: 200000, fee_pct: 0, currency: 'CNY', icon: '🇨🇳' },
      ],
      compliance: { data_retention_days: 180, real_name_required: true, content_filtering: true, minor_protection: true,
                    notes: 'ICP-filed. Real-name via CTID. No international federation.' },
      homeserver: 'matrix.circle.cn',
      peertube_instance: 'https://video.circle.cn',
      ntfy_server: 'https://push.circle.cn',
      maps_tile_server: 'https://tiles.circle.cn',
      models_source: 'modelscope',
      blocked_domains: ['google.com','meta.com','twitter.com','youtube.com','facebook.com'],
    }

    case 'ID': return baseDefault('ID', {
      country_name: 'Indonesia', currency: 'IDR',
      language: { default: 'id', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['gopay','ovo','dana','bi_fast','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['eid_fitr','independence_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'gopay',   label: 'GoPay',   category: 'wallet',  deeplink_scheme: 'gojek://gopay', qr_supported: true, min: 1000, max: 20000000, fee_pct: 0, currency: 'IDR', icon: '🟢' },
        { id: 'ovo',    label: 'OVO',      category: 'wallet',  deeplink_scheme: 'ovo://pay', qr_supported: true, min: 1000, max: 20000000, fee_pct: 0, currency: 'IDR', icon: '🟣' },
        { id: 'dana',   label: 'DANA',     category: 'wallet',  deeplink_scheme: 'dana://pay', qr_supported: true, min: 1000, max: 20000000, fee_pct: 0, currency: 'IDR', icon: '🔵' },
        { id: 'bi_fast',label: 'BI-FAST',  category: 'instant', qr_supported: true, min: 1000, max: 250000000, fee_pct: 0, currency: 'IDR', icon: '⚡' },
      ],
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'OJK + BI. IDR is only legal tender.' },
    })

    case 'VN': return {
      country: 'VN', country_name: 'Vietnam', region: 'vietnam',
      language: { default: 'vi', fallback: 'en', rtl: false },
      currency: 'VND',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['momo','zalopay','vietqr','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['tet','mid_autumn'], emergency_alerts: true,
      },
      payments: [
        { id: 'momo',    label: 'MoMo',    category: 'wallet',  deeplink_scheme: 'momo://pay', qr_supported: true, min: 1000, max: 100000000, fee_pct: 0, currency: 'VND', icon: '💗' },
        { id: 'zalopay', label: 'ZaloPay', category: 'wallet',  deeplink_scheme: 'zalopay://pay', qr_supported: true, min: 1000, max: 100000000, fee_pct: 0, currency: 'VND', icon: '🔷' },
        { id: 'vietqr',  label: 'VietQR',  category: 'instant', qr_supported: true, min: 1000, max: 500000000, fee_pct: 0, currency: 'VND', icon: '⚡' },
      ],
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: true, minor_protection: true,
                    notes: 'Crypto allowed only in Da Nang / HCMC IFC sandbox.' },
      ...DEFAULTS,
      maps_tile_server: 'https://tiles.circle.vn',
      models_source: 'huggingface',
      blocked_domains: [],
    }

    case 'PH': return baseDefault('PH', {
      country_name: 'Philippines', currency: 'PHP',
      language: { default: 'en', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['gcash','maya','qrph','usdc','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['christmas','holy_week'], emergency_alerts: true,
      },
      payments: [
        { id: 'gcash', label: 'GCash', category: 'wallet',  deeplink_scheme: 'gcash://pay', qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'PHP', icon: '🔵' },
        { id: 'maya',  label: 'Maya',  category: 'wallet',  deeplink_scheme: 'maya://pay',  qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'PHP', icon: '🟢' },
        { id: 'qrph',  label: 'QR Ph', category: 'instant', qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'PHP', icon: '⚡' },
        { id: 'usdc',  label: 'USDC',  category: 'crypto',  qr_supported: true, min: 1, max: 200000, fee_pct: 0.1, currency: 'USD', icon: '🔵' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'BSP Circular 1109. PESONet + InstaPay.' },
    })

    case 'TH': return baseDefault('TH', {
      country_name: 'Thailand', currency: 'THB',
      language: { default: 'th', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['promptpay','truemoney','cbdc_baht','usdc','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['songkran','loy_krathong'], emergency_alerts: true,
      },
      payments: [
        { id: 'promptpay',  label: 'PromptPay', category: 'instant', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'THB', icon: '⚡' },
        { id: 'truemoney',  label: 'TrueMoney', category: 'wallet',  deeplink_scheme: 'truemoney://pay', qr_supported: true, min: 1, max: 200000, fee_pct: 0, currency: 'THB', icon: '🔴' },
        { id: 'cbdc_baht',  label: 'CBDC Baht', category: 'instant', qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'THB', icon: '🇹🇭' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'SEC approved USDC/USDT.' },
    })

    // ─── AMERICAS ─────────────────────────────────────────────────────────
    case 'BR': return baseDefault('BR', {
      country_name: 'Brazil', currency: 'BRL',
      language: { default: 'pt', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['pix','picpay','mercadopago','usdt','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['carnival','festa_junina'], emergency_alerts: true,
      },
      payments: [
        { id: 'pix',         label: 'Pix',         category: 'instant', qr_supported: true, min: 0.01, max: 100000, fee_pct: 0, currency: 'BRL', icon: '⚡' },
        { id: 'picpay',      label: 'PicPay',      category: 'wallet',  deeplink_scheme: 'picpay://pay', qr_supported: true, min: 1, max: 50000, fee_pct: 0, currency: 'BRL', icon: '💚' },
        { id: 'mercadopago', label: 'Mercado Pago',category: 'wallet',  qr_supported: true, min: 1, max: 50000, fee_pct: 0, currency: 'BRL', icon: '💛' },
        { id: 'usdt',        label: 'USDT',        category: 'crypto',  qr_supported: true, min: 1, max: 100000, fee_pct: 0.1, currency: 'USD', icon: '🟢' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'BCB Resolution 521. LGPD.' },
    })

    case 'MX': return baseDefault('MX', {
      country_name: 'Mexico', currency: 'MXN',
      language: { default: 'es', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['codi','spei','mmxn','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['dia_de_muertos','independence_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'codi', label: 'CoDi (BdM)', category: 'instant', qr_supported: true, min: 1, max: 12000, fee_pct: 0, currency: 'MXN', icon: '⚡' },
        { id: 'spei', label: 'SPEI',       category: 'instant', qr_supported: false, min: 1, max: 8000000, fee_pct: 0, currency: 'MXN', icon: '🏦' },
        { id: 'mmxn', label: 'MMXN (stable)', category: 'crypto', qr_supported: true, min: 1, max: 500000, fee_pct: 0.1, currency: 'MXN', icon: '🪙' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'Remittance focus. BdM-supervised.' },
    })

    case 'AR': return baseDefault('AR', {
      country_name: 'Argentina', currency: 'ARS',
      language: { default: 'es', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['mercadopago','uala','transferencias3','usdt','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: [], emergency_alerts: true,
      },
      payments: [
        { id: 'mercadopago',     label: 'Mercado Pago', category: 'wallet', qr_supported: true, min: 1, max: 5000000, fee_pct: 0, currency: 'ARS', icon: '💛' },
        { id: 'uala',            label: 'Ualá',         category: 'wallet', qr_supported: true, min: 1, max: 5000000, fee_pct: 0, currency: 'ARS', icon: '🟣' },
        { id: 'transferencias3', label: 'Transferencias 3.0', category: 'instant', qr_supported: true, min: 1, max: 10000000, fee_pct: 0, currency: 'ARS', icon: '⚡' },
        { id: 'usdt',            label: 'USDT',         category: 'crypto', qr_supported: true, min: 1, max: 1000000, fee_pct: 0.1, currency: 'USD', icon: '🟢' },
      ],
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'Bank crypto services 2026.' },
    })

    case 'US': return baseDefault('US', {
      country_name: 'United States', currency: 'USD',
      language: { default: 'en', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['stripe','apple_pay','cashapp','venmo','moonpay_usdc','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['independence_day','thanksgiving'], emergency_alerts: true,
      },
      payments: [
        { id: 'stripe',       label: 'Card (Stripe)',  category: 'card',   qr_supported: false, min: 1, max: 999999, fee_pct: 2.9, currency: 'USD', icon: '💳' },
        { id: 'apple_pay',    label: 'Apple Pay',      category: 'wallet', qr_supported: false, min: 1, max: 999999, fee_pct: 1.5, currency: 'USD', icon: '🍎' },
        { id: 'cashapp',      label: 'Cash App',       category: 'wallet', deeplink_scheme: 'cashme://pay', qr_supported: true, min: 1, max: 7500, fee_pct: 0, currency: 'USD', icon: '💵' },
        { id: 'venmo',        label: 'Venmo',          category: 'wallet', deeplink_scheme: 'venmo://pay', qr_supported: true, min: 1, max: 4999, fee_pct: 0, currency: 'USD', icon: '💙' },
        { id: 'moonpay_usdc', label: 'USDC (MoonPay)', category: 'crypto', qr_supported: true, min: 1, max: 50000, fee_pct: 0.5, currency: 'USD', icon: '🔵' },
      ],
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false, minor_protection: true, notes: 'Federal stablecoin legislation compliant.' },
    })

    // ─── EUROPE ─────────────────────────────────────────────────────────
    case 'GB':
    case 'UK': return baseDefault('UK', {
      country_name: 'United Kingdom', currency: 'GBP',
      language: { default: 'en', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['faster_payments','open_banking','digital_pound','apple_pay','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['christmas'], emergency_alerts: true,
      },
      payments: [
        { id: 'faster_payments',label: 'Faster Payments', category: 'instant', qr_supported: false, min: 1, max: 1000000, fee_pct: 0, currency: 'GBP', icon: '⚡' },
        { id: 'open_banking',   label: 'Open Banking',    category: 'instant', qr_supported: true,  min: 1, max: 1000000, fee_pct: 0, currency: 'GBP', icon: '🏦' },
        { id: 'digital_pound',  label: 'Digital £ (pilot)', category: 'instant', qr_supported: true, min: 1, max: 5000, fee_pct: 0, currency: 'GBP', icon: '🇬🇧' },
        { id: 'apple_pay',      label: 'Apple Pay',       category: 'wallet',  qr_supported: false, min: 1, max: 100000, fee_pct: 1.5, currency: 'GBP', icon: '🍎' },
      ],
      compliance: { data_retention_days: 30, real_name_required: false, content_filtering: false, gdpr_applies: true, right_to_be_forgotten: true, minor_protection: true, notes: 'FCA Digital Securities Regulation.' },
    })

    case 'DE':
    case 'FR':
    case 'ES':
    case 'IT':
    case 'NL':
    case 'PT': {
      const names: Record<string,[string,string,string]> = {
        DE: ['Germany','de','€'], FR: ['France','fr','€'], ES: ['Spain','es','€'],
        IT: ['Italy','it','€'], NL: ['Netherlands','nl','€'], PT: ['Portugal','pt','€']
      }
      const [name, lang] = names[c]
      return baseDefault(c, {
        country_name: name, currency: 'EUR',
        language: { default: lang, fallback: 'en', rtl: false },
        features: {
          voip_calling: true, local_mesh: true, screenshot_protection: true,
          anonymous_posting: false,
          payment_methods: ['sepa_instant','wero','paypal','usdc_mica','handle'],
          nfc_payments: true, qr_payments: true, crypto_allowed: true,
          cultural_events: ['christmas'], emergency_alerts: true,
        },
        payments: [
          { id: 'sepa_instant', label: 'SEPA Instant', category: 'instant', qr_supported: true,  min: 0.01, max: 100000, fee_pct: 0, currency: 'EUR', icon: '⚡' },
          { id: 'wero',         label: 'Wero',         category: 'wallet',  deeplink_scheme: 'wero://pay', qr_supported: true, min: 1, max: 50000, fee_pct: 0, currency: 'EUR', icon: '💶' },
          { id: 'paypal',       label: 'PayPal',       category: 'wallet',  qr_supported: true,  min: 1, max: 10000, fee_pct: 1.5, currency: 'EUR', icon: '💙' },
          { id: 'usdc_mica',    label: 'USDC (MiCAR)', category: 'crypto',  qr_supported: true,  min: 1, max: 50000, fee_pct: 0.1, currency: 'USD', icon: '🔵' },
        ],
      })
    }

    // ─── EUROPE — Russia plane ──────────────────────────────────────────
    case 'RU': return {
      country: 'RU', country_name: 'Russia', region: 'russia',
      language: { default: 'ru', fallback: 'en', rtl: false },
      currency: 'RUB',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['mir','sbp','digital_ruble','handle'],
        nfc_payments: false, qr_payments: true, crypto_allowed: false,
        cultural_events: ['orthodox_christmas','victory_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'mir',           label: 'Mir',            category: 'card',    qr_supported: true,  min: 1, max: 1000000, fee_pct: 0.5, currency: 'RUB', icon: '💳' },
        { id: 'sbp',           label: 'SBP',            category: 'instant', qr_supported: true,  min: 1, max: 1000000, fee_pct: 0,   currency: 'RUB', icon: '⚡' },
        { id: 'digital_ruble', label: 'Digital Ruble',  category: 'instant', qr_supported: true,  min: 1, max: 1000000, fee_pct: 0,   currency: 'RUB', icon: '🇷🇺' },
      ],
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'Yandex Cloud. Roskomnadzor filters.' },
      homeserver: 'matrix.circle.ru',
      peertube_instance: 'https://video.circle.ru',
      ntfy_server: 'https://push.circle.ru',
      maps_tile_server: 'https://tiles.circle.ru',
      models_source: 'yandex',
      blocked_domains: [],
    }

    case 'TR': return baseDefault('TR', {
      country_name: 'Türkiye', currency: 'TRY',
      language: { default: 'tr', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['papara','ininal','fast','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['ramadan','eid_fitr'], emergency_alerts: true,
      },
      payments: [
        { id: 'papara', label: 'Papara', category: 'wallet',  deeplink_scheme: 'papara://pay', qr_supported: true, min: 1, max: 100000, fee_pct: 0, currency: 'TRY', icon: '🟢' },
        { id: 'ininal', label: 'İninal', category: 'wallet',  qr_supported: true, min: 1, max: 100000, fee_pct: 0, currency: 'TRY', icon: '🟡' },
        { id: 'fast',   label: 'FAST',   category: 'instant', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'TRY', icon: '⚡' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, crypto_prohibited: true, notes: 'CBRT crypto payments prohibited.' },
    })

    // ─── AFRICA ─────────────────────────────────────────────────────────
    case 'NG': return baseDefault('NG', {
      country_name: 'Nigeria', currency: 'NGN',
      language: { default: 'en', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['enaira','paga','opay','cngn','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['eid_fitr','christmas'], emergency_alerts: true,
      },
      payments: [
        { id: 'enaira', label: 'eNaira (CBDC)', category: 'instant', qr_supported: true, min: 1, max: 5000000, fee_pct: 0, currency: 'NGN', icon: '🇳🇬' },
        { id: 'paga',   label: 'Paga',          category: 'wallet',  deeplink_scheme: 'paga://pay', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'NGN', icon: '🟢' },
        { id: 'opay',   label: 'OPay',          category: 'wallet',  deeplink_scheme: 'opay://pay', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'NGN', icon: '💚' },
        { id: 'cngn',   label: 'cNGN (stable)', category: 'crypto',  qr_supported: true, min: 1, max: 5000000, fee_pct: 0.1, currency: 'NGN', icon: '🟢' },
      ],
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'CBN AML supervision.' },
    })

    case 'ZA': return baseDefault('ZA', {
      country_name: 'South Africa', currency: 'ZAR',
      language: { default: 'en', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['payshap','snapscan','zapper','zarp','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['heritage_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'payshap',  label: 'PayShap',  category: 'instant', qr_supported: true, min: 1, max: 3000, fee_pct: 0, currency: 'ZAR', icon: '⚡' },
        { id: 'snapscan', label: 'SnapScan', category: 'wallet',  deeplink_scheme: 'snapscan://pay', qr_supported: true, min: 1, max: 50000, fee_pct: 0, currency: 'ZAR', icon: '📷' },
        { id: 'zapper',   label: 'Zapper',   category: 'wallet',  qr_supported: true, min: 1, max: 50000, fee_pct: 0, currency: 'ZAR', icon: '⚡' },
        { id: 'zarp',     label: 'ZARP (stable)', category: 'crypto', qr_supported: true, min: 1, max: 500000, fee_pct: 0.1, currency: 'ZAR', icon: '🟢' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'FSCA regulated.' },
    })

    // ─── MENA — secondary (default to global plane, Arabic preferred) ────
    case 'QA':
    case 'KW':
    case 'BH':
    case 'OM':
    case 'JO':
    case 'LB':
    case 'TN':
    case 'MA':
    case 'DZ':
    case 'IQ':
    case 'PS':
    case 'YE':
    case 'SD':
    case 'LY':
    case 'SY': {
      const names: Record<string, [string,string]> = {
        QA:['Qatar','QAR'], KW:['Kuwait','KWD'], BH:['Bahrain','BHD'], OM:['Oman','OMR'],
        JO:['Jordan','JOD'], LB:['Lebanon','LBP'], TN:['Tunisia','TND'], MA:['Morocco','MAD'],
        DZ:['Algeria','DZD'], IQ:['Iraq','IQD'], PS:['Palestine','ILS'], YE:['Yemen','YER'],
        SD:['Sudan','SDG'], LY:['Libya','LYD'], SY:['Syria','SYP'],
      }
      const [name, ccy] = names[c]
      return baseDefault(c, {
        country_name: name, currency: ccy,
        language: { default: 'ar', fallback: 'en', rtl: true },
        features: {
          voip_calling: true, local_mesh: true, screenshot_protection: true,
          anonymous_posting: true,
          payment_methods: ['handle','qr','nfc'],
          nfc_payments: true, qr_payments: true, crypto_allowed: false,
          cultural_events: ['ramadan','eid_fitr'], emergency_alerts: true,
        },
        payments: [
          { id: 'handle', label: 'Send by @handle', category: 'instant', qr_supported: false, min: 1, max: 50000, fee_pct: 0, currency: ccy, icon: '🤝' },
          { id: 'qr',     label: 'QR pay',          category: 'instant', qr_supported: true,  min: 1, max: 50000, fee_pct: 0, currency: ccy, icon: '⬚' },
          { id: 'nfc',    label: 'NFC tap',         category: 'instant', qr_supported: false, min: 1, max: 5000,  fee_pct: 0, currency: ccy, icon: '📡' },
        ],
        compliance: { data_retention_days: 30, real_name_required: false, content_filtering: false, minor_protection: true },
      })
    }

    case 'IR': return {
      country: 'IR', country_name: 'Iran', region: 'iran',
      language: { default: 'fa', fallback: 'ar', rtl: true },
      currency: 'IRR',
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: true,
        payment_methods: ['shetab','shaparak','handle'],
        nfc_payments: false, qr_payments: true, crypto_allowed: false,
        cultural_events: ['nowruz','ramadan'], emergency_alerts: true,
      },
      payments: [
        { id: 'shetab',   label: 'Shetab (instant)', category: 'instant', qr_supported: true, min: 1, max: 500000000, fee_pct: 0, currency: 'IRR', icon: '⚡' },
        { id: 'shaparak', label: 'Shaparak',         category: 'card',    qr_supported: true, min: 1, max: 500000000, fee_pct: 0, currency: 'IRR', icon: '💳' },
      ],
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: true, minor_protection: true, notes: 'Sanctions-compliant. No international federation.' },
      homeserver: 'matrix.circle.ir',
      peertube_instance: 'https://video.circle.ir',
      ntfy_server: 'https://push.circle.ir',
      maps_tile_server: 'https://tiles.circle.ir',
      models_source: 'huggingface',
      blocked_domains: [],
    }

    default: {
      return baseDefault(c, { country_name: c })
    }
  }
}

// Quick map for country picker UI (flag + label)
export const KNOWN_COUNTRIES: Array<{ code: string; name: string; flag: string }> = [
  // MENA
  { code: 'EG', name: 'Egypt',         flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia',  flag: '🇸🇦' },
  { code: 'AE', name: 'UAE',           flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar',         flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait',        flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain',       flag: '🇧🇭' },
  { code: 'OM', name: 'Oman',          flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan',        flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon',       flag: '🇱🇧' },
  { code: 'TN', name: 'Tunisia',       flag: '🇹🇳' },
  { code: 'MA', name: 'Morocco',       flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria',       flag: '🇩🇿' },
  { code: 'IQ', name: 'Iraq',          flag: '🇮🇶' },
  { code: 'PS', name: 'Palestine',     flag: '🇵🇸' },
  { code: 'SY', name: 'Syria',         flag: '🇸🇾' },
  { code: 'YE', name: 'Yemen',         flag: '🇾🇪' },
  { code: 'SD', name: 'Sudan',         flag: '🇸🇩' },
  { code: 'LY', name: 'Libya',         flag: '🇱🇾' },
  { code: 'IR', name: 'Iran',          flag: '🇮🇷' },
  // Asia
  { code: 'IN', name: 'India',         flag: '🇮🇳' },
  { code: 'CN', name: 'China',         flag: '🇨🇳' },
  { code: 'ID', name: 'Indonesia',     flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam',       flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines',   flag: '🇵🇭' },
  { code: 'TH', name: 'Thailand',      flag: '🇹🇭' },
  { code: 'PK', name: 'Pakistan',      flag: '🇵🇰' },
  { code: 'JP', name: 'Japan',         flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea',   flag: '🇰🇷' },
  // Americas
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'BR', name: 'Brazil',        flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico',        flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina',     flag: '🇦🇷' },
  // Europe
  { code: 'UK', name: 'United Kingdom',flag: '🇬🇧' },
  { code: 'DE', name: 'Germany',       flag: '🇩🇪' },
  { code: 'FR', name: 'France',        flag: '🇫🇷' },
  { code: 'ES', name: 'Spain',         flag: '🇪🇸' },
  { code: 'IT', name: 'Italy',         flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands',   flag: '🇳🇱' },
  { code: 'PT', name: 'Portugal',      flag: '🇵🇹' },
  { code: 'RU', name: 'Russia',        flag: '🇷🇺' },
  { code: 'TR', name: 'Türkiye',       flag: '🇹🇷' },
  // Africa
  { code: 'NG', name: 'Nigeria',       flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa',  flag: '🇿🇦' },
]
