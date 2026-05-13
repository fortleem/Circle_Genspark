// Circle — Dynamic Regional Engine (DRE)
// Per blueprint §4: six data planes, instant compliance, no app update needed.

export type DataPlane = 'global' | 'china' | 'russia' | 'iran' | 'vietnam' | 'eu'

export interface RegionConfig {
  country: string
  region: DataPlane
  language: {
    default: string
    fallback: string
    rtl: boolean
  }
  features: {
    voip_calling: boolean
    local_mesh: boolean
    screenshot_protection: boolean
    anonymous_posting: boolean
    payment_methods: string[]
    nfc_payments: boolean
    qr_payments: boolean
    cultural_events: string[]
    emergency_alerts: boolean
  }
  compliance: {
    data_retention_days: number
    real_name_required: boolean
    content_filtering: boolean
    gdpr_applies?: boolean
    right_to_be_forgotten?: boolean
  }
  homeserver: string
  peertube_instance: string
  ntfy_server: string
  maps_tile_server: string
  models_source: 'huggingface' | 'modelscope'
  blocked_domains: string[]
}

const EU_COUNTRIES = new Set(['DE','FR','ES','IT','NL','BE','AT','FI','SE','PL','PT','IE','GR','DK','CZ','RO','HU','BG','HR','SI','SK','EE','LV','LT','LU','MT','CY'])

export function planeFor(country: string): DataPlane {
  const c = country.toUpperCase()
  if (c === 'CN') return 'china'
  if (c === 'RU') return 'russia'
  if (c === 'IR') return 'iran'
  if (c === 'VN') return 'vietnam'
  if (EU_COUNTRIES.has(c)) return 'eu'
  return 'global'
}

export function configFor(country: string): RegionConfig {
  const c = country.toUpperCase()
  const plane = planeFor(c)

  // Per-country overlays (within the assigned plane)
  switch (c) {
    case 'EG': return {
      country: 'EG', region: 'global',
      language: { default: 'ar', fallback: 'en', rtl: true },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: true,
        payment_methods: ['fawry_voucher','vodafone_cash','instapay','handle'],
        nfc_payments: true, qr_payments: true,
        cultural_events: ['ramadan','eid'],
        emergency_alerts: true
      },
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false },
      homeserver: 'matrix.circle.app',
      peertube_instance: 'https://peertube.circle.app',
      ntfy_server: 'https://ntfy.circle.app',
      maps_tile_server: 'https://tiles.circle.eg',
      models_source: 'huggingface',
      blocked_domains: []
    }
    case 'SA': return {
      country: 'SA', region: 'global',
      language: { default: 'ar', fallback: 'en', rtl: true },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['mada','stc_pay','tabby','apple_pay','handle'],
        nfc_payments: true, qr_payments: true,
        cultural_events: ['ramadan','eid','national_day'],
        emergency_alerts: true
      },
      compliance: { data_retention_days: 30, real_name_required: true, content_filtering: false },
      homeserver: 'matrix.circle.app',
      peertube_instance: 'https://peertube.circle.app',
      ntfy_server: 'https://ntfy.circle.app',
      maps_tile_server: 'https://tiles.circle.sa',
      models_source: 'huggingface',
      blocked_domains: []
    }
    case 'CN': return {
      country: 'CN', region: 'china',
      language: { default: 'zh', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['wechat_pay','alipay','unionpay'],
        nfc_payments: true, qr_payments: true,
        cultural_events: ['spring_festival','mid_autumn'],
        emergency_alerts: true
      },
      compliance: { data_retention_days: 180, real_name_required: true, content_filtering: true },
      homeserver: 'matrix.circle.cn',
      peertube_instance: 'https://peertube.circle.cn',
      ntfy_server: 'https://ntfy.circle.cn',
      maps_tile_server: 'https://tiles.circle.cn',
      models_source: 'modelscope',
      blocked_domains: ['facebook.com','twitter.com','youtube.com','instagram.com']
    }
    case 'DE': case 'FR': case 'ES': case 'IT': case 'NL': case 'BE': case 'AT': case 'PL': case 'SE': case 'FI': return {
      country: c, region: 'eu',
      language: {
        default: c === 'DE' ? 'de' : c === 'FR' ? 'fr' : c === 'ES' ? 'es' : c === 'IT' ? 'it' : 'en',
        fallback: 'en', rtl: false
      },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: true,
        payment_methods: ['sepa','paypal','giropay','klarna','handle'],
        nfc_payments: true, qr_payments: false,
        cultural_events: c === 'DE' ? ['oktoberfest','christmas_markets'] : ['christmas_markets'],
        emergency_alerts: true
      },
      compliance: {
        data_retention_days: 30, real_name_required: false, content_filtering: false,
        gdpr_applies: true, right_to_be_forgotten: true
      },
      homeserver: 'matrix.circle.eu',
      peertube_instance: 'https://peertube.circle.eu',
      ntfy_server: 'https://ntfy.circle.eu',
      maps_tile_server: 'https://tiles.circle.eu',
      models_source: 'huggingface',
      blocked_domains: []
    }
    case 'RU': return {
      country: 'RU', region: 'russia',
      language: { default: 'en', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['mir','sbp','handle'],
        nfc_payments: true, qr_payments: true,
        cultural_events: ['victory_day','new_year'],
        emergency_alerts: true
      },
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: true },
      homeserver: 'matrix.circle.ru',
      peertube_instance: 'https://peertube.circle.ru',
      ntfy_server: 'https://ntfy.circle.ru',
      maps_tile_server: 'https://tiles.circle.ru',
      models_source: 'huggingface',
      blocked_domains: []
    }
    case 'IR': return {
      country: 'IR', region: 'iran',
      language: { default: 'en', fallback: 'en', rtl: true },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: true,
        payment_methods: ['shetab','handle'],
        nfc_payments: false, qr_payments: true,
        cultural_events: ['nowruz'],
        emergency_alerts: true
      },
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false },
      homeserver: 'matrix.circle.ir',
      peertube_instance: 'https://peertube.circle.ir',
      ntfy_server: 'https://ntfy.circle.ir',
      maps_tile_server: 'https://tiles.circle.ir',
      models_source: 'huggingface',
      blocked_domains: []
    }
    case 'US': return {
      country: 'US', region: 'global',
      language: { default: 'en', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: true,
        payment_methods: ['ach','venmo','cashapp','apple_pay','handle'],
        nfc_payments: true, qr_payments: true,
        cultural_events: ['thanksgiving','independence_day'],
        emergency_alerts: true
      },
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false },
      homeserver: 'matrix.circle.app',
      peertube_instance: 'https://peertube.circle.app',
      ntfy_server: 'https://ntfy.circle.app',
      maps_tile_server: 'https://tiles.circle.app',
      models_source: 'huggingface',
      blocked_domains: []
    }
    default:
      // Generic global default
      return {
        country: c || 'XX', region: plane,
        language: { default: 'en', fallback: 'en', rtl: false },
        features: {
          voip_calling: true, local_mesh: true, screenshot_protection: true,
          anonymous_posting: true,
          payment_methods: ['handle'],
          nfc_payments: true, qr_payments: true,
          cultural_events: [],
          emergency_alerts: true
        },
        compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false },
        homeserver: 'matrix.circle.app',
        peertube_instance: 'https://peertube.circle.app',
        ntfy_server: 'https://ntfy.circle.app',
        maps_tile_server: 'https://tiles.circle.app',
        models_source: 'huggingface',
        blocked_domains: []
      }
  }
}

export const KNOWN_COUNTRIES = ['EG','SA','CN','DE','FR','ES','IT','RU','IR','US','VN']
