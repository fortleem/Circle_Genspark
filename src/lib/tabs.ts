// Circle — full navigation map per blueprint (31 modules across 6 groups)
import {
  Home, MessageCircle, Play, Image as ImageIcon, Hash, Plane, Wallet, User,
  Users as UsersIcon, Radio, Briefcase, GraduationCap, Sparkles, ShieldCheck,
  Bot, Mail, KeyRound, Map as MapIcon, Languages, Grid3X3, Star, ArchiveRestore,
  Lock, Vote, BarChart3, BadgeCheck, BookOpen, Layers, Server, ListChecks,
  Compass, Cpu, Globe2, Eye
} from "lucide-react";
import type { NameMatrix } from "@/lib/i18n";

export type NavGroupKey = 'discover' | 'pillars' | 'community' | 'life' | 'aiPrivacy' | 'openSource';

export interface NavItem {
  id: string;
  path: string;
  icon: any;
  /** function that returns label for current locale's NameMatrix */
  label: (n: NameMatrix) => string;
  /** the blueprint section(s) this implements */
  sections: string;
  /** is this a primary mobile-dock tab? */
  primary?: boolean;
  group: NavGroupKey;
}

export const NAV_ITEMS: NavItem[] = [
  // DISCOVER ────────────────────────────────────────────────────────────────
  { id: 'home',         path: '/',             icon: Home,         label: n => n.nav_home,          sections: '§5',  primary: true, group: 'discover' },
  { id: 'covenant',     path: '/covenant',     icon: BadgeCheck,   label: n => n.covenant,          sections: '§1',  group: 'discover' },
  { id: 'vision',       path: '/vision',       icon: Eye,          label: n => n.module_vision,     sections: '§1',  group: 'discover' },
  { id: 'identity',     path: '/identity',     icon: Sparkles,     label: n => 'Brand & Names',     sections: '§2',  group: 'discover' },

  // FOUR PILLARS ────────────────────────────────────────────────────────────
  { id: 'wasl',         path: '/wasl',         icon: MessageCircle,label: n => n.module_chat,       sections: '§6',  primary: true, group: 'pillars' },
  { id: 'mashahd',      path: '/mashahd',      icon: Play,         label: n => n.module_video,      sections: '§7',  primary: true, group: 'pillars' },
  { id: 'lamahat',      path: '/lamahat',      icon: ImageIcon,    label: n => n.module_photos,     sections: '§8',  primary: true, group: 'pillars' },
  { id: 'midan',        path: '/midan',        icon: Hash,         label: n => n.module_square,     sections: '§9',  primary: true, group: 'pillars' },

  // COMMUNITY ───────────────────────────────────────────────────────────────
  { id: 'circles',      path: '/circles',      icon: UsersIcon,    label: n => n.module_groups,     sections: '§10', group: 'community' },
  { id: 'channels',     path: '/channels',     icon: Radio,        label: n => n.module_official,   sections: '§11+§13', group: 'community' },
  { id: 'maktab',       path: '/maktab',       icon: GraduationCap,label: n => n.module_maktab,     sections: '§12', group: 'community' },
  { id: 'pro',          path: '/pro',          icon: Briefcase,    label: n => n.module_professional, sections: '§14', group: 'community' },
  { id: 'verify',       path: '/verify',       icon: BadgeCheck,   label: n => n.module_verify,     sections: '§16', group: 'community' },
  { id: 'governance',   path: '/governance',   icon: Vote,         label: n => n.nav_governance,    sections: '§29', group: 'community' },

  // LIFE ───────────────────────────────────────────────────────────────────
  { id: 'rihla',        path: '/rihla',        icon: Plane,        label: n => n.module_travel,     sections: '§22', primary: true, group: 'life' },
  { id: 'pay',          path: '/pay',          icon: Wallet,       label: n => n.module_payments,   sections: '§19', primary: true, group: 'life' },
  { id: 'mail',         path: '/mail',         icon: Mail,         label: n => n.module_mail,       sections: '§20', group: 'life' },
  { id: 'id',           path: '/id',           icon: KeyRound,     label: n => n.module_id,         sections: '§21', group: 'life' },
  { id: 'maps',         path: '/maps',         icon: MapIcon,      label: n => n.module_maps,       sections: '§23', group: 'life' },
  { id: 'translate',    path: '/translate',    icon: Languages,    label: n => n.module_translate,  sections: '§24', group: 'life' },
  { id: 'apps',         path: '/apps',         icon: Grid3X3,      label: n => n.nav_apps,          sections: '§25', group: 'life' },
  { id: 'unique',       path: '/unique',       icon: Star,         label: n => n.module_unique,     sections: '§26', group: 'life' },

  // AI & PRIVACY ───────────────────────────────────────────────────────────
  { id: 'mesh',         path: '/mesh',         icon: Compass,      label: n => n.module_mesh,       sections: '§15', group: 'aiPrivacy' },
  { id: 'aisafety',     path: '/aisafety',     icon: ShieldCheck,  label: n => n.module_aisafety,   sections: '§17', group: 'aiPrivacy' },
  { id: 'aicore',       path: '/aicore',       icon: Bot,          label: n => n.module_aicore,     sections: '§18', group: 'aiPrivacy' },
  { id: 'backup',       path: '/backup',       icon: ArchiveRestore, label: n => n.module_backup,   sections: '§27', group: 'aiPrivacy' },
  { id: 'privacy',      path: '/privacy',      icon: Lock,         label: n => n.module_privacy,    sections: '§28', group: 'aiPrivacy' },

  // OPEN SOURCE ────────────────────────────────────────────────────────────
  { id: 'architecture', path: '/architecture', icon: Layers,       label: n => n.module_architecture, sections: '§3', group: 'openSource' },
  { id: 'dre',          path: '/dre',          icon: Globe2,       label: n => n.module_dre,        sections: '§4',  group: 'openSource' },
  { id: 'techstack',    path: '/techstack',    icon: Cpu,          label: n => n.module_techstack,  sections: '§31', group: 'openSource' },
  { id: 'models',       path: '/models',       icon: Bot,          label: n => n.module_models,     sections: '§32', group: 'openSource' },
  { id: 'selfhost',     path: '/selfhost',     icon: Server,       label: n => n.module_selfhost,   sections: '§33', group: 'openSource' },
  { id: 'roadmap',      path: '/roadmap',      icon: ListChecks,   label: n => n.module_roadmap,    sections: '§34', group: 'openSource' },
  { id: 'transparency', path: '/transparency', icon: BarChart3,    label: n => n.nav_transparency,  sections: '§30', group: 'openSource' },
  { id: 'journeys',     path: '/journeys',     icon: BookOpen,     label: n => n.module_journeys,   sections: '§35', group: 'openSource' },
  { id: 'profile',      path: '/profile',      icon: User,         label: () => 'Profile',          sections: '§21', primary: true, group: 'life' },
];

export const GROUP_LABELS: Record<NavGroupKey, string> = {
  discover:   'Discover',
  pillars:    'Four Pillars',
  community:  'Community',
  life:       'Life',
  aiPrivacy:  'AI & Privacy',
  openSource: 'Open Source',
};

export const PRIMARY_TABS = NAV_ITEMS.filter(t => t.primary);
export const GROUPED = (() => {
  const m: Record<NavGroupKey, NavItem[]> = { discover: [], pillars: [], community: [], life: [], aiPrivacy: [], openSource: [] };
  for (const i of NAV_ITEMS) m[i.group].push(i);
  return m;
})();
