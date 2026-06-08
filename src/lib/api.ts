// Circle — Tiny typed API client for /api/*

const BASE = '/api'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!r.ok) {
    let err: any = { error: 'http_' + r.status }
    try { err = await r.json() } catch {}
    throw Object.assign(new Error(err.error ?? 'http_' + r.status), { status: r.status, body: err })
  }
  return r.json() as Promise<T>
}

export const apiGet = <T = any>(path: string) => http<T>(path)
export const apiPost = <T = any>(path: string, body: any) => http<T>(path, { method: 'POST', body: JSON.stringify(body) })

// Domain helpers (typed shortcuts for the common screens) -----------------

export interface User { id: number; handle: string; display_name: string; verified: number; city: string; country: string; matrix_id?: string; verified_claim?: string }
export interface MidanPost { id: number; author_id: number; content: string; hashtags?: string; city?: string; likes: number; reposts: number; replies_count: number; created_at: string; anonymous: number; handle: string; display_name: string; verified: number }
export interface Video { id: string; title: string; description: string; thumbnail_cid?: string; ipfs_cid?: string; views: number; likes: number; duration_seconds: number; published_at: string; handle: string; display_name: string; verified: number; uploader_id: number }
export interface Photo { id: number; uploader_id: number; caption?: string; city?: string; ipfs_cid?: string; likes: number; published_at: string; handle: string; display_name: string }
export interface Room { id: string; name: string; kind: string; member_count: number; last_message?: string; last_at?: string; created_at: string; matrix_room_id?: string; is_encrypted?: number; topic?: string }
export interface Message { id: string; room_id: string; sender_id: number; body: string; status: number; is_encrypted: number; created_at: string; handle: string; display_name: string }
export interface CircleGroup { id: number; slug: string; name: string; description: string; visibility?: string; mode?: string; category?: string; city?: string; member_count: number; owner_id?: number; ipfs_cid?: string; created_at?: string }
export interface Channel { id: number; slug: string; name: string; channel_type: string; subscriber_count: number; verified?: number; verified_at?: string; description?: string; logo_url?: string; avatar_cid?: string | null; category?: string; country?: string; owner_id?: number; created_at?: string }
export interface Job { id: number; title: string; company: string; city?: string; country?: string; location?: string; remote: number; created_at: string; posted_by_name?: string; description?: string; apply_url?: string; salary_min?: number; salary_max?: number; salary_currency?: string; tags?: string; posted_by?: number }
export interface ProProfile { id: number; user_id: number; headline?: string; about?: string; skills?: string; experience_years?: number; handle: string; display_name: string; city?: string; country?: string }
export interface Wallet { user_id: number; balance: number; currency: string }
export interface Txn { id: number; from_user: number; to_user: number; amount: number; currency: string; status: string; method: string; created_at: string; from_name?: string; to_name?: string; note?: string }
export interface Mail { id: number; user_id: number; from_addr: string; to_addr: string; subject: string; body: string; folder: string; read_flag: number; created_at: string }
export interface CityEvent{ id: number; title: string; city: string; venue: string; category: string; start_time: string; cover_color?: string; interested: number; priority: number; description?: string }
export interface Proposal { id: number; title: string; description: string; status: string; votes_yes: number; votes_no: number; created_at: string; ends_at?: string }
export interface LedgerRow{ id: number; month: string; source: string; amount_usd: number; allocation: string; notes?: string }
export interface MiniApp { id: number; slug: string; name: string; category: string; description: string; install_count: number; icon?: string; sandbox_url?: string }
export interface MeshPeer { id: number; peer_id: string; user_id: number; display_name: string; transport: string; distance_m: number; rssi_dbm: number; last_seen: string; city: string; is_relaying: number }
export interface SOSAlert { id: number; user_id: number; display_name: string; message?: string; severity: string; city: string; peers_reached: number; created_at: string }
export interface ModAction{ id: number; target_type: string; target_id: string; action: string; reason: string; model_used?: string; confidence?: number; created_at: string }
export interface MapRegion{ id: number; region_code: string; country: string; tiles_size_mb: number; pinned_by: number; ipfs_cid?: string; updated_at: string }
export interface AIModel { id: number; name: string; category: string; size_mb: number; precision: string; source: string; required: number; description?: string }
export interface SelfHostNode { id: number; name: string; kind: string; operator?: string; country?: string; users_served: number; uptime_pct?: number; url?: string }
export interface RoadmapPhase { id: number; phase_no: number; title: string; months: number; status: string; deliverables: string[] }
export interface Itinerary { id: number; user_id: number; city: string; days: number; interests: string; plan_json: any; created_at: string }

// Wasl extras
export interface WaslPrivacy {
  user_id: number;
  ghost_mode: number;
  screenshot_block: number;
  forwarding_consent: number;
  disappearing_default: number;
  read_receipts: number;
  last_seen_visible: number;
  typing_indicator: number;
  auto_download_media: number;
  updated_at: string;
}
export interface WaslCall {
  id: string;
  room_id: string;
  caller_id: number;
  callee_id?: number;
  call_type: 'voice' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'rejected';
  is_p2p: number;
  started_at: string;
  ended_at?: string;
  duration_sec?: number;
}
export interface MaktabAudit {
  id: number;
  workspace_id: string;
  actor_id: number;
  action: string;
  target?: string;
  details?: string;
  created_at: string;
  actor_name?: string;
}
export interface WaslReaction { emoji: string; count: number; }
export interface WaslOverride {
  room_id: string;
  user_id: number;
  disappearing_ttl?: number | null;
  notifications?: 'all' | 'mentions' | 'none';
  pinned?: number;
  muted_until?: string | null;
}
export interface WaslAnalytics {
  subscribers: number;
  messages: number;
  reactions: number;
  reach_estimate: number;
  created_at?: string | null;
}
export interface WaslAuthMethod {
  user_id: number;
  method: 'email' | 'telegram' | 'sms';
  identifier?: string | null;
  verified: number;
  updated_at: string;
}
export interface VideoComment {
  id: string;
  video_id: string;
  user_id: number;
  body: string;
  is_bullet: number;
  time_offset?: number;
  created_at: string;
  handle?: string;
  display_name?: string;
  verified?: number;
}
export interface PhotoComment {
  id: string; photo_id: string; user_id: number; body: string; created_at: string;
  handle?: string; display_name?: string;
}
export interface PostReply {
  id: string; post_id: string; author_id: number; content: string; created_at: string;
  handle?: string; display_name?: string;
}
export interface TipSuggestion {
  widget: string;
  currency: string;
  amounts: number[];
  gifts: { name: string; emoji: string; amount: number }[];
  country: string;
  age_restricted: boolean;
  blocked: boolean;
  disclaimer: string;
}
export interface SponsoredHashtag {
  id: number; hashtag: string; city?: string; advertiser?: string;
  starts_at: string; ends_at?: string; budget: number;
}
export interface CreatorAnalytics {
  user_id: number;
  total_views: number;
  total_likes: number;
  total_subscribers: number;
  total_tips_minor: number;
  avg_watch_secs: number;
  members?: number;
  updated_at: string;
}

// ─── Notifications, Mail, Shares, Command palette ─────────────────────
export interface Notification {
  id: number;
  kind: 'wasl' | 'mashahd' | 'midan' | 'pay' | 'mesh' | 'verify' | 'gov' | 'system';
  title: string;
  body?: string;
  link?: string;
  unread: number;
  priority: number;
  created_at: string;
}
export interface NotificationCounts { total: number; unread: number; high: number }

export interface MailOutboxItem {
  id: number;
  to_addr: string;
  subject: string;
  body: string;
  is_encrypted: number;
  is_anonymous: number;
  state: 'queued' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
}

export interface CommandResult {
  kind: 'room' | 'channel' | 'video' | 'post' | 'user';
  id: number | string;
  title: string;
  hint: string;
  route: string;
}

// ── Futuristic types (F2–F8) ────────────────────────────────────
export interface PresenceUser {
  user_id: number; state: 'online'|'mesh'|'away'|'invisible';
  region?: string; mesh_node?: string; encrypted_channels: number;
  device?: string; last_seen: string;
  handle?: string; display_name?: string; avatar_url?: string;
}
export interface PresenceTotals { online: number; mesh: number; away: number; encrypted_channels: number; regions: string[] }

export interface PulseEvent { pillar: string; kind: string; weight: number; city?: string; created_at: string }
export interface PulseSummary { events: PulseEvent[]; byPillar: Record<string,number>; byCity: Record<string,number>; total: number }

export interface TimeCapsule {
  id: number; author_id: number; pillar: string; payload: string;
  anchor_hash: string; sealed_at: string; unseal_at: string;
  unsealed: number; visibility: 'public'|'recipients'|'self';
  handle?: string; display_name?: string; avatar_url?: string;
}

export interface Whisper {
  id: number; from_user: number; to_user?: number; body: string;
  ttl_seconds: number; view_count: number; max_views: number;
  burned: number; first_viewed_at?: string; expires_at?: string;
  created_at: string; handle?: string; display_name?: string;
}

export interface LensPin {
  id: number; photo_id?: number; user_id: number; lat: number; lng: number;
  bearing?: number; altitude?: number; city?: string; caption?: string;
  created_at: string; handle?: string; display_name?: string;
}

export interface Echo {
  id: number; span_start?: number; span_end?: number;
  summary: string; sentiment: 'positive'|'neutral'|'tense'|'celebratory';
  key_actors: string; created_at: string;
}

export interface ConstellationNode { id: number; handle: string; display_name: string; avatar_url?: string; weight: number }
export interface Constellation { center: number; orbits: { ring: 'inner'|'middle'|'outer'; nodes: ConstellationNode[] }[]; total: number }

// ── Wave 2 types (F10, F12, F15, F16) ────────────────────────────
export interface VaultShare { id: number; holder_id: number; share_hash: string; consented: number; used_in_recovery: number; handle?: string; display_name?: string }
export interface FamilyVault {
  id: number; owner_id: number; name: string; description?: string;
  threshold_m: number; total_n: number; vault_hash: string;
  status: 'active' | 'recovering' | 'recovered' | 'archived';
  share_count: number; consented_count: number;
  shares: VaultShare[];
  created_at: string;
}

export interface EventTicket {
  id: number; event_id?: number; event_title: string; event_city?: string; event_at?: string;
  issuer_id: number; holder_id: number; tier: 'general'|'vip'|'press'|'free';
  qr_payload: string; anchor_hash: string;
  state: 'issued'|'validated'|'used'|'revoked'|'transferred';
  validated_at?: string; used_at?: string; created_at: string;
}

export interface PrivacySimRun {
  id: number; user_id: number; viewer_kind: string;
  visible_score: number; visible_fields: string; recommendations: string;
  created_at: string;
}
export interface PrivacySimSummary { runs_count: number; avg_visible: number; most_private: number; least_private: number }

export interface AIConsent { pillar: string; on_device: number; federated: number; cloud: number; updated_at: string }

// Community Jury (§16)
export interface JuryAppeal {
  id: number; content_kind: string; content_id: string; detector: string;
  action: string; score?: number; reason?: string;
  appealed: number; appeal_status?: 'pending'|'overturned'|'upheld';
  overturn_count: number; uphold_count: number; abstain_count: number;
  created_at: string;
}
export interface JuryVote {
  id: number; action_id: number; juror_id: number;
  vote: 'overturn'|'uphold'|'abstain'; rationale?: string;
  reputation_at_vote: number; created_at: string;
  handle?: string; display_name?: string;
}
export interface JuryPanelist {
  id: number; juror_id: number; cases_heard: number; status: string;
  empanelled_at: string; retired_at?: string;
  handle?: string; display_name?: string;
}
