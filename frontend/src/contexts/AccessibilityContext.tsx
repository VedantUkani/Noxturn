"use client";

import {
  createContext, useContext, useEffect, useState,
  type ReactNode,
} from "react";
import { TRANSLATIONS, type Language } from "@/lib/translations";

export type FontSize = "sm" | "md" | "lg" | "xl";

type AccessibilityState = {
  fontSize:   FontSize;
  brightness: number;   // 60 – 130  (100 = normal)
  language:   Language;
};

type AccessibilityCtx = AccessibilityState & {
  setFontSize:   (s: FontSize) => void;
  setBrightness: (b: number)   => void;
  setLanguage:   (l: Language) => void;
  reset:         () => void;
  t:             <S extends keyof typeof TRANSLATIONS["en"]>(
                   section: S,
                   key: keyof typeof TRANSLATIONS["en"][S],
                 ) => string;
};

const DEFAULTS: AccessibilityState = {
  fontSize:   "md",
  brightness: 100,
  language:   "en",
};

const STORAGE_KEY = "noxturn_a11y";

const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "13px",
  md: "15px",
  lg: "17px",
  xl: "19px",
};

const Ctx = createContext<AccessibilityCtx | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(DEFAULTS);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch { /* ignore */ }
  }, []);

  // Persist whenever state changes
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  // Apply font-size to <html>
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_PX[state.fontSize];
  }, [state.fontSize]);

  // Apply lang attribute
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  function setFontSize(fontSize: FontSize)   { setState((s) => ({ ...s, fontSize })); }
  function setBrightness(brightness: number) { setState((s) => ({ ...s, brightness: Math.min(130, Math.max(60, brightness)) })); }
  function setLanguage(language: Language)   { setState((s) => ({ ...s, language })); }
  function reset()                           { setState(DEFAULTS); }

  function t<S extends keyof typeof TRANSLATIONS["en"]>(
    section: S,
    key: keyof typeof TRANSLATIONS["en"][S],
  ): string {
    const lang = TRANSLATIONS[state.language] ?? TRANSLATIONS.en;
    const sec  = lang[section] as Record<string, string>;
    return (sec?.[key as string] ?? (TRANSLATIONS.en[section] as Record<string, string>)[key as string] ?? String(key));
  }

  return (
    <Ctx.Provider value={{ ...state, setFontSize, setBrightness, setLanguage, reset, t }}>
      {/* Brightness wrapper — wraps all page content */}
      <div
        style={{
          filter: state.brightness !== 100 ? `brightness(${state.brightness}%)` : undefined,
          minHeight: "100vh",
          transition: "filter 0.2s ease",
        }}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function useA11y(): AccessibilityCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useA11y must be used inside <AccessibilityProvider>");
  return ctx;
}
