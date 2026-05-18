import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { ALL_LANGS, getNames, isRTL, type Lang, type NameMatrix } from "@/lib/i18n";
import { configFor, type RegionConfig } from "@/lib/dre";

type Theme = "light" | "dark";

interface AppCtx {
  theme: Theme;
  toggleTheme: () => void;
  locale: Lang;
  setLocale: (l: Lang) => void;
  toggleLocale: () => void;
  dir: "ltr" | "rtl";
  country: string;
  setCountry: (c: string) => void;
  names: NameMatrix;
  region: RegionConfig;
  allLangs: typeof ALL_LANGS;
}

const Ctx = createContext<AppCtx | null>(null);

const LOCALE_KEY = "circle-locale";
const THEME_KEY = "circle-theme";
const COUNTRY_KEY = "circle-country";

function detectInitialLocale(): Lang {
  if (typeof window === "undefined") return "en-BRAND";
  const saved = localStorage.getItem(LOCALE_KEY);
  if (saved) return saved as Lang;
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("de")) return "de";
  if (nav.startsWith("it")) return "it";
  return "en-BRAND";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem(THEME_KEY) as Theme) || "dark";
  });
  const [locale, setLocaleState] = useState<Lang>(detectInitialLocale);
  const [country, setCountryState] = useState<string>(() => {
    if (typeof window === "undefined") return "EG";
    return localStorage.getItem(COUNTRY_KEY) || "EG";
  });

  // Effects: persist + apply to <html>
  useEffect(() => {
    const r = document.documentElement;
    r.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const r = document.documentElement;
    r.lang = locale;
    r.dir = isRTL(locale) ? "rtl" : "ltr";
    localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem(COUNTRY_KEY, country);
  }, [country]);

  const names = useMemo(() => getNames(locale), [locale]);
  const region = useMemo(() => configFor(country), [country]);

  const setLocale = (l: Lang) => setLocaleState(l);
  const setCountry = (c: string) => setCountryState(c.toUpperCase());
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleLocale = () => {
    const codes = ALL_LANGS.map((l) => l.code);
    const idx = codes.indexOf(locale);
    setLocaleState(codes[(idx + 1) % codes.length] as Lang);
  };

  return (
    <Ctx.Provider
      value={{
        theme, toggleTheme,
        locale, setLocale, toggleLocale,
        dir: isRTL(locale) ? "rtl" : "ltr",
        country, setCountry,
        names, region,
        allLangs: ALL_LANGS,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}
