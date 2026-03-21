"use client";

import { useState, useEffect } from "react";
import { useA11y, type FontSize } from "@/contexts/AccessibilityContext";
import { LANGUAGE_LABELS, type Language } from "@/lib/translations";

const FONT_SIZES: { id: FontSize; icon: string }[] = [
  { id: "sm", icon: "A" },
  { id: "md", icon: "A" },
  { id: "lg", icon: "A" },
  { id: "xl", icon: "A" },
];

const FONT_CLASSES: Record<FontSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

const LANGUAGES: Language[] = ["en", "es", "zh"];

// Accessibility icon — person with arms extended
function A11yIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="4" r="1.5" />
      <path d="M6 8h12" />
      <path d="M12 8v13" />
      <path d="M8 21l4-5 4 5" />
    </svg>
  );
}

export function AccessibilityPanel() {
  const { fontSize, brightness, language, setFontSize, setBrightness, setLanguage, reset, t } = useA11y();
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("a11y", "label")}
        aria-expanded={open}
        className={[
          "fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full border transition-all duration-200",
          "flex items-center justify-center shadow-lg",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2",
          open
            ? "bg-indigo-600 border-indigo-500 text-white shadow-indigo-900/40"
            : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-600 hover:bg-slate-800",
        ].join(" ")}
      >
        <A11yIcon size={18} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label={t("a11y", "label")}
        aria-modal="true"
        className={[
          "fixed bottom-20 left-6 z-50 w-72 rounded-2xl",
          "bg-slate-900 border border-slate-700 shadow-2xl shadow-black/50",
          "transition-all duration-250 origin-bottom-left",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <A11yIcon size={15} />
            {t("a11y", "label")}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
            aria-label={t("actions", "close")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-4 py-4 space-y-5">

          {/* ── Font size ── */}
          <section aria-labelledby="a11y-font-label">
            <p id="a11y-font-label" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              {t("a11y", "fontSize")}
            </p>
            <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-labelledby="a11y-font-label">
              {FONT_SIZES.map(({ id }) => {
                const labels: Record<FontSize, string> = {
                  sm: t("a11y", "fontSm"),
                  md: t("a11y", "fontMd"),
                  lg: t("a11y", "fontLg"),
                  xl: t("a11y", "fontXl"),
                };
                return (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={fontSize === id}
                    onClick={() => setFontSize(id)}
                    className={[
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all duration-150",
                      fontSize === id
                        ? "bg-indigo-600/30 border-indigo-600 text-indigo-300"
                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200",
                    ].join(" ")}
                  >
                    <span className={`font-bold leading-none select-none ${FONT_CLASSES[id]}`}>
                      A
                    </span>
                    <span className="text-[9px] leading-none">{labels[id]}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Brightness ── */}
          <section aria-labelledby="a11y-brightness-label">
            <div className="flex items-center justify-between mb-2.5">
              <p id="a11y-brightness-label" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t("a11y", "brightness")}
              </p>
              <span className="text-xs font-bold text-slate-200 tabular-nums">{brightness}%</span>
            </div>
            {/* Track + thumb */}
            <input
              type="range"
              min={60}
              max={130}
              step={5}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              aria-label={t("a11y", "brightness")}
              aria-valuemin={60}
              aria-valuemax={130}
              aria-valuenow={brightness}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>60%</span>
              <span>|</span>
              <span>130%</span>
            </div>
          </section>

          {/* ── Language ── */}
          <section aria-labelledby="a11y-lang-label">
            <p id="a11y-lang-label" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              {t("a11y", "language")}
            </p>
            <div className="space-y-1.5" role="radiogroup" aria-labelledby="a11y-lang-label">
              {LANGUAGES.map((lang) => {
                const { flag, label } = LANGUAGE_LABELS[lang];
                return (
                  <button
                    key={lang}
                    role="radio"
                    aria-checked={language === lang}
                    onClick={() => setLanguage(lang)}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150",
                      language === lang
                        ? "bg-indigo-600/20 border-indigo-700/60 text-slate-100"
                        : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200",
                    ].join(" ")}
                  >
                    <span className="text-lg leading-none" aria-hidden="true">{flag}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {language === lang && (
                      <span className="ml-auto text-indigo-400" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Reset ── */}
          <button
            onClick={reset}
            className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors"
          >
            {t("a11y", "reset")}
          </button>
        </div>
      </div>
    </>
  );
}
