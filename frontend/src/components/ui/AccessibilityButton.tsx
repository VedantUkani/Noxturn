"use client";

import { useState, useEffect, useRef } from "react";
import { useA11y, type FontSize } from "@/contexts/AccessibilityContext";
import { LANGUAGE_LABELS, type Language } from "@/lib/translations";

const FONT_SIZES: FontSize[] = ["sm", "md", "lg", "xl"];
const LANGUAGES: Language[]  = ["en", "es", "zh"];

function A11yIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4" r="1.5"/>
      <path d="M6 8h12"/>
      <path d="M12 8v13"/>
      <path d="M8 21l4-5 4 5"/>
    </svg>
  );
}

/** Inline header button + dropdown panel — place anywhere in a header/nav */
export function AccessibilityButton() {
  const { fontSize, brightness, language, setFontSize, setBrightness, setLanguage, reset, t } = useA11y();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const fontLabels: Record<FontSize, string> = {
    sm: t("a11y", "fontSm"),
    md: t("a11y", "fontMd"),
    lg: t("a11y", "fontLg"),
    xl: t("a11y", "fontXl"),
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("a11y", "label")}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={[
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
          "border focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2",
          open
            ? "bg-indigo-600/20 border-indigo-600/50 text-indigo-300"
            : "bg-slate-800/60 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800 hover:border-slate-600",
        ].join(" ")}
      >
        <A11yIcon />
        <span className="hidden sm:inline">{t("a11y", "label")}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Invisible backdrop for mobile */}
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />

          <div
            role="dialog"
            aria-label={t("a11y", "label")}
            className={[
              "absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl",
              "bg-slate-900 border border-slate-700 shadow-2xl shadow-black/60",
              "animate-slide-up",
            ].join(" ")}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <A11yIcon />
                {t("a11y", "label")}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("actions", "close")}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="px-4 py-4 space-y-5">

              {/* Font size */}
              <section aria-labelledby="ab-font-label">
                <p id="ab-font-label" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  {t("a11y", "fontSize")}
                </p>
                <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-labelledby="ab-font-label">
                  {FONT_SIZES.map((id) => (
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
                      <span className={[
                        "font-bold leading-none select-none",
                        id === "sm" ? "text-xs" : id === "md" ? "text-sm" : id === "lg" ? "text-base" : "text-lg",
                      ].join(" ")}>A</span>
                      <span className="text-[9px] leading-none">{fontLabels[id]}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Brightness */}
              <section aria-labelledby="ab-brightness-label">
                <div className="flex items-center justify-between mb-2.5">
                  <p id="ab-brightness-label" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("a11y", "brightness")}
                  </p>
                  <span className="text-xs font-bold text-slate-200 tabular-nums">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={60} max={130} step={5}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  aria-label={t("a11y", "brightness")}
                  aria-valuemin={60} aria-valuemax={130} aria-valuenow={brightness}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>60%</span><span>130%</span>
                </div>
              </section>

              {/* Language */}
              <section aria-labelledby="ab-lang-label">
                <p id="ab-lang-label" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  {t("a11y", "language")}
                </p>
                <div className="space-y-1.5" role="radiogroup" aria-labelledby="ab-lang-label">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Reset */}
              <button
                onClick={reset}
                className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors"
              >
                {t("a11y", "reset")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
