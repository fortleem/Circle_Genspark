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
