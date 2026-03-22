"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FONT_REM,
  type AccessibilityLang,
  type FontScaleKey,
  loadBrightness,
  loadFontKey,
  loadLang,
  saveBrightness,
  saveFontKey,
  saveLang,
} from "./accessibility-preferences";

export type AccessibilityPreferences = {
  fontKey: FontScaleKey;
  setFontKey: (k: FontScaleKey) => void;
  brightness: number;
  setBrightness: (n: number) => void;
  lang: AccessibilityLang;
  setLang: (l: AccessibilityLang) => void;
  reset: () => void;
};

const AccessibilityPreferencesContext =
  createContext<AccessibilityPreferences | null>(null);

export function AccessibilityPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [fontKey, setFontKeyState] = useState<FontScaleKey>("md");
  const [brightness, setBrightnessState] = useState(100);
  const [lang, setLangState] = useState<AccessibilityLang>("en");

  useEffect(() => {
    setFontKeyState(loadFontKey());
    setBrightnessState(loadBrightness());
    setLangState(loadLang());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang =
      lang === "en" ? "en" : lang === "es" ? "es" : "zh-Hans";
  }, [lang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.fontSize = FONT_REM[fontKey];
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [fontKey]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.filter =
      brightness === 100 ? "" : `brightness(${brightness}%)`;
    return () => {
      document.documentElement.style.filter = "";
    };
  }, [brightness]);

  const setFontKey = useCallback((k: FontScaleKey) => {
    setFontKeyState(k);
    saveFontKey(k);
  }, []);

  const setBrightness = useCallback((n: number) => {
    setBrightnessState(n);
    saveBrightness(n);
  }, []);

  const setLang = useCallback((l: AccessibilityLang) => {
    setLangState(l);
    saveLang(l);
  }, []);

  const reset = useCallback(() => {
    setFontKeyState("md");
    setBrightnessState(100);
    setLangState("en");
    saveFontKey("md");
    saveBrightness(100);
    saveLang("en");
  }, []);

  const value = useMemo(
    () => ({
      fontKey,
      setFontKey,
      brightness,
      setBrightness,
      lang,
      setLang,
      reset,
    }),
    [brightness, fontKey, lang, reset, setBrightness, setFontKey, setLang],
  );

  return (
    <AccessibilityPreferencesContext.Provider value={value}>
      {children}
    </AccessibilityPreferencesContext.Provider>
  );
}

export function useAccessibilityPreferences(): AccessibilityPreferences {
  const ctx = useContext(AccessibilityPreferencesContext);
  if (!ctx) {
    throw new Error(
      "useAccessibilityPreferences must be used within AccessibilityPreferencesProvider",
    );
  }
  return ctx;
}
