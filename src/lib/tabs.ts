// Circle — full navigation map (production sidebar excludes internal/docs-only routes).
import {
  Home, MessageCircle, Play, Image as ImageIcon, Hash, Plane, Wallet, User,
  Users as UsersIcon, Radio, Briefcase, GraduationCap, Star, ArchiveRestore,
  ShieldCheck, Bot, Mail, KeyRound, Map as MapIcon, Languages, Grid3X3,
  Lock, Vote, BarChart3, BadgeCheck, BookOpen, Layers, Server, ListChecks,
  Compass, Cpu, Globe2, Eye, Sparkles
} from "lucide-react";
import type { NameMatrix } from "@/lib/i18n";

export type NavGroupKey = 'discover' | 'pillars' | 'community' | 'life' | 'aiPrivacy' | 'about';

export interface NavItem {
  id: string;
  path: string;
  icon: any;
  /** function that returns label for current locale's NameMatrix */
  label: (n: NameMatrix) => string;
  /** short subtitle/hint shown under the TopBar title and used for fuzzy search */
  hint: string;
  /** extra keywords (synonyms, en/ar transliterations) used only for search routing */
  keywords: string[];
  /** is this a primary mobile-dock tab? */
  primary?: boolean;
  group: NavGroupKey;
  /** show in the customer-facing production sidebar (false = route still works, just hidden) */
  production?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // DISCOVER ───────────────────────────────────────────────
  { id: 'home', path: '/', icon: Home, label: n => n.nav_home, hint: 'Home dashboard', keywords: ['home','dashboard','feed','discover'], primary: true, group: 'discover', production: true },

  // FOUR PILLARS ───────────────────────────────────────────
  { id: 'wasl', path: '/wasl', icon: MessageCircle, label: n => n.module_chat, hint: 'Chat & calls', keywords: ['chat','messages','dm','wasl','calls','voice','video'], primary: true, group: 'pillars', production: true },
  { id: 'mashahd', path: '/mashahd', icon: Play, label: n => n.module_video, hint: 'Video & live', keywords: ['video','watch','live','tv','mashahd','shorts','stream'], primary: true, group: 'pillars', production: true },
  { id: 'lamahat', path: '/lamahat', icon: ImageIcon, label: n => n.module_photos, hint: 'Photos & stories', keywords: ['photos','pictures','stories','gallery','lamahat','moments'], primary: true, group: 'pillars', production: true },
  { id: 'midan', path: '/midan', icon: Hash, label: n => n.module_square, hint: 'Public square', keywords: ['square','feed','posts','midan','public','timeline'], primary: true, group: 'pillars', production: true },

  // COMMUNITY ──────────────────────────────────────────────
  { id: 'circles', path: '/circles', icon: UsersIcon, label: n => n.module_groups, hint: 'Groups & communities', keywords: ['groups','communities','circles','clubs'], group: 'community', production: true },
  { id: 'channels', path: '/channels', icon: Radio, label: n => n.module_official, hint: 'Official channels', keywords: ['channels','official','broadcast','gov'], group: 'community', production: true },
  { id: 'madrasa', path: '/madrasa', icon: GraduationCap, label: n => n.module_maktab, hint: 'Schools & classrooms', keywords: ['classroom','school','learn','madrasa','maktab','study','education','teacher','student','parent','grades','attendance'], group: 'community', production: true },
  { id: 'pro', path: '/pro', icon: Briefcase, label: n => n.module_professional, hint: 'Jobs & professional', keywords: ['jobs','work','career','pro','linkedin'], group: 'community', production: true },
  { id: 'verify', path: '/verify', icon: BadgeCheck, label: n => n.module_verify, hint: 'Verification', keywords: ['verify','kyc','identity','badge'], group: 'community', production: true },
  { id: 'governance', path: '/governance', icon: Vote, label: n => n.nav_governance, hint: 'Vote & propose', keywords: ['governance','vote','poll','proposal','dao'], group: 'community', production: true },

  // LIFE ───────────────────────────────────────────────────
  { id: 'rihla', path: '/rihla', icon: Plane, label: n => n.module_travel, hint: 'Travel & trips', keywords: ['travel','rihla','trips','flights','hotels'], primary: true, group: 'life', production: true },
  { id: 'pay', path: '/pay', icon: Wallet, label: n => n.module_payments, hint: 'Wallet & transfers', keywords: ['pay','wallet','money','send','receive','tip','transfer'], primary: true, group: 'life', production: true },
  { id: 'mail', path: '/mail', icon: Mail, label: n => n.module_mail, hint: 'Encrypted mail', keywords: ['mail','email','inbox'], group: 'life', production: true },
  { id: 'id', path: '/id', icon: KeyRound, label: n => n.module_id, hint: 'Digital ID & keys', keywords: ['id','identity','passkey','keys','passport'], group: 'life', production: true },
  { id: 'maps', path: '/maps', icon: MapIcon, label: n => n.module_maps, hint: 'Maps & places', keywords: ['maps','navigation','places','directions','location'], group: 'life', production: true },
  { id: 'translate', path: '/translate', icon: Languages, label: n => n.module_translate, hint: 'Translate languages', keywords: ['translate','language','translator'], group: 'life', production: true },
  { id: 'apps', path: '/apps', icon: Grid3X3, label: n => n.nav_apps, hint: 'Mini-apps', keywords: ['apps','mini','launcher','tools'], group: 'life', production: true },
  { id: 'unique', path: '/unique', icon: Star, label: n => n.module_unique, hint: 'Signature features', keywords: ['unique','features','signature'], group: 'life', production: true },

  // AI & PRIVACY ───────────────────────────────────────────
  { id: 'mesh', path: '/mesh', icon: Compass, label: n => n.module_mesh, hint: 'Offline mesh', keywords: ['mesh','offline','bluetooth','p2p','nearby'], group: 'aiPrivacy', production: true },
  { id: 'aisafety', path: '/aisafety', icon: ShieldCheck, label: n => n.module_aisafety, hint: 'AI safety controls', keywords: ['ai safety','safety','moderation'], group: 'aiPrivacy', production: true },
  { id: 'aicore', path: '/aicore', icon: Bot, label: n => n.module_aicore, hint: 'On-device AI', keywords: ['ai','assistant','llm','core','bot'], group: 'aiPrivacy', production: true },
  { id: 'backup', path: '/backup', icon: ArchiveRestore, label: n => n.module_backup, hint: 'Encrypted backup', keywords: ['backup','restore','sync'], group: 'aiPrivacy', production: true },
  { id: 'privacy', path: '/privacy', icon: Lock, label: n => n.module_privacy, hint: 'Privacy controls', keywords: ['privacy','permissions','data'], group: 'aiPrivacy', production: true },

  // ABOUT (slim public-facing info — replaces verbose blueprint group) ───
  { id: 'covenant', path: '/covenant', icon: BadgeCheck, label: n => n.covenant, hint: 'Our covenant', keywords: ['covenant','manifesto','principles'], group: 'about', production: true },
  { id: 'vision', path: '/vision', icon: Eye, label: n => n.module_vision, hint: 'Our vision', keywords: ['vision','mission','about'], group: 'about', production: true },
  { id: 'transparency', path: '/transparency', icon: BarChart3, label: n => n.nav_transparency, hint: 'Transparency report', keywords: ['transparency','metrics','stats','report'], group: 'about', production: true },

  // EMERGENCY
  { id: 'emergency', path: '/emergency', icon: Star, label: () => 'Emergency', hint: 'Emergency SOS', keywords: ['emergency','sos','fire','ambulance','police','help','911','طوارئ'], group: 'life', production: true },
  { id: 'shield', path: '/shield', icon: ShieldCheck, label: n => n.module_shield, hint: 'Citizen Shield incident reporting', keywords: ['shield','citizen','report','police','municipal','passport','authority','witness','accountability','درع','مواطن'], group: 'life', production: true },

  // PROFILE (dock-only, never in sidebar group)
  { id: 'profile', path: '/profile', icon: User, label: () => 'Profile', hint: 'Your account', keywords: ['profile','account','me','settings'], primary: true, group: 'life', production: false },

  // INTERNAL / DEVELOPER-FACING — routed but hidden from production sidebar
  { id: 'identity', path: '/identity', icon: Sparkles, label: () => 'Brand & Names', hint: 'Internal: brand kit', keywords: ['brand','names','identity','logo'], group: 'about', production: false },
  { id: 'architecture', path: '/architecture', icon: Layers, label: n => n.module_architecture, hint: 'Internal: architecture', keywords: ['architecture','design','system'], group: 'about', production: false },
  { id: 'dre', path: '/dre', icon: Globe2, label: n => n.module_dre, hint: 'Internal: regional engine', keywords: ['dre','region','adaptation'], group: 'about', production: false },
  { id: 'techstack', path: '/techstack', icon: Cpu, label: n => n.module_techstack, hint: 'Internal: tech stack', keywords: ['tech','stack','infra'], group: 'about', production: false },
  { id: 'models', path: '/models', icon: Bot, label: n => n.module_models, hint: 'Internal: AI models', keywords: ['models','ml','llm'], group: 'about', production: false },
  { id: 'selfhost', path: '/selfhost', icon: Server, label: n => n.module_selfhost, hint: 'Internal: self-host', keywords: ['selfhost','docker','server'], group: 'about', production: false },
  { id: 'roadmap', path: '/roadmap', icon: ListChecks, label: n => n.module_roadmap, hint: 'Internal: roadmap', keywords: ['roadmap','plan','timeline'], group: 'about', production: false },
  { id: 'journeys', path: '/journeys', icon: BookOpen, label: n => n.module_journeys, hint: 'Internal: user journeys', keywords: ['journeys','stories','flows'], group: 'about', production: false },
];

export const GROUP_LABELS: Record<NavGroupKey, string> = {
  discover: 'Discover',
  pillars: 'Pillars',
  community: 'Community',
  life: 'Life',
  aiPrivacy: 'AI & Privacy',
  about: 'About',
};

/** Customer-facing items only (production = true) */
export const PRODUCTION_ITEMS = NAV_ITEMS.filter(t => t.production !== false);

/** Mobile dock primary tabs */
export const PRIMARY_TABS = NAV_ITEMS.filter(t => t.primary);

/** Grouped customer-facing items */
export const GROUPED = (() => {
  const m: Record<NavGroupKey, NavItem[]> = { discover: [], pillars: [], community: [], life: [], aiPrivacy: [], about: [] };
  for (const i of PRODUCTION_ITEMS) m[i.group].push(i);
  return m;
})();

/**
 * Resolve a NavItem from a free-text query. Used by TopBar search + AIOrb routing.
 * Search order:
 *   1. exact id match
 *   2. label contains
 *   3. hint contains
 *   4. any keyword starts-with then contains
 */
export function findNavMatch(query: string, labelOf: (item: NavItem) => string): NavItem | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  const items = NAV_ITEMS;

  const byId = items.find(i => i.id === q);
  if (byId) return byId;

  const byLabel = items.find(i => labelOf(i).toLowerCase().includes(q));
  if (byLabel) return byLabel;

  const byHint = items.find(i => i.hint.toLowerCase().includes(q));
  if (byHint) return byHint;

  const byKwPrefix = items.find(i => i.keywords.some(k => k.toLowerCase().startsWith(q)));
  if (byKwPrefix) return byKwPrefix;

  return items.find(i => i.keywords.some(k => k.toLowerCase().includes(q)));
}
