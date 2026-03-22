export const FONT_REM = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
} as const;

export type FontScaleKey = keyof typeof FONT_REM;

export type AccessibilityLang = "en" | "es" | "zh";

const K_FONT = "noxturn_a11y_font";
const K_BRIGHT = "noxturn_a11y_brightness";
const K_LANG = "noxturn_a11y_lang";

function readStorage<T>(key: string, fallback: T, parse: (s: string) => T | null): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const v = parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

export function loadFontKey(): FontScaleKey {
  return readStorage(
    K_FONT,
    "md",
    (s) => (s === "sm" || s === "md" || s === "lg" || s === "xl" ? s : null),
  );
}

export function saveFontKey(k: FontScaleKey): void {
  writeStorage(K_FONT, k);
}

export function loadBrightness(): number {
  return readStorage(K_BRIGHT, 100, (s) => {
    const n = Number.parseInt(s, 10);
    if (Number.isFinite(n) && n >= 60 && n <= 130) return n;
    return null;
  });
}

export function saveBrightness(n: number): void {
  writeStorage(K_BRIGHT, String(n));
}

export function loadLang(): AccessibilityLang {
  return readStorage(
    K_LANG,
    "en",
    (s) => (s === "en" || s === "es" || s === "zh" ? s : null),
  );
}

export function saveLang(l: AccessibilityLang): void {
  writeStorage(K_LANG, l);
}
