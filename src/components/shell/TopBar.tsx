// Cirkle — Sticky glass TopBar with title, locale switch, theme toggle, region,
// notifications bell with live unread badge + command-palette shortcut hint.
import { Sun, Moon, Bell, Search, Globe2, Command } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { CirkleMark } from "@/components/brand/CircleMark";
import { NAV_ITEMS, findNavMatch } from "@/lib/tabs";
import { useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { KNOWN_COUNTRIES } from "@/lib/dre";
import type { Lang } from "@/lib/i18n";
import { apiGet, type NotificationCounts } from "@/lib/api";
import { NotificationsInbox } from "@/components/shell/NotificationsInbox";
import { MeshStatusChip } from "@/components/shell/MeshStatusChip";

import { getMe } from "@/lib/session";
const ME = getMe();

export function TopBar() {
  const { theme, toggleTheme, locale, setLocale, allLangs, names, country, setCountry, region } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState("");
  const [showInbox, setShowInbox] = useState(false);
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, high: 0 });

  // Resolve current screen's display title + hint.
  const current = NAV_ITEMS
    .filter(n =>
      n.path === loc.pathname ||
      (n.path !== "/" && loc.pathname.startsWith(n.path + "/"))
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
  const title = current ? current.label(names) : names.brand_name;
  const subtitle = current?.hint ?? names.tagline.slice(0, 40);

  // Live notification-count polling (low frequency: every 25s).
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await apiGet<{ counts: NotificationCounts }>(`/notifications/${ME}?unread=1`);
        if (!cancelled && r.counts) setCounts(r.counts);
      } catch { /* silent */ }
    };
    tick();
    const t = setInterval(tick, 25000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  // Re-tick on inbox close (mark-all-read reflects immediately).
  useEffect(() => {
    if (!showInbox) {
      apiGet<{ counts: NotificationCounts }>(`/notifications/${ME}?unread=1`)
        .then((r) => r.counts && setCounts(r.counts))
        .catch(() => { /* silent */ });
    }
  }, [showInbox]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const match = findNavMatch(q, (item) => item.label(names));
    if (match) {
      nav(match.path);
      setQ("");
    }
  };

  const openPalette = () => {
    // Programmatic ⌘K trigger — synthesize the keyboard event for the palette listener.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <>
      <header className="sticky top-0 z-40 px-4 pt-[env(safe-area-inset-top)]">
        <div className="glass rounded-full mt-3 px-3 py-2 flex items-center gap-2 shadow-glass">
          <div className="flex items-center gap-2 min-w-0">
            <CirkleMark size={32} />
            <div className="leading-none min-w-0">
              <div className="font-display text-base sm:text-lg truncate">{title}</div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase truncate">
                {subtitle}
              </div>
            </div>
          </div>
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 mx-3 max-w-md">
            <button
              type="button"
              onClick={openPalette}
              className="relative w-full bg-muted/30 hover:bg-muted/50 rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition flex items-center text-start"
              aria-label="Open command palette"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70" />
              <span className="text-muted-foreground flex-1">Search anything — chats, videos, posts, places…</span>
              <span className="gold-stroke text-[9px] uppercase ms-2 hidden xl:inline-flex">
                <Command className="w-2.5 h-2.5" /> K
              </span>
            </button>
          </form>
          <div className="flex-1 lg:flex-none" />

          {/* Mobile search opens palette directly */}
          <button
            onClick={openPalette}
            className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center transition lg:hidden"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Locale switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center transition relative" aria-label="Language">
              <span className="text-[10px] font-mono uppercase">{locale === 'en-BRAND' ? 'EN★' : locale}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allLangs.map(l => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLocale(l.code as Lang)}
                  className={`${locale === l.code ? 'bg-muted/50 font-semibold' : ''}`}
                >
                  <span className="text-xs font-mono uppercase w-12 text-muted-foreground">{l.code}</span>
                  <span>{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Region/DRE picker */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center transition" aria-label="Region">
              <Globe2 className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>
                Region — {region.country} · <span className="text-secondary">{region.region}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {KNOWN_COUNTRIES.map(cc => (
                <DropdownMenuItem
                  key={cc.code}
                  onClick={() => setCountry(cc.code)}
                  className={country === cc.code ? "bg-muted/50 font-semibold" : ""}
                >
                  <span className="w-6">{cc.flag}</span>
                  <span className="font-mono text-xs w-8">{cc.code}</span>
                  <span className="text-xs text-muted-foreground truncate">{cc.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cirkle-unique Live Mesh Chip — exposes the whole mesh, not just one online dot */}
          <div className="hidden md:flex">
            <MeshStatusChip />
          </div>

          <button onClick={toggleTheme} className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center transition" aria-label="Theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications bell — opens NotificationsInbox sheet, shows live unread badge */}
          <button
            onClick={() => setShowInbox(true)}
            className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-brand-charcoal relative"
            aria-label={`Notifications · ${counts.unread} unread`}
          >
            <Bell className="w-4 h-4" />
            {counts.unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[9px] font-mono font-bold flex items-center justify-center text-white shadow-soft">
                {counts.unread > 99 ? "99+" : counts.unread}
              </span>
            )}
            {counts.high > 0 && (
              <span className="signal-dot absolute -bottom-0.5 -right-0.5" data-state="mesh" />
            )}
          </button>
        </div>
      </header>

      <NotificationsInbox open={showInbox} onClose={() => setShowInbox(false)} />
    </>
  );
}
