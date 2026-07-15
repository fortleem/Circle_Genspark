// Cirkle — Dynamic Regional Engine (DRE)
// Per Blueprint v12.0 §3: six data planes, instant compliance, no app update needed.
// Every node (payment rails, content rules, language, homeserver, transport, emergency, news) depends on country.

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

export interface EmergencyNumbers {
  police: string
  ambulance: string
  fire: string
  general?: string
}

export interface NewsSource {
  name: string
  url: string
  lang: string
  kind: 'rss' | 'public_feed' | 'trusted'
}

export interface Transportation {
  ride_hail: string[]              // e.g. ['uber','careem','inDriver']
  transit_app: string[]              // e.g. ['google_transit','citymapper']
  bike_scooter: string[]             // e.g. ['lime','bird']
  car_rental: string[]               // e.g. ['hertz','sixt','europcar']
  domestic_rail: string[]            // e.g. ['enr','sncf']
  domestic_air: string[]             // e.g. ['egyptair','airfrance']
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
  // v12.0 additions: transportation, emergency numbers, news sources
  transportation: Transportation
  emergencyNumbers: EmergencyNumbers
  newsSources: NewsSource[]
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
  homeserver: 'matrix.cirkle.app',
  peertube_instance: 'https://peertube.cirkle.app',
  ntfy_server: 'https://ntfy.cirkle.app',
  maps_tile_server: 'https://tiles.openstreetmap.org/{z}/{x}/{y}.png',
}

// ─── Country metadata table (214 countries + ISO codes + currencies + languages + flags) ───
const ALL_214: Array<[string, string, string, string, string, boolean, string]> = [
  // code, name, currency, default language, fallback language, rtl, flag
  ['AF','Afghanistan','AFN','fa','en',true,'🇦🇫'],
  ['AX','Åland Islands','EUR','sv','en',false,'🇦🇽'],
  ['AL','Albania','ALL','sq','en',false,'🇦🇱'],
  ['DZ','Algeria','DZD','ar','fr',true,'🇩🇿'],
  ['AS','American Samoa','USD','en','en',false,'🇦🇸'],
  ['AD','Andorra','EUR','ca','es',false,'🇦🇩'],
  ['AO','Angola','AOA','pt','en',false,'🇦🇴'],
  ['AI','Anguilla','XCD','en','en',false,'🇦🇮'],
  ['AQ','Antarctica','USD','en','en',false,'🇦🇶'],
  ['AG','Antigua and Barbuda','XCD','en','en',false,'🇦🇬'],
  ['AR','Argentina','ARS','es','en',false,'🇦🇷'],
  ['AM','Armenia','AMD','hy','ru',false,'🇦🇲'],
  ['AW','Aruba','AWG','nl','en',false,'🇦🇼'],
  ['AU','Australia','AUD','en','en',false,'🇦🇺'],
  ['AT','Austria','EUR','de','en',false,'🇦🇹'],
  ['AZ','Azerbaijan','AZN','az','ru',false,'🇦🇿'],
  ['BS','Bahamas','BSD','en','en',false,'🇧🇸'],
  ['BH','Bahrain','BHD','ar','en',true,'🇧🇭'],
  ['BD','Bangladesh','BDT','bn','en',false,'🇧🇩'],
  ['BB','Barbados','BBD','en','en',false,'🇧🇧'],
  ['BY','Belarus','BYN','be','ru',false,'🇧🇾'],
  ['BE','Belgium','EUR','nl','fr',false,'🇧🇪'],
  ['BZ','Belize','BZD','en','es',false,'🇧🇿'],
  ['BJ','Benin','XOF','fr','en',false,'🇧🇯'],
  ['BM','Bermuda','BMD','en','en',false,'🇧🇲'],
  ['BT','Bhutan','BTN','dz','en',false,'🇧🇹'],
  ['BO','Bolivia','BOB','es','en',false,'🇧🇴'],
  ['BQ','Bonaire, Sint Eustatius and Saba','USD','nl','en',false,'🇧🇶'],
  ['BA','Bosnia and Herzegovina','BAM','bs','en',false,'🇧🇦'],
  ['BW','Botswana','BWP','en','en',false,'🇧🇼'],
  ['BV','Bouvet Island','NOK','no','en',false,'🇧🇻'],
  ['BR','Brazil','BRL','pt','en',false,'🇧🇷'],
  ['IO','British Indian Ocean Territory','USD','en','en',false,'🇮🇴'],
  ['BN','Brunei Darussalam','BND','ms','en',false,'🇧🇳'],
  ['BG','Bulgaria','BGN','bg','en',false,'🇧🇬'],
  ['BF','Burkina Faso','XOF','fr','en',false,'🇧🇫'],
  ['BI','Burundi','BIF','fr','en',false,'🇧🇮'],
  ['CV','Cabo Verde','CVE','pt','en',false,'🇨🇻'],
  ['KH','Cambodia','KHR','km','en',false,'🇰🇭'],
  ['CM','Cameroon','XAF','fr','en',false,'🇨🇲'],
  ['CA','Canada','CAD','en','fr',false,'🇨🇦'],
  ['KY','Cayman Islands','KYD','en','en',false,'🇰🇾'],
  ['CF','Central African Republic','XAF','fr','en',false,'🇨🇫'],
  ['TD','Chad','XAF','fr','ar',false,'🇹🇩'],
  ['CL','Chile','CLP','es','en',false,'🇨🇱'],
  ['CN','China','CNY','zh','en',false,'🇨🇳'],
  ['CX','Christmas Island','AUD','en','en',false,'🇨🇽'],
  ['CC','Cocos (Keeling) Islands','AUD','en','en',false,'🇨🇨'],
  ['CO','Colombia','COP','es','en',false,'🇨🇴'],
  ['KM','Comoros','KMF','fr','ar',false,'🇰🇲'],
  ['CG','Congo','XAF','fr','en',false,'🇨🇬'],
  ['CD','Congo, Democratic Republic','CDF','fr','en',false,'🇨🇩'],
  ['CK','Cook Islands','NZD','en','en',false,'🇨🇰'],
  ['CR','Costa Rica','CRC','es','en',false,'🇨🇷'],
  ['CI','Côte d\'Ivoire','XOF','fr','en',false,'🇨🇮'],
  ['HR','Croatia','EUR','hr','en',false,'🇭🇷'],
  ['CU','Cuba','CUP','es','en',false,'🇨🇺'],
  ['CW','Curaçao','ANG','nl','en',false,'🇨🇼'],
  ['CY','Cyprus','EUR','el','en',false,'🇨🇾'],
  ['CZ','Czech Republic','CZK','cs','en',false,'🇨🇿'],
  ['DK','Denmark','DKK','da','en',false,'🇩🇰'],
  ['DJ','Djibouti','DJF','fr','ar',false,'🇩🇯'],
  ['DM','Dominica','XCD','en','en',false,'🇩🇲'],
  ['DO','Dominican Republic','DOP','es','en',false,'🇩🇴'],
  ['EC','Ecuador','USD','es','en',false,'🇪🇨'],
  ['EG','Egypt','EGP','ar','en',true,'🇪🇬'],
  ['SV','El Salvador','USD','es','en',false,'🇸🇻'],
  ['GQ','Equatorial Guinea','XAF','es','fr',false,'🇬🇶'],
  ['ER','Eritrea','ERN','ti','en',false,'🇪🇷'],
  ['EE','Estonia','EUR','et','en',false,'🇪🇪'],
  ['SZ','Eswatini','SZL','en','en',false,'🇸🇿'],
  ['ET','Ethiopia','ETB','am','en',false,'🇪🇹'],
  ['FK','Falkland Islands','FKP','en','en',false,'🇫🇰'],
  ['FO','Faroe Islands','DKK','fo','en',false,'🇫🇴'],
  ['FJ','Fiji','FJD','en','en',false,'🇫🇯'],
  ['FI','Finland','EUR','fi','en',false,'🇫🇮'],
  ['FR','France','EUR','fr','en',false,'🇫🇷'],
  ['GF','French Guiana','EUR','fr','en',false,'🇬🇫'],
  ['PF','French Polynesia','XPF','fr','en',false,'🇵🇫'],
  ['TF','French Southern Territories','EUR','fr','en',false,'🇹🇫'],
  ['GA','Gabon','XAF','fr','en',false,'🇬🇦'],
  ['GM','Gambia','GMD','en','en',false,'🇬🇲'],
  ['GE','Georgia','GEL','ka','en',false,'🇬🇪'],
  ['DE','Germany','EUR','de','en',false,'🇩🇪'],
  ['GH','Ghana','GHS','en','en',false,'🇬🇭'],
  ['GI','Gibraltar','GIP','en','en',false,'🇬🇮'],
  ['GR','Greece','EUR','el','en',false,'🇬🇷'],
  ['GL','Greenland','DKK','kl','en',false,'🇬🇱'],
  ['GD','Grenada','XCD','en','en',false,'🇬🇩'],
  ['GP','Guadeloupe','EUR','fr','en',false,'🇬🇵'],
  ['GU','Guam','USD','en','en',false,'🇬🇺'],
  ['GT','Guatemala','GTQ','es','en',false,'🇬🇹'],
  ['GG','Guernsey','GBP','en','en',false,'🇬🇬'],
  ['GN','Guinea','GNF','fr','en',false,'🇬🇳'],
  ['GW','Guinea-Bissau','XOF','pt','en',false,'🇬🇼'],
  ['GY','Guyana','GYD','en','en',false,'🇬🇾'],
  ['HT','Haiti','HTG','fr','en',false,'🇭🇹'],
  ['HM','Heard Island and McDonald Islands','AUD','en','en',false,'🇭🇲'],
  ['VA','Holy See','EUR','it','en',false,'🇻🇦'],
  ['HN','Honduras','HNL','es','en',false,'🇭🇳'],
  ['HK','Hong Kong','HKD','zh','en',false,'🇭🇰'],
  ['HU','Hungary','HUF','hu','en',false,'🇭🇺'],
  ['IS','Iceland','ISK','is','en',false,'🇮🇸'],
  ['IN','India','INR','hi','en',false,'🇮🇳'],
  ['ID','Indonesia','IDR','id','en',false,'🇮🇩'],
  ['IR','Iran','IRR','fa','ar',true,'🇮🇷'],
  ['IQ','Iraq','IQD','ar','en',true,'🇮🇶'],
  ['IE','Ireland','EUR','en','en',false,'🇮🇪'],
  ['IM','Isle of Man','GBP','en','en',false,'🇮🇲'],
  ['IL','Israel','ILS','he','en',true,'🇮🇱'],
  ['IT','Italy','EUR','it','en',false,'🇮🇹'],
  ['JM','Jamaica','JMD','en','en',false,'🇯🇲'],
  ['JP','Japan','JPY','ja','en',false,'🇯🇵'],
  ['JE','Jersey','GBP','en','en',false,'🇯🇪'],
  ['JO','Jordan','JOD','ar','en',true,'🇯🇴'],
  ['KZ','Kazakhstan','KZT','kk','ru',false,'🇰🇿'],
  ['KE','Kenya','KES','sw','en',false,'🇰🇪'],
  ['KI','Kiribati','AUD','en','en',false,'🇰🇮'],
  ['KP','Korea (DPR)','KPW','ko','en',false,'🇰🇵'],
  ['KR','Korea (Republic)','KRW','ko','en',false,'🇰🇷'],
  ['KW','Kuwait','KWD','ar','en',true,'🇰🇼'],
  ['KG','Kyrgyzstan','KGS','ky','ru',false,'🇰🇬'],
  ['LA','Laos','LAK','lo','en',false,'🇱🇦'],
  ['LV','Latvia','EUR','lv','en',false,'🇱🇻'],
  ['LB','Lebanon','LBP','ar','fr',true,'🇱🇧'],
  ['LS','Lesotho','LSL','en','en',false,'🇱🇸'],
  ['LR','Liberia','LRD','en','en',false,'🇱🇷'],
  ['LY','Libya','LYD','ar','en',true,'🇱🇾'],
  ['LI','Liechtenstein','CHF','de','en',false,'🇱🇮'],
  ['LT','Lithuania','EUR','lt','en',false,'🇱🇹'],
  ['LU','Luxembourg','EUR','lb','fr',false,'🇱🇺'],
  ['MO','Macao','MOP','zh','pt',false,'🇲🇴'],
  ['MG','Madagascar','MGA','fr','en',false,'🇲🇬'],
  ['MW','Malawi','MWK','en','en',false,'🇲🇼'],
  ['MY','Malaysia','MYR','ms','en',false,'🇲🇾'],
  ['MV','Maldives','MVR','dv','en',true,'🇲🇻'],
  ['ML','Mali','XOF','fr','en',false,'🇲🇱'],
  ['MT','Malta','EUR','mt','en',false,'🇲🇹'],
  ['MH','Marshall Islands','USD','en','en',false,'🇲🇭'],
  ['MQ','Martinique','EUR','fr','en',false,'🇲🇶'],
  ['MR','Mauritania','MRU','ar','fr',true,'🇲🇷'],
  ['MU','Mauritius','MUR','en','fr',false,'🇲🇺'],
  ['YT','Mayotte','EUR','fr','en',false,'🇾🇹'],
  ['MX','Mexico','MXN','es','en',false,'🇲🇽'],
  ['FM','Micronesia','USD','en','en',false,'🇫🇲'],
  ['MD','Moldova','MDL','ro','ru',false,'🇲🇩'],
  ['MC','Monaco','EUR','fr','en',false,'🇲🇨'],
  ['MN','Mongolia','MNT','mn','en',false,'🇲🇳'],
  ['ME','Montenegro','EUR','sr','en',false,'🇲🇪'],
  ['MS','Montserrat','XCD','en','en',false,'🇲🇸'],
  ['MA','Morocco','MAD','ar','fr',true,'🇲🇦'],
  ['MZ','Mozambique','MZN','pt','en',false,'🇲🇿'],
  ['MM','Myanmar','MMK','my','en',false,'🇲🇲'],
  ['NA','Namibia','NAD','en','en',false,'🇳🇦'],
  ['NR','Nauru','AUD','en','en',false,'🇳🇷'],
  ['NP','Nepal','NPR','ne','en',false,'🇳🇵'],
  ['NL','Netherlands','EUR','nl','en',false,'🇳🇱'],
  ['NC','New Caledonia','XPF','fr','en',false,'🇳🇨'],
  ['NZ','New Zealand','NZD','en','en',false,'🇳🇿'],
  ['NI','Nicaragua','NIO','es','en',false,'🇳🇮'],
  ['NE','Niger','XOF','fr','en',false,'🇳🇪'],
  ['NG','Nigeria','NGN','en','en',false,'🇳🇬'],
  ['NU','Niue','NZD','en','en',false,'🇳🇺'],
  ['NF','Norfolk Island','AUD','en','en',false,'🇳🇫'],
  ['MK','North Macedonia','MKD','mk','en',false,'🇲🇰'],
  ['MP','Northern Mariana Islands','USD','en','en',false,'🇲🇵'],
  ['NO','Norway','NOK','no','en',false,'🇳🇴'],
  ['OM','Oman','OMR','ar','en',true,'🇴🇲'],
  ['PK','Pakistan','PKR','ur','en',true,'🇵🇰'],
  ['PW','Palau','USD','en','en',false,'🇵🇼'],
  ['PS','Palestine','ILS','ar','en',true,'🇵🇸'],
  ['PA','Panama','PAB','es','en',false,'🇵🇦'],
  ['PG','Papua New Guinea','PGK','en','en',false,'🇵🇬'],
  ['PY','Paraguay','PYG','es','en',false,'🇵🇾'],
  ['PE','Peru','PEN','es','en',false,'🇵🇪'],
  ['PH','Philippines','PHP','tl','en',false,'🇵🇭'],
  ['PN','Pitcairn','NZD','en','en',false,'🇵🇳'],
  ['PL','Poland','PLN','pl','en',false,'🇵🇱'],
  ['PT','Portugal','EUR','pt','en',false,'🇵🇹'],
  ['PR','Puerto Rico','USD','es','en',false,'🇵🇷'],
  ['QA','Qatar','QAR','ar','en',true,'🇶🇦'],
  ['RE','Réunion','EUR','fr','en',false,'🇷🇪'],
  ['RO','Romania','RON','ro','en',false,'🇷🇴'],
  ['RU','Russia','RUB','ru','en',false,'🇷🇺'],
  ['RW','Rwanda','RWF','fr','en',false,'🇷🇼'],
  ['BL','Saint Barthélemy','EUR','fr','en',false,'🇧🇱'],
  ['SH','Saint Helena','SHP','en','en',false,'🇸🇭'],
  ['KN','Saint Kitts and Nevis','XCD','en','en',false,'🇰🇳'],
  ['LC','Saint Lucia','XCD','en','en',false,'🇱🇨'],
  ['MF','Saint Martin (French)','EUR','fr','en',false,'🇲🇫'],
  ['PM','Saint Pierre and Miquelon','EUR','fr','en',false,'🇵🇲'],
  ['VC','Saint Vincent and Grenadines','XCD','en','en',false,'🇻🇨'],
  ['WS','Samoa','WST','en','en',false,'🇼🇸'],
  ['SM','San Marino','EUR','it','en',false,'🇸🇲'],
  ['ST','Sao Tome and Principe','STN','pt','en',false,'🇸🇹'],
  ['SA','Saudi Arabia','SAR','ar','en',true,'🇸🇦'],
  ['SN','Senegal','XOF','fr','en',false,'🇸🇳'],
  ['RS','Serbia','RSD','sr','en',false,'🇷🇸'],
  ['SC','Seychelles','SCR','en','fr',false,'🇸🇨'],
  ['SL','Sierra Leone','SLE','en','en',false,'🇸🇱'],
  ['SG','Singapore','SGD','en','zh',false,'🇸🇬'],
  ['SX','Sint Maarten (Dutch)','ANG','nl','en',false,'🇸🇽'],
  ['SK','Slovakia','EUR','sk','en',false,'🇸🇰'],
  ['SI','Slovenia','EUR','sl','en',false,'🇸🇮'],
  ['SB','Solomon Islands','SBD','en','en',false,'🇸🇧'],
  ['SO','Somalia','SOS','so','ar',false,'🇸🇴'],
  ['ZA','South Africa','ZAR','en','en',false,'🇿🇦'],
  ['GS','South Georgia and Sandwich Islands','GBP','en','en',false,'🇬🇸'],
  ['SS','South Sudan','SSP','en','ar',false,'🇸🇸'],
  ['ES','Spain','EUR','es','en',false,'🇪🇸'],
  ['LK','Sri Lanka','LKR','si','en',false,'🇱🇰'],
  ['SD','Sudan','SDG','ar','en',true,'🇸🇩'],
  ['SR','Suriname','SRD','nl','en',false,'🇸🇷'],
  ['SJ','Svalbard and Jan Mayen','NOK','no','en',false,'🇸🇯'],
  ['SE','Sweden','SEK','sv','en',false,'🇸🇪'],
  ['CH','Switzerland','CHF','de','fr',false,'🇨🇭'],
  ['SY','Syria','SYP','ar','en',true,'🇸🇾'],
  ['TW','Taiwan','TWD','zh','en',false,'🇹🇼'],
  ['TJ','Tajikistan','TJS','tg','ru',false,'🇹🇯'],
  ['TZ','Tanzania','TZS','sw','en',false,'🇹🇿'],
  ['TH','Thailand','THB','th','en',false,'🇹🇭'],
  ['TL','Timor-Leste','USD','pt','en',false,'🇹🇱'],
  ['TG','Togo','XOF','fr','en',false,'🇹🇬'],
  ['TK','Tokelau','NZD','en','en',false,'🇹🇰'],
  ['TO','Tonga','TOP','en','en',false,'🇹🇴'],
  ['TT','Trinidad and Tobago','TTD','en','en',false,'🇹🇹'],
  ['TN','Tunisia','TND','ar','fr',true,'🇹🇳'],
  ['TR','Türkiye','TRY','tr','en',false,'🇹🇷'],
  ['TM','Turkmenistan','TMT','tk','ru',false,'🇹🇲'],
  ['TC','Turks and Caicos Islands','USD','en','en',false,'🇹🇨'],
  ['TV','Tuvalu','AUD','en','en',false,'🇹🇻'],
  ['UG','Uganda','UGX','en','en',false,'🇺🇬'],
  ['UA','Ukraine','UAH','uk','en',false,'🇺🇦'],
  ['AE','UAE','AED','ar','en',true,'🇦🇪'],
  ['GB','United Kingdom','GBP','en','en',false,'🇬🇧'],
  ['US','United States','USD','en','en',false,'🇺🇸'],
  ['UM','United States Minor Outlying Islands','USD','en','en',false,'🇺🇲'],
  ['UY','Uruguay','UYU','es','en',false,'🇺🇾'],
  ['UZ','Uzbekistan','UZS','uz','ru',false,'🇺🇿'],
  ['VU','Vanuatu','VUV','bi','en',false,'🇻🇺'],
  ['VE','Venezuela','VES','es','en',false,'🇻🇪'],
  ['VN','Vietnam','VND','vi','en',false,'🇻🇳'],
  ['VG','Virgin Islands (British)','USD','en','en',false,'🇻🇬'],
  ['VI','Virgin Islands (U.S.)','USD','en','en',false,'🇻🇮'],
  ['WF','Wallis and Futuna','XPF','fr','en',false,'🇼🇫'],
  ['EH','Western Sahara','MAD','ar','fr',true,'🇪🇭'],
  ['YE','Yemen','YER','ar','en',true,'🇾🇪'],
  ['ZM','Zambia','ZMW','en','en',false,'🇿🇲'],
  ['ZW','Zimbabwe','ZWL','en','en',false,'🇿🇼'],
]

// Map for fast lookup
const COUNTRY_MAP = new Map(ALL_214.map((r) => [r[0], r]))

export function knownCountry(code: string): { code: string; name: string; flag: string } | undefined {
  const r = COUNTRY_MAP.get(code.toUpperCase())
  if (!r) return undefined
  return { code: r[0], name: r[1], flag: r[6] }
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
  const meta = COUNTRY_MAP.get(c) ?? [c, c, 'USD', 'en', 'en', false, '🏳']
  const [, countryName, currency, lang, fallback, rtl] = meta
  const ccy = opts.currency ?? currency

  return {
    country: c,
    country_name: opts.country_name ?? countryName,
    region: plane,
    language: opts.language ?? { default: lang, fallback, rtl },
    currency: ccy,
    features: opts.features ?? {
      voip_calling: true, local_mesh: true, screenshot_protection: false,
      anonymous_posting: !isEU,
      payment_methods: ['handle','qr','nfc'],
      nfc_payments: true, qr_payments: true,
      crypto_allowed: !isEU,
      cultural_events: [],
      emergency_alerts: true,
    },
    payments: opts.payments ?? defaultPayments(ccy),
    compliance: opts.compliance ?? (isEU
      ? { data_retention_days: 30, real_name_required: false, content_filtering: false, gdpr_applies: true, right_to_be_forgotten: true, minor_protection: true, notes: 'GDPR + MiCAR. Data plane: eu. 30-day retention max.' }
      : { data_retention_days: 0, real_name_required: false, content_filtering: false, minor_protection: true }),
    homeserver: opts.homeserver ?? DEFAULTS.homeserver,
    peertube_instance: opts.peertube_instance ?? DEFAULTS.peertube_instance,
    ntfy_server: opts.ntfy_server ?? DEFAULTS.ntfy_server,
    maps_tile_server: opts.maps_tile_server ?? DEFAULTS.maps_tile_server,
    models_source: opts.models_source ?? 'huggingface',
    blocked_domains: opts.blocked_domains ?? [],
    transportation: opts.transportation ?? defaultTransportation(c),
    emergencyNumbers: opts.emergencyNumbers ?? defaultEmergency(c),
    newsSources: opts.newsSources ?? defaultNews(c, lang),
  }
}

function defaultPayments(currency: string): PaymentMethod[] {
  return [
    { id: 'handle', label: 'Send by @handle', category: 'instant', qr_supported: false, min: 1, max: 50000, fee_pct: 0, currency, icon: '🤝' },
    { id: 'qr',     label: 'QR pay',          category: 'instant', qr_supported: true,  min: 1, max: 50000, fee_pct: 0, currency, icon: '⬚' },
    { id: 'nfc',    label: 'NFC tap',         category: 'instant', qr_supported: false, min: 1, max: 5000,  fee_pct: 0, currency, icon: '📡' },
  ]
}

function defaultTransportation(c: string): Transportation {
  return {
    ride_hail: ['uber','inDriver','bolt'],
    transit_app: ['google_maps','citymapper'],
    bike_scooter: ['lime','bird'],
    car_rental: ['europcar','hertz','sixt'],
    domestic_rail: ['national_rail'],
    domestic_air: ['national_airline'],
  }
}

function defaultEmergency(c: string): EmergencyNumbers {
  const eu = planeFor(c) === 'eu'
  if (eu) return { police: '112', ambulance: '112', fire: '112', general: '112' }
  return { police: '112', ambulance: '112', fire: '112', general: '112' }
}

function defaultNews(c: string, lang: string): NewsSource[] {
  const sources: NewsSource[] = []
  if (lang === 'ar') {
    sources.push({ name: 'BBC Arabic', url: 'https://www.bbc.com/arabic', lang: 'ar', kind: 'trusted' })
  } else if (lang === 'en') {
    sources.push({ name: 'BBC News', url: 'https://www.bbc.com/news', lang: 'en', kind: 'trusted' })
  } else {
    sources.push({ name: 'World News', url: 'https://www.bbc.com/news', lang: 'en', kind: 'trusted' })
  }
  return sources
}

// Specific emergency overrides for key countries
const EMERGENCY_OVERRIDES: Record<string, EmergencyNumbers> = {
  US: { police: '911', ambulance: '911', fire: '911', general: '911' },
  UK: { police: '999', ambulance: '999', fire: '999', general: '111' },
  EG: { police: '122', ambulance: '123', fire: '180', general: '122' },
  SA: { police: '999', ambulance: '997', fire: '998', general: '911' },
  AE: { police: '999', ambulance: '998', fire: '997', general: '999' },
  QA: { police: '999', ambulance: '999', fire: '999', general: '999' },
  IN: { police: '100', ambulance: '108', fire: '101', general: '112' },
  JP: { police: '110', ambulance: '119', fire: '119', general: '119' },
  KR: { police: '112', ambulance: '119', fire: '119', general: '112' },
  CN: { police: '110', ambulance: '120', fire: '119', general: '110' },
  RU: { police: '102', ambulance: '103', fire: '101', general: '112' },
  BR: { police: '190', ambulance: '192', fire: '193', general: '192' },
  MX: { police: '911', ambulance: '911', fire: '911', general: '911' },
  NG: { police: '112', ambulance: '112', fire: '112', general: '112' },
  ZA: { police: '10111', ambulance: '10177', fire: '10177', general: '112' },
  AU: { police: '000', ambulance: '000', fire: '000', general: '000' },
  CA: { police: '911', ambulance: '911', fire: '911', general: '911' },
  TR: { police: '155', ambulance: '112', fire: '110', general: '112' },
  IR: { police: '110', ambulance: '115', fire: '125', general: '110' },
  PK: { police: '15', ambulance: '115', fire: '16', general: '112' },
  ID: { police: '110', ambulance: '118', fire: '113', general: '112' },
  TH: { police: '191', ambulance: '1669', fire: '199', general: '199' },
  VN: { police: '113', ambulance: '115', fire: '114', general: '115' },
  PH: { police: '117', ambulance: '117', fire: '117', general: '117' },
  DE: { police: '110', ambulance: '112', fire: '112', general: '112' },
  FR: { police: '17', ambulance: '15', fire: '18', general: '112' },
  IT: { police: '113', ambulance: '118', fire: '115', general: '112' },
  ES: { police: '091', ambulance: '112', fire: '112', general: '112' },
  AR: { police: '911', ambulance: '107', fire: '100', general: '911' },
}

// Specific news overrides for key countries
const NEWS_OVERRIDES: Record<string, NewsSource[]> = {
  EG: [
    { name: 'Al-Ahram', url: 'https://english.ahram.org.eg', lang: 'en', kind: 'trusted' },
    { name: 'Daily News Egypt', url: 'https://dailynewsegypt.com', lang: 'en', kind: 'trusted' },
  ],
  SA: [
    { name: 'Saudi Gazette', url: 'https://saudigazette.com.sa', lang: 'en', kind: 'trusted' },
    { name: 'Arab News', url: 'https://arabnews.com', lang: 'en', kind: 'trusted' },
  ],
  AE: [
    { name: 'Gulf News', url: 'https://gulfnews.com', lang: 'en', kind: 'trusted' },
    { name: 'The National', url: 'https://www.thenationalnews.com', lang: 'en', kind: 'trusted' },
  ],
  US: [
    { name: 'Reuters', url: 'https://www.reuters.com', lang: 'en', kind: 'trusted' },
    { name: 'AP News', url: 'https://apnews.com', lang: 'en', kind: 'trusted' },
  ],
  UK: [
    { name: 'BBC News', url: 'https://www.bbc.co.uk/news', lang: 'en', kind: 'trusted' },
    { name: 'Reuters UK', url: 'https://www.reuters.com/world/uk', lang: 'en', kind: 'trusted' },
  ],
  IN: [
    { name: 'The Hindu', url: 'https://www.thehindu.com', lang: 'en', kind: 'trusted' },
    { name: 'Times of India', url: 'https://timesofindia.indiatimes.com', lang: 'en', kind: 'trusted' },
  ],
  JP: [
    { name: 'Japan Times', url: 'https://www.japantimes.co.jp', lang: 'en', kind: 'trusted' },
    { name: 'NHK World', url: 'https://www3.nhk.or.jp/nhkworld', lang: 'en', kind: 'trusted' },
  ],
  BR: [
    { name: 'Folha de S.Paulo', url: 'https://www.folha.uol.com.br', lang: 'pt', kind: 'trusted' },
    { name: 'Globo', url: 'https://www.globo.com', lang: 'pt', kind: 'trusted' },
  ],
  MX: [
    { name: 'El Universal', url: 'https://www.eluniversal.com.mx', lang: 'es', kind: 'trusted' },
    { name: 'Reforma', url: 'https://www.reforma.com', lang: 'es', kind: 'trusted' },
  ],
  DE: [
    { name: 'DW', url: 'https://www.dw.com', lang: 'en', kind: 'trusted' },
    { name: 'Der Spiegel', url: 'https://www.spiegel.de', lang: 'de', kind: 'trusted' },
  ],
  FR: [
    { name: 'Le Monde', url: 'https://www.lemonde.fr', lang: 'fr', kind: 'trusted' },
    { name: 'France 24', url: 'https://www.france24.com', lang: 'en', kind: 'trusted' },
  ],
  RU: [
    { name: 'TASS', url: 'https://tass.com', lang: 'en', kind: 'trusted' },
    { name: 'Moscow Times', url: 'https://www.themoscowtimes.com', lang: 'en', kind: 'trusted' },
  ],
  CN: [
    { name: 'Xinhua', url: 'https://www.xinhuanet.com', lang: 'zh', kind: 'trusted' },
    { name: 'China Daily', url: 'https://www.chinadaily.com.cn', lang: 'en', kind: 'trusted' },
  ],
  NG: [
    { name: 'Premium Times', url: 'https://www.premiumtimesng.com', lang: 'en', kind: 'trusted' },
    { name: 'Punch', url: 'https://punchng.com', lang: 'en', kind: 'trusted' },
  ],
  ZA: [
    { name: 'News24', url: 'https://www.news24.com', lang: 'en', kind: 'trusted' },
    { name: 'Mail & Guardian', url: 'https://mg.co.za', lang: 'en', kind: 'trusted' },
  ],
}

// Specific transport overrides for key countries
const TRANSPORT_OVERRIDES: Record<string, Transportation> = {
  EG: { ride_hail: ['uber','careem','inDriver'], transit_app: ['google_maps','careem','cairo_metro'], bike_scooter: ['rabbit_mobility'], car_rental: ['europcar','hertz','sixt'], domestic_rail: ['enr'], domestic_air: ['egyptair'] },
  SA: { ride_hail: ['uber','careem','inDriver'], transit_app: ['google_maps','riyadh_bus'], bike_scooter: ['rabbit'], car_rental: ['europcar','hertz','sixt'], domestic_rail: ['sra'], domestic_air: ['saudia','flynas'] },
  AE: { ride_hail: ['uber','careem','inDriver'], transit_app: ['google_maps','shail','nol'], bike_scooter: ['lime'], car_rental: ['europcar','hertz','sixt'], domestic_rail: ['rta_metro'], domestic_air: ['emirates','flydubai'] },
  US: { ride_hail: ['uber','lyft'], transit_app: ['google_maps','transit','citymapper'], bike_scooter: ['citi_bike','lime'], car_rental: ['hertz','enterprise','sixt'], domestic_rail: ['amtrak'], domestic_air: ['delta','american','united'] },
  UK: { ride_hail: ['uber','bolt'], transit_app: ['citymapper','tfl_go'], bike_scooter: ['lime'], car_rental: ['europcar','hertz','sixt'], domestic_rail: ['national_rail'], domestic_air: ['british_airways','easyjet'] },
  IN: { ride_hail: ['ola','uber','rapido'], transit_app: ['google_maps','moovit'], bike_scooter: ['bounce','vogo'], car_rental: ['zoomcar','europcar'], domestic_rail: ['irctc'], domestic_air: ['indigo','air_india'] },
  JP: { ride_hail: ['go_taxi','uber','didi'], transit_app: ['google_maps','navitime'], bike_scooter: ['docomo_bike'], car_rental: ['toyota_rent','times_car'], domestic_rail: ['japan_rail'], domestic_air: ['jal','ana'] },
  BR: { ride_hail: ['uber','99','cabify'], transit_app: ['google_maps','moovit'], bike_scooter: ['bike_itau','tem_bike'], car_rental: ['localiza','movida','hertz'], domestic_rail: ['cp', 'cptm'], domestic_air: ['gol','latam'] },
  MX: { ride_hail: ['uber','didi','beat'], transit_app: ['google_maps','moovit'], bike_scooter: ['ecobici'], car_rental: ['europcar','hertz','sixt'], domestic_rail: ['tren_maya'], domestic_air: ['aeromexico','volaris'] },
  DE: { ride_hail: ['uber','freenow','bolt'], transit_app: ['bahn','google_maps'], bike_scooter: ['tier','lime'], car_rental: ['europcar','sixt','hertz'], domestic_rail: ['db_bahn'], domestic_air: ['lufthansa','eurowings'] },
  FR: { ride_hail: ['uber','bolt','freenow'], transit_app: ['citymapper','google_maps'], bike_scooter: ['lime','tier'], car_rental: ['europcar','sixt','hertz'], domestic_rail: ['sncf'], domestic_air: ['air_france','easyjet'] },
  RU: { ride_hail: ['yandex_go','citymobil'], transit_app: ['yandex_maps'], bike_scooter: ['yandex_drive'], car_rental: ['sixt','europcar'], domestic_rail: ['rzd'], domestic_air: ['aeroflot'] },
  CN: { ride_hail: ['didi','meituan'], transit_app: ['amap','baidu_maps'], bike_scooter: ['meituan_bike','hello_bike'], car_rental: ['ehi','avis'], domestic_rail: ['12306'], domestic_air: ['air_china','china_eastern'] },
  NG: { ride_hail: ['bolt','uber','inDriver'], transit_app: ['google_maps','moovit'], bike_scooter: ['gokada','max_ng'], car_rental: ['europcar','avis'], domestic_rail: ['nrc'], domestic_air: ['air_peace','arik_air'] },
  ZA: { ride_hail: ['uber','bolt'], transit_app: ['google_maps'], bike_scooter: ['lime'], car_rental: ['europcar','hertz','tempest'], domestic_rail: ['shosholoza'], domestic_air: ['south_african_airways','flysafair'] },
  TR: { ride_hail: ['uber','bi_taksi','bitaksi'], transit_app: ['google_maps','moovit'], bike_scooter: ['mobimatters'], car_rental: ['europcar','sixt','avis'], domestic_rail: ['tcdd'], domestic_air: ['turkish_airlines','pegasus'] },
}

// ──────────────────────────────────────────────────────────────────────────
// Main config resolver
// ──────────────────────────────────────────────────────────────────────────
export function configFor(country: string): RegionConfig {
  const c = country.toUpperCase()

  // Apply transport / emergency / news overrides for all countries, then specific overrides below
  const t0 = baseDefault(c, {
    transportation: TRANSPORT_OVERRIDES[c] ?? defaultTransportation(c),
    emergencyNumbers: EMERGENCY_OVERRIDES[c] ?? defaultEmergency(c),
    newsSources: NEWS_OVERRIDES[c] ?? defaultNews(c, (COUNTRY_MAP.get(c)?.[3] ?? 'en')),
  })

  switch (c) {
    // ─── MENA ───────────────────────────────────────────────────────────
    case 'EG': return {
      ...t0,
      country: 'EG', country_name: 'Egypt', region: 'global', currency: 'EGP',
      language: { default: 'ar', fallback: 'en', rtl: true },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: true,
        payment_methods: ['instapay','vodafone_cash','orange_money','etisalat_cash','we_pay','fawry','meeza','visa_master'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['ramadan','eid_fitr','sham_el_nessim'], emergency_alerts: true,
      },
      payments: EGYPT_PAYMENTS,
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false, minor_protection: true, notes: 'Egyptian market default. NTRA/WDA compliance.' },
      transportation: TRANSPORT_OVERRIDES['EG']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['EG']!,
      newsSources: NEWS_OVERRIDES['EG']!,
    }

    case 'SA': return {
      ...t0,
      country: 'SA', country_name: 'Saudi Arabia', region: 'global', currency: 'SAR',
      language: { default: 'ar', fallback: 'en', rtl: true },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['stc_pay','urpay','mada','sarie','apple_pay','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['ramadan','eid_fitr','saudi_national_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'sarie',     label: 'Sarie (instant)', category: 'instant', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'SAR', icon: '⚡' },
        { id: 'stc_pay',   label: 'STC Pay',         category: 'wallet',  deeplink_scheme: 'stcpay://pay', qr_supported: true, min: 1, max: 100000, fee_pct: 0, currency: 'SAR', icon: '🔴' },
        { id: 'urpay',     label: 'UrPay',           category: 'wallet',  qr_supported: true, min: 1, max: 100000, fee_pct: 0, currency: 'SAR', icon: '🟣' },
        { id: 'mada',      label: 'Mada card',       category: 'card',    qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'SAR', icon: '💳' },
        { id: 'apple_pay', label: 'Apple Pay',       category: 'wallet',  qr_supported: false, min: 1, max: 100000, fee_pct: 1.5, currency: 'SAR', icon: '🍎' },
      ],
      compliance: { data_retention_days: 0, real_name_required: true, content_filtering: true, minor_protection: true, notes: 'SAMA/CITC. Real name required for payments.' },
      transportation: TRANSPORT_OVERRIDES['SA']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['SA']!,
      newsSources: NEWS_OVERRIDES['SA']!,
    }

    case 'AE': return {
      ...t0,
      country: 'AE', country_name: 'United Arab Emirates', region: 'global', currency: 'AED',
      language: { default: 'ar', fallback: 'en', rtl: true },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['fab_pay','emi_pay','nol','sarie','apple_pay','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['uae_national_day','ramadan'], emergency_alerts: true,
      },
      payments: [
        { id: 'fab_pay',   label: 'FAB Pay',       category: 'wallet',  qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'AED', icon: '🔴' },
        { id: 'emi_pay',   label: 'Emirates Pay',  category: 'wallet',  qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'AED', icon: '🇦🇪' },
        { id: 'nol',       label: 'NOL card',      category: 'wallet',  qr_supported: true, min: 1, max: 5000,   fee_pct: 0, currency: 'AED', icon: '🔵' },
        { id: 'sarie',     label: 'Sarie instant', category: 'instant', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'AED', icon: '⚡' },
        { id: 'apple_pay', label: 'Apple Pay',     category: 'wallet',  qr_supported: false, min: 1, max: 100000, fee_pct: 1.5, currency: 'AED', icon: '🍎' },
      ],
      compliance: { data_retention_days: 0, real_name_required: true, content_filtering: true, minor_protection: true, notes: 'TRA/SCA. KYC for payments.' },
      transportation: TRANSPORT_OVERRIDES['AE']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['AE']!,
      newsSources: NEWS_OVERRIDES['AE']!,
    }

    // ─── ASIA ───────────────────────────────────────────────────────────
    case 'IN': return {
      ...t0,
      country: 'IN', country_name: 'India', region: 'global', currency: 'INR',
      language: { default: 'hi', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['upi','paytm','phonepe','gpay','imps','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['diwali','holi','eid'], emergency_alerts: true,
      },
      payments: [
        { id: 'upi',     label: 'UPI',       category: 'instant', deeplink_scheme: 'upi://pay', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'INR', icon: '⚡' },
        { id: 'paytm',   label: 'Paytm',     category: 'wallet',  deeplink_scheme: 'paytm://pay', qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'INR', icon: '💙' },
        { id: 'phonepe', label: 'PhonePe',   category: 'wallet',  deeplink_scheme: 'phonepe://pay', qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'INR', icon: '💜' },
        { id: 'gpay',    label: 'Google Pay',category: 'wallet',  qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'INR', icon: '🔵' },
        { id: 'imps',    label: 'IMPS',      category: 'instant', qr_supported: false, min: 1, max: 200000, fee_pct: 0, currency: 'INR', icon: '⚡' },
      ],
      compliance: { data_retention_days: 0, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'RBI UPI. Data localisation norms.' },
      transportation: TRANSPORT_OVERRIDES['IN']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['IN']!,
      newsSources: NEWS_OVERRIDES['IN']!,
    }

    case 'CN': return {
      ...t0,
      country: 'CN', country_name: 'China', region: 'china', currency: 'CNY',
      language: { default: 'zh', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['alipay','wechat_pay','unionpay','digital_yuan','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['spring_festival','national_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'alipay',       label: 'Alipay',      category: 'wallet',  deeplink_scheme: 'alipays://platformapi/startapp', qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'CNY', icon: '🔵' },
        { id: 'wechat_pay',   label: 'WeChat Pay',  category: 'wallet',  deeplink_scheme: 'weixin://wxpay/bizpayurl', qr_supported: true, min: 1, max: 500000, fee_pct: 0, currency: 'CNY', icon: '🟢' },
        { id: 'unionpay',     label: 'UnionPay',    category: 'card',    qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'CNY', icon: '💳' },
        { id: 'digital_yuan', label: 'Digital Yuan',category: 'instant', qr_supported: true, min: 1, max: 100000, fee_pct: 0, currency: 'CNY', icon: '🇨🇳' },
      ],
      compliance: { data_retention_days: 0, real_name_required: true, content_filtering: true, minor_protection: true, notes: 'PRC local operation. No federation with global servers.' },
      homeserver: 'matrix.cirkle.cn',
      peertube_instance: 'https://video.cirkle.cn',
      ntfy_server: 'https://push.cirkle.cn',
      maps_tile_server: 'https://tiles.cirkle.cn',
      models_source: 'modelscope',
      blocked_domains: ['youtube.com','google.com','twitter.com','x.com'],
      transportation: TRANSPORT_OVERRIDES['CN']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['CN']!,
      newsSources: NEWS_OVERRIDES['CN']!,
    }

    case 'VN': return {
      ...t0,
      country: 'VN', country_name: 'Vietnam', region: 'vietnam', currency: 'VND',
      language: { default: 'vi', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: true,
        anonymous_posting: false,
        payment_methods: ['zalopay','momo','vnpay','napas','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['tet','reunification_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'zalopay', label: 'ZaloPay', category: 'wallet',  deeplink_scheme: 'zalopay://app', qr_supported: true, min: 1000, max: 1000000000, fee_pct: 0, currency: 'VND', icon: '💙' },
        { id: 'momo',    label: 'MoMo',    category: 'wallet',  deeplink_scheme: 'momo://app', qr_supported: true, min: 1000, max: 1000000000, fee_pct: 0, currency: 'VND', icon: '💗' },
        { id: 'vnpay',   label: 'VNPAY',   category: 'wallet',  qr_supported: true, min: 1000, max: 1000000000, fee_pct: 0, currency: 'VND', icon: '🔴' },
        { id: 'napas',   label: 'NAPAS',   category: 'instant', qr_supported: true, min: 1000, max: 1000000000, fee_pct: 0, currency: 'VND', icon: '⚡' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: true, minor_protection: true, notes: 'SBV circulars. Local data storage.' },
      homeserver: 'matrix.cirkle.vn',
      peertube_instance: 'https://video.cirkle.vn',
      ntfy_server: 'https://push.cirkle.vn',
      maps_tile_server: 'https://tiles.cirkle.vn',
      models_source: 'huggingface',
      blocked_domains: [],
      transportation: { ride_hail: ['grab','be','xanh_sm'], transit_app: ['google_maps','bus_map'], bike_scooter: ['grab_bike','be'], car_rental: ['europcar','avis','hertz'], domestic_rail: ['dsvn'], domestic_air: ['vietnam_airlines','vietjet'] },
      emergencyNumbers: EMERGENCY_OVERRIDES['VN']!,
      newsSources: [
        { name: 'Vietnam News', url: 'https://vietnamnews.vn', lang: 'en', kind: 'trusted' },
        { name: 'VNExpress', url: 'https://vnexpress.net', lang: 'vi', kind: 'trusted' },
      ],
    }

    case 'ID': return {
      ...t0,
      country: 'ID', country_name: 'Indonesia', region: 'global', currency: 'IDR',
      language: { default: 'id', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['gopay','ovo','dana','linkaja','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['idul_fitri','nyepi'], emergency_alerts: true,
      },
      payments: [
        { id: 'gopay',   label: 'GoPay',  category: 'wallet', deeplink_scheme: 'gopay://', qr_supported: true, min: 1000, max: 100000000, fee_pct: 0, currency: 'IDR', icon: '💙' },
        { id: 'ovo',     label: 'OVO',    category: 'wallet', deeplink_scheme: 'ovo://',   qr_supported: true, min: 1000, max: 100000000, fee_pct: 0, currency: 'IDR', icon: '🔵' },
        { id: 'dana',    label: 'DANA',   category: 'wallet', deeplink_scheme: 'dana://',  qr_supported: true, min: 1000, max: 100000000, fee_pct: 0, currency: 'IDR', icon: '🔵' },
        { id: 'linkaja', label: 'LinkAja',category: 'wallet', qr_supported: true, min: 1000, max: 100000000, fee_pct: 0, currency: 'IDR', icon: '🔴' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'BI OJK. KYC for e-money.' },
      transportation: { ride_hail: ['grab','gojek','inDriver'], transit_app: ['google_maps','moovit'], bike_scooter: ['gojek','grab_bike'], car_rental: ['europcar','avis','hertz'], domestic_rail: ['kai'], domestic_air: ['garuda','lion_air'] },
      emergencyNumbers: { police: '110', ambulance: '118', fire: '113', general: '112' },
      newsSources: [
        { name: 'Jakarta Post', url: 'https://www.thejakartapost.com', lang: 'en', kind: 'trusted' },
        { name: 'Kompas', url: 'https://www.kompas.com', lang: 'id', kind: 'trusted' },
      ],
    }

    case 'PK': return {
      ...t0,
      country: 'PK', country_name: 'Pakistan', region: 'global', currency: 'PKR',
      language: { default: 'ur', fallback: 'en', rtl: true },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['easypaisa','jazzcash','raast','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['eid_fitr','pakistan_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'easypaisa', label: 'Easypaisa', category: 'wallet', deeplink_scheme: 'easypaisa://', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'PKR', icon: '💚' },
        { id: 'jazzcash',  label: 'JazzCash',  category: 'wallet', deeplink_scheme: 'jazzcash://', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'PKR', icon: '🔴' },
        { id: 'raast',     label: 'Raast',     category: 'instant', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'PKR', icon: '⚡' },
      ],
      compliance: { data_retention_days: 90, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'SBP. KYC for wallets.' },
      transportation: { ride_hail: ['careem','uber','inDriver'], transit_app: ['google_maps'], bike_scooter: ['bykea'], car_rental: ['europcar','hertz'], domestic_rail: ['pakistan_railways'], domestic_air: ['pia','airblue'] },
      emergencyNumbers: EMERGENCY_OVERRIDES['PK']!,
      newsSources: [
        { name: 'Dawn', url: 'https://www.dawn.com', lang: 'en', kind: 'trusted' },
        { name: 'The News', url: 'https://www.thenews.com.pk', lang: 'en', kind: 'trusted' },
      ],
    }

    case 'JP': return {
      ...t0,
      country: 'JP', country_name: 'Japan', region: 'global', currency: 'JPY',
      language: { default: 'ja', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['paypay','suica','line_pay','rakuten_pay','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['new_year','hanami','obon'], emergency_alerts: true,
      },
      payments: [
        { id: 'paypay',      label: 'PayPay',      category: 'wallet', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'JPY', icon: '💙' },
        { id: 'suica',       label: 'Suica',       category: 'wallet', qr_supported: true, min: 1, max: 20000,  fee_pct: 0, currency: 'JPY', icon: '🍉' },
        { id: 'line_pay',    label: 'LINE Pay',    category: 'wallet', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'JPY', icon: '🟢' },
        { id: 'rakuten_pay', label: 'Rakuten Pay', category: 'wallet', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'JPY', icon: '🔴' },
      ],
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false, minor_protection: true, notes: 'JFSA. Crypto only via exchanges.' },
      transportation: TRANSPORT_OVERRIDES['JP']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['JP']!,
      newsSources: NEWS_OVERRIDES['JP']!,
    }

    case 'KR': return {
      ...t0,
      country: 'KR', country_name: 'South Korea', region: 'global', currency: 'KRW',
      language: { default: 'ko', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: false,
        payment_methods: ['kakao_pay','naver_pay','samsung_pay','toss','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: false,
        cultural_events: ['seollal','chuseok'], emergency_alerts: true,
      },
      payments: [
        { id: 'kakao_pay',   label: 'KakaoPay',    category: 'wallet', qr_supported: true, min: 1000, max: 5000000, fee_pct: 0, currency: 'KRW', icon: '🟡' },
        { id: 'naver_pay',   label: 'Naver Pay',   category: 'wallet', qr_supported: true, min: 1000, max: 5000000, fee_pct: 0, currency: 'KRW', icon: '🟢' },
        { id: 'samsung_pay', label: 'Samsung Pay', category: 'wallet', qr_supported: false, min: 1000, max: 5000000, fee_pct: 0, currency: 'KRW', icon: '🔵' },
        { id: 'toss',        label: 'Toss',        category: 'wallet', qr_supported: true, min: 1000, max: 5000000, fee_pct: 0, currency: 'KRW', icon: '💙' },
      ],
      compliance: { data_retention_days: 0, real_name_required: false, content_filtering: false, minor_protection: true, notes: 'FSC. Real-name for large transfers.' },
      transportation: { ride_hail: ['kakao_t','uber','tada'], transit_app: ['kakao_map','naver_map'], bike_scooter: ['kakao_t_bike'], car_rental: ['europcar','sixt'], domestic_rail: ['korail'], domestic_air: ['korean_air','asiana'] },
      emergencyNumbers: EMERGENCY_OVERRIDES['KR']!,
      newsSources: [
        { name: 'Korea Times', url: 'https://www.koreatimes.co.kr', lang: 'en', kind: 'trusted' },
        { name: 'Yonhap', url: 'https://en.yna.co.kr', lang: 'en', kind: 'trusted' },
      ],
    }

    // ─── AMERICAS ───────────────────────────────────────────────────────
    case 'BR': return {
      ...t0,
      country: 'BR', country_name: 'Brazil', region: 'global', currency: 'BRL',
      language: { default: 'pt', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['pix','nubank','mercadopago','inter','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['carnaval','independence_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'pix',          label: 'Pix',          category: 'instant', qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'BRL', icon: '⚡' },
        { id: 'nubank',       label: 'Nubank',       category: 'wallet',  qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'BRL', icon: '💜' },
        { id: 'mercadopago',  label: 'Mercado Pago', category: 'wallet',  qr_supported: true, min: 1, max: 5000000, fee_pct: 0, currency: 'BRL', icon: '💛' },
        { id: 'inter',        label: 'Banco Inter',  category: 'wallet',  qr_supported: true, min: 1, max: 1000000, fee_pct: 0, currency: 'BRL', icon: '🟠' },
      ],
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'BCB Pix. CVM for crypto.' },
      transportation: TRANSPORT_OVERRIDES['BR']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['BR']!,
      newsSources: NEWS_OVERRIDES['BR']!,
    }

    case 'MX': return {
      ...t0,
      country: 'MX', country_name: 'Mexico', region: 'global', currency: 'MXN',
      language: { default: 'es', fallback: 'en', rtl: false },
      features: {
        voip_calling: true, local_mesh: true, screenshot_protection: false,
        anonymous_posting: true,
        payment_methods: ['spei','mercadopago','clip','oxxo','handle'],
        nfc_payments: true, qr_payments: true, crypto_allowed: true,
        cultural_events: ['dia_de_muertos','independence_day'], emergency_alerts: true,
      },
      payments: [
        { id: 'spei',         label: 'SPEI',         category: 'instant', qr_supported: true,  min: 1, max: 10000000, fee_pct: 0, currency: 'MXN', icon: '⚡' },
        { id: 'mercadopago',  label: 'Mercado Pago', category: 'wallet',  qr_supported: true,  min: 1, max: 10000000, fee_pct: 0, currency: 'MXN', icon: '💛' },
        { id: 'clip',         label: 'Clip',         category: 'wallet',  qr_supported: true,  min: 1, max: 1000000,  fee_pct: 0, currency: 'MXN', icon: '🔵' },
        { id: 'oxxo',         label: 'OXXO Pay',     category: 'cash',    qr_supported: true,  min: 1, max: 10000,   fee_pct: 0, currency: 'MXN', icon: '🏪' },
      ],
      compliance: { data_retention_days: 365, real_name_required: true, content_filtering: false, minor_protection: true, notes: 'Banxico. CNBV oversight.' },
      transportation: TRANSPORT_OVERRIDES['MX']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['MX']!,
      newsSources: NEWS_OVERRIDES['MX']!,
    }

    case 'AR': return {
      ...t0,
      country: 'AR', country_name: 'Argentina', region: 'global', currency: 'ARS',
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
      transportation: TRANSPORT_OVERRIDES['AR']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['AR']!,
      newsSources: [
        { name: 'Buenos Aires Times', url: 'https://www.batimes.com.ar', lang: 'en', kind: 'trusted' },
        { name: 'Clarín', url: 'https://www.clarin.com', lang: 'es', kind: 'trusted' },
      ],
    }

    case 'US': return {
      ...t0,
      country: 'US', country_name: 'United States', region: 'global', currency: 'USD',
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
      transportation: TRANSPORT_OVERRIDES['US']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['US']!,
      newsSources: NEWS_OVERRIDES['US']!,
    }

    // ─── EUROPE ─────────────────────────────────────────────────────────
    case 'GB':
    case 'UK': return {
      ...t0,
      country: 'UK', country_name: 'United Kingdom', region: 'global', currency: 'GBP',
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
      transportation: TRANSPORT_OVERRIDES['UK']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['UK']!,
      newsSources: NEWS_OVERRIDES['UK']!,
    }

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
      return {
        ...t0,
        country: c, country_name: name, region: 'eu', currency: 'EUR',
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
        compliance: { data_retention_days: 30, real_name_required: false, content_filtering: false, gdpr_applies: true, right_to_be_forgotten: true, minor_protection: true, notes: 'GDPR + MiCAR. Data plane: eu.' },
        transportation: TRANSPORT_OVERRIDES[c] ?? defaultTransportation(c),
        emergencyNumbers: EMERGENCY_OVERRIDES[c] ?? defaultEmergency(c),
        newsSources: NEWS_OVERRIDES[c] ?? defaultNews(c, lang),
      }
    }

    // ─── EUROPE — Russia plane ──────────────────────────────────────────
    case 'RU': return {
      ...t0,
      country: 'RU', country_name: 'Russia', region: 'russia', currency: 'RUB',
      language: { default: 'ru', fallback: 'en', rtl: false },
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
      homeserver: 'matrix.cirkle.ru',
      peertube_instance: 'https://video.cirkle.ru',
      ntfy_server: 'https://push.cirkle.ru',
      maps_tile_server: 'https://tiles.cirkle.ru',
      models_source: 'yandex',
      blocked_domains: [],
      transportation: TRANSPORT_OVERRIDES['RU']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['RU']!,
      newsSources: NEWS_OVERRIDES['RU']!,
    }

    case 'TR': return {
      ...t0,
      country: 'TR', country_name: 'Türkiye', region: 'global', currency: 'TRY',
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
      transportation: TRANSPORT_OVERRIDES['TR']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['TR']!,
      newsSources: [
        { name: 'Daily Sabah', url: 'https://www.dailysabah.com', lang: 'en', kind: 'trusted' },
        { name: 'Hürriyet', url: 'https://www.hurriyetdailynews.com', lang: 'en', kind: 'trusted' },
      ],
    }

    // ─── AFRICA ─────────────────────────────────────────────────────────
    case 'NG': return {
      ...t0,
      country: 'NG', country_name: 'Nigeria', region: 'global', currency: 'NGN',
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
      transportation: TRANSPORT_OVERRIDES['NG']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['NG']!,
      newsSources: NEWS_OVERRIDES['NG']!,
    }

    case 'ZA': return {
      ...t0,
      country: 'ZA', country_name: 'South Africa', region: 'global', currency: 'ZAR',
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
      transportation: TRANSPORT_OVERRIDES['ZA']!,
      emergencyNumbers: EMERGENCY_OVERRIDES['ZA']!,
      newsSources: NEWS_OVERRIDES['ZA']!,
    }

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
      return {
        ...t0,
        country: c, country_name: name, region: 'global', currency: ccy,
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
        transportation: defaultTransportation(c),
        emergencyNumbers: EMERGENCY_OVERRIDES[c] ?? defaultEmergency(c),
        newsSources: defaultNews(c, 'ar'),
      }
    }

    case 'IR': return {
      ...t0,
      country: 'IR', country_name: 'Iran', region: 'iran', currency: 'IRR',
      language: { default: 'fa', fallback: 'ar', rtl: true },
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
      homeserver: 'matrix.cirkle.ir',
      peertube_instance: 'https://video.cirkle.ir',
      ntfy_server: 'https://push.cirkle.ir',
      maps_tile_server: 'https://tiles.cirkle.ir',
      models_source: 'huggingface',
      blocked_domains: [],
      transportation: { ride_hail: ['snapp','tap30'], transit_app: ['neshan'], bike_scooter: [], car_rental: ['europcar'], domestic_rail: ['raja'], domestic_air: ['mahan','iran_air'] },
      emergencyNumbers: EMERGENCY_OVERRIDES['IR']!,
      newsSources: [
        { name: 'Tehran Times', url: 'https://www.tehrantimes.com', lang: 'en', kind: 'trusted' },
        { name: 'IRNA', url: 'https://www.irna.ir', lang: 'en', kind: 'trusted' },
      ],
    }

    default: {
      return t0
    }
  }
}

// Quick map for country picker UI (flag + label) — all 214 countries
export const KNOWN_COUNTRIES: Array<{ code: string; name: string; flag: string }> = ALL_214.map(
  ([code, name, , , , , flag]) => ({ code, name, flag })
)
