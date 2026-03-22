"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { IconBell } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

const iconBtnClass =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#98a4bf] transition-colors duration-200 ease-out hover:bg-white/[0.06] hover:text-[#edf2ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45";

type FeedItem = {
  id: string;
  kind: "update" | "notice";
  title: string;
  body: string;
  time: string;
};

const DEMO_FEED: FeedItem[] = [
  {
    id: "1",
    kind: "update",
    title: "Plan refreshed",
    body: "Near-term timing can shift when recovery or tasks change — your dashboard reflects the latest mix.",
    time: "Just now",
  },
  {
    id: "2",
    kind: "notice",
    title: "Demo signals",
    body: "Wearable and schedule data are optional here; you’re seeing sample recovery context until the API is connected.",
    time: "Today",
  },
  {
    id: "3",
    kind: "update",
    title: "Week map",
    body: "Circadian risk tiles update when your saved roster changes.",
    time: "Earlier",
  },
];

const PANEL_Z = 200;
const SCRIM_Z = PANEL_Z - 1;
/** Matches Tailwind duration-300 + small buffer before unmount */
const TRANSITION_MS = 320;

export function NotificationsUpdatesMenu() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 64, right: 16 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePanelPosition = () => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    setPanelPos({
      top: r.bottom + gap,
      right: Math.max(16, window.innerWidth - r.right),
    });
  };

  useLayoutEffect(() => {
    if (!showOverlay) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [showOverlay]);

  useEffect(() => {
    if (!showOverlay) {
      setEntered(false);
      return;
    }
    setEntered(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [showOverlay]);

  const closeWithAnimation = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setEntered(false);
    closeTimerRef.current = setTimeout(() => {
      setShowOverlay(false);
      closeTimerRef.current = null;
    }, TRANSITION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showOverlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWithAnimation();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showOverlay, closeWithAnimation]);

  useEffect(() => {
    if (!showOverlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showOverlay]);

  const unreadCount = DEMO_FEED.length;

  const toggle = () => {
    if (showOverlay) {
      closeWithAnimation();
    } else {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setShowOverlay(true);
    }
  };

  const portal =
    showOverlay && mounted ? (
      <div className="fixed inset-0" style={{ zIndex: SCRIM_Z }}>
        <button
          type="button"
          className={cn(
            "absolute inset-0 cursor-default bg-[#020617] transition-opacity duration-300 ease-out motion-reduce:transition-none",
            entered ? "opacity-[0.85]" : "opacity-0",
          )}
          aria-label="Close notifications"
          onClick={closeWithAnimation}
        />
        <div
          id="noxturn-notifications-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications and updates"
          className={cn(
            "absolute max-h-[min(72vh,440px)] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_32px_64px_-12px_rgba(0,0,0,1)] transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
            entered
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-2 scale-[0.98] opacity-0",
          )}
          style={{
            zIndex: PANEL_Z,
            top: panelPos.top,
            right: panelPos.right,
            backgroundColor: "#141f42",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="border-b border-white/[0.08] px-4 py-3.5"
            style={{ backgroundColor: "#101c3c" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#45e0d4]">
              Notifications &amp; updates
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#98a4bf]">
              Product nudges and plan-related notes stay here — calm, no spam.
            </p>
          </div>
          <ul
            className="max-h-[min(56vh,360px)] divide-y divide-white/[0.06] overflow-y-auto overscroll-contain"
            style={{ backgroundColor: "#141f42" }}
          >
            {DEMO_FEED.map((item) => (
              <li
                key={item.id}
                className="px-4 py-4 transition-colors duration-200 hover:bg-white/[0.04]"
                style={{ backgroundColor: "#141f42" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-[#edf2ff]">
                    {item.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      item.kind === "update"
                        ? "bg-[#45e0d4]/20 text-[#edf2ff] ring-1 ring-[#45e0d4]/35"
                        : "bg-[#101c3c] text-[#98a4bf] ring-1 ring-white/[0.08]",
                    )}
                  >
                    {item.kind === "update" ? "Update" : "Notice"}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#98a4bf]">
                  {item.body}
                </p>
                <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6]">
                  {item.time}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          aria-expanded={showOverlay}
          aria-haspopup="dialog"
          aria-controls="noxturn-notifications-panel"
          aria-label={`Notifications and updates, ${unreadCount} items`}
          className={cn(
            iconBtnClass,
            showOverlay && "bg-white/[0.08] text-[#45e0d4]",
          )}
        >
          <IconBell className="h-[18px] w-[18px]" />
          {unreadCount > 0 ? (
            <span
              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#45e0d4] shadow-[0_0_10px_rgba(69,224,212,0.55)]"
              aria-hidden
            />
          ) : null}
        </button>
      </div>
      {mounted && portal ? createPortal(portal, document.body) : null}
    </>
  );
}
