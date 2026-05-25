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
  /** is this a primary mobile-dock tab? */
  primary?: boolean;
  group: NavGroupKey;
  /** show in the customer-facing production sidebar (false = route still works, just hidden) */
  production?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // DISCOVER ───────────────────────────────────────────────
  { id: 'home', path: '/', icon: Home, label: n => n.nav_home, primary: true, group: 'discover', production: true },

  // FOUR PILLARS ───────────────────────────────────────────
  { id: 'wasl', path: '/wasl', icon: MessageCircle,label: n => n.module_chat, primary: true, group: 'pillars', production: true },
  { id: 'mashahd', path: '/mashahd', icon: Play, label: n => n.module_video, primary: true, group: 'pillars', production: true },
  { id: 'lamahat', path: '/lamahat', icon: ImageIcon, label: n => n.module_photos, primary: true, group: 'pillars', production: true },
  { id: 'midan', path: '/midan', icon: Hash, label: n => n.module_square, primary: true, group: 'pillars', production: true },

  // COMMUNITY ──────────────────────────────────────────────
  { id: 'circles', path: '/circles', icon: UsersIcon, label: n => n.module_groups, group: 'community', production: true },
  { id: 'channels', path: '/channels', icon: Radio, label: n => n.module_official, group: 'community', production: true },
  { id: 'maktab', path: '/maktab', icon: GraduationCap,label: n => n.module_maktab, group: 'community', production: true },
  { id: 'pro', path: '/pro', icon: Briefcase, label: n => n.module_professional, group: 'community', production: true },
  { id: 'verify', path: '/verify', icon: BadgeCheck, label: n => n.module_verify, group: 'community', production: true },
  { id: 'governance', path: '/governance', icon: Vote, label: n => n.nav_governance, group: 'community', production: true },

  // LIFE ───────────────────────────────────────────────────
  { id: 'rihla', path: '/rihla', icon: Plane, label: n => n.module_travel, primary: true, group: 'life', production: true },
  { id: 'pay', path: '/pay', icon: Wallet, label: n => n.module_payments, primary: true, group: 'life', production: true },
  { id: 'mail', path: '/mail', icon: Mail, label: n => n.module_mail, group: 'life', production: true },
  { id: 'id', path: '/id', icon: KeyRound, label: n => n.module_id, group: 'life', production: true },
  { id: 'maps', path: '/maps', icon: MapIcon, label: n => n.module_maps, group: 'life', production: true },
  { id: 'translate', path: '/translate', icon: Languages, label: n => n.module_translate, group: 'life', production: true },
  { id: 'apps', path: '/apps', icon: Grid3X3, label: n => n.nav_apps, group: 'life', production: true },
  { id: 'unique', path: '/unique', icon: Star, label: n => n.module_unique, group: 'life', production: true },

  // AI & PRIVACY ───────────────────────────────────────────
  { id: 'mesh', path: '/mesh', icon: Compass, label: n => n.module_mesh, group: 'aiPrivacy', production: true },
  { id: 'aisafety', path: '/aisafety', icon: ShieldCheck, label: n => n.module_aisafety, group: 'aiPrivacy', production: true },
  { id: 'aicore', path: '/aicore', icon: Bot, label: n => n.module_aicore, group: 'aiPrivacy', production: true },
  { id: 'backup', path: '/backup', icon: ArchiveRestore, label: n => n.module_backup, group: 'aiPrivacy', production: true },
  { id: 'privacy', path: '/privacy', icon: Lock, label: n => n.module_privacy, group: 'aiPrivacy', production: true },

  // ABOUT (slim public-facing info — replaces verbose blueprint group) ───
  { id: 'covenant', path: '/covenant', icon: BadgeCheck, label: n => n.covenant, group: 'about', production: true },
  { id: 'vision', path: '/vision', icon: Eye, label: n => n.module_vision, group: 'about', production: true },
  { id: 'transparency', path: '/transparency', icon: BarChart3, label: n => n.nav_transparency, group: 'about', production: true },

  // PROFILE (dock-only, never in sidebar group)
  { id: 'profile', path: '/profile', icon: User, label: () => 'Profile', primary: true, group: 'life', production: false },

  // INTERNAL / DEVELOPER-FACING — routed but hidden from production sidebar
  { id: 'identity', path: '/identity', icon: Sparkles, label: () => 'Brand & Names', group: 'about', production: false },
  { id: 'architecture', path: '/architecture', icon: Layers, label: n => n.module_architecture, group: 'about', production: false },
  { id: 'dre', path: '/dre', icon: Globe2, label: n => n.module_dre, group: 'about', production: false },
  { id: 'techstack', path: '/techstack', icon: Cpu, label: n => n.module_techstack, group: 'about', production: false },
  { id: 'models', path: '/models', icon: Bot, label: n => n.module_models, group: 'about', production: false },
  { id: 'selfhost', path: '/selfhost', icon: Server, label: n => n.module_selfhost, group: 'about', production: false },
  { id: 'roadmap', path: '/roadmap', icon: ListChecks, label: n => n.module_roadmap, group: 'about', production: false },
  { id: 'journeys', path: '/journeys', icon: BookOpen, label: n => n.module_journeys, group: 'about', production: false },
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
