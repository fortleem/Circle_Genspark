// Circle — Sticky glass TopBar with title, locale switch, theme toggle, region
import { Sun, Moon, Bell, Search, Globe2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { CircleMark } from "@/components/brand/CircleMark";
import { NAV_ITEMS, findNavMatch } from "@/lib/tabs";
import { useState } from "react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { KNOWN_COUNTRIES } from "@/lib/dre";
import type { Lang } from "@/lib/i18n";

export function TopBar() {
  const { theme, toggleTheme, locale, setLocale, allLangs, names, country, setCountry, region } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState("");

  // Resolve current screen's display title + hint.
  // Pick the most-specific matching tab so nested paths resolve correctly.
  const current = NAV_ITEMS
    .filter(n =>
      n.path === loc.pathname ||
      (n.path !== "/" && loc.pathname.startsWith(n.path + "/"))
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
  const title = current ? current.label(names) : names.brand_name;
  const subtitle = current?.hint ?? names.tagline.slice(0, 40);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const match = findNavMatch(q, (item) => item.label(names));
    if (match) {
      nav(match.path);
      setQ("");
    }
  };

  return (
    <header className="sticky top-0 z-40 px-4 pt-[env(safe-area-inset-top)]">
      <div className="glass rounded-full mt-3 px-3 py-2 flex items-center gap-2 shadow-glass">
        <div className="flex items-center gap-2 min-w-0">
          <CircleMark size={32} />
          <div className="leading-none min-w-0">
            <div className="font-display text-base sm:text-lg truncate">{title}</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase truncate">
              {subtitle}
            </div>
          </div>
        </div>
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 mx-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Go to module… e.g. wasl, mesh, mashahd"
              className="w-full bg-muted/30 rounded-full pl-9 pr-3 py-1.5 text-xs outline-none focus:bg-muted/60 transition"
            />
          </div>
        </form>
        <div className="flex-1 lg:flex-none" />

        <button className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center transition lg:hidden" aria-label="Search">
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
                key={cc}
                onClick={() => setCountry(cc)}
                className={country === cc ? "bg-muted/50 font-semibold" : ""}
              >
                <span className="font-mono text-xs w-10">{cc}</span>
                <span className="text-xs text-muted-foreground">→ {region.country === cc ? region.region : '…'}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button onClick={toggleTheme} className="w-9 h-9 rounded-full hover:bg-muted/60 flex items-center justify-center transition" aria-label="Theme">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => nav('/profile')}
          className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-brand-charcoal relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  );
}
