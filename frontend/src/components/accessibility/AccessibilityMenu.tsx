"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { nx, nxMarketing } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";
import { AccessibilityIcon } from "./AccessibilityIcon";
import { useAccessibilityPreferences } from "./AccessibilityPreferencesContext";

export type AccessibilityMenuVariant = "compact" | "comfortable";

type AccessibilityMenuProps = {
  /** `compact` — icon-only control; `comfortable` — icon + label (e.g. header). */
  variant?: AccessibilityMenuVariant;
  className?: string;
};

export function AccessibilityMenu({
  variant = "comfortable",
  className,
}: AccessibilityMenuProps) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const { fontKey, setFontKey, brightness, setBrightness, lang, setLang, reset } =
    useAccessibilityPreferences();

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const updatePanelPosition = useCallback(() => {
    const btn = triggerRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;
    const rect = btn.getBoundingClientRect();
    const margin = 8;
    const maxW = Math.min(window.innerWidth - margin * 2, 320);
    const left = Math.min(
      Math.max(margin, rect.right - maxW),
      window.innerWidth - margin - maxW,
    );
    const top = rect.bottom + margin;
    panel.style.position = "fixed";
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    panel.style.width = `${maxW}px`;
    panel.style.zIndex = "10050";
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onReposition = () => updatePanelPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const triggerClass =
    variant === "compact"
      ? nxMarketing.a11yTriggerCompact
      : nxMarketing.a11yTrigger;

  const panel = open ? (
    <div
      ref={panelRef}
      id={panelId}
      className={cn(nxMarketing.a11yPanel)}
      role="dialog"
      aria-label="Display and accessibility"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#edf2ff]">
          <AccessibilityIcon className="h-4 w-4 text-[#45e0d4]" />
          Display &amp; accessibility
        </div>
        <button
          type="button"
          onClick={close}
          className={cn(
            "rounded-xl p-1.5 text-[#98a4bf] transition-colors",
            "hover:bg-white/[0.06] hover:text-[#edf2ff]",
            nx.focusRing,
          )}
          aria-label="Close accessibility settings"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="space-y-5 p-4">
        <div>
          <p className="mb-2 text-xs font-medium text-[#7d89a6]">Text size</p>
          <div
            className="grid grid-cols-4 gap-2"
            role="radiogroup"
            aria-label="Text size"
          >
            {(["sm", "md", "lg", "xl"] as const).map((k) => {
              const selected = fontKey === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFontKey(k)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                    selected
                      ? nxMarketing.a11yOptionSelected
                      : nxMarketing.a11yOptionIdle,
                    nx.focusRing,
                  )}
                >
                  {k === "sm"
                    ? "Small"
                    : k === "md"
                      ? "Medium"
                      : k === "lg"
                        ? "Large"
                        : "Extra"}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-[#7d89a6]">
              Screen brightness
            </p>
            <span className="tabular-nums text-xs text-[#98a4bf]">
              {brightness}%
            </span>
          </div>
          <input
            type="range"
            min={60}
            max={130}
            step={5}
            value={brightness}
            onChange={(e) =>
              setBrightness(Number.parseInt(e.target.value, 10))
            }
            className="h-2 w-full cursor-pointer accent-[#45e0d4]"
            aria-valuemin={60}
            aria-valuemax={130}
            aria-valuenow={brightness}
            aria-label="Adjust brightness of this page"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-[#7d89a6]">Language</p>
          <div className="space-y-2" role="radiogroup" aria-label="Language">
            {(
              [
                { id: "en" as const, label: "English" },
                { id: "es" as const, label: "Español" },
                { id: "zh" as const, label: "中文" },
              ] as const
            ).map((row) => (
              <label
                key={row.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-[#98a4bf] transition-colors hover:bg-white/[0.04]"
              >
                <input
                  type="radio"
                  name={`${baseId}-lang`}
                  checked={lang === row.id}
                  onChange={() => setLang(row.id)}
                  className="accent-[#45e0d4]"
                />
                {row.label}
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className={cn(
            "w-full rounded-2xl border border-dashed border-white/[0.12] py-2.5 text-sm font-medium text-[#7d89a6] transition-colors",
            "hover:border-white/[0.2] hover:bg-white/[0.03] hover:text-[#98a4bf]",
            nx.focusRing,
          )}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerClass, nx.focusRing)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={
          variant === "compact"
            ? "Display and accessibility settings"
            : undefined
        }
      >
        <AccessibilityIcon
          className={cn(
            "h-[18px] w-[18px] shrink-0 text-[#45e0d4]/90 transition-colors group-hover:text-[#45e0d4]",
            variant === "compact" && "h-[19px] w-[19px]",
          )}
        />
        {variant === "comfortable" ? (
          <span className="hidden sm:inline">Accessibility</span>
        ) : null}
      </button>

      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </div>
  );
}
