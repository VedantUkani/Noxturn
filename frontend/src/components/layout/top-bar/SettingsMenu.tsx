"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCog } from "@/components/icons/NavIcons";
import { clearAuthenticated } from "@/lib/auth-browser";
import { cn } from "@/lib/utils";

const iconBtnClass =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#98a4bf] transition-colors duration-200 ease-out hover:bg-white/[0.06] hover:text-[#edf2ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45";

const PANEL_Z = 200;
const SCRIM_Z = PANEL_Z - 1;
const TRANSITION_MS = 320;

const linkRowClass =
  "block w-full border-b border-white/[0.06] px-4 py-3.5 text-left text-[#edf2ff] transition-colors duration-200 hover:bg-white/[0.04] focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#45e0d4]/40";

export function SettingsMenu() {
  const router = useRouter();
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

  function signOut() {
    closeWithAnimation();
    clearAuthenticated();
    router.replace("/");
    router.refresh();
  }

  const portal =
    showOverlay && mounted ? (
      <div className="fixed inset-0" style={{ zIndex: SCRIM_Z }}>
        <button
          type="button"
          className={cn(
            "absolute inset-0 cursor-default bg-[#020617] transition-opacity duration-300 ease-out motion-reduce:transition-none",
            entered ? "opacity-[0.85]" : "opacity-0",
          )}
          aria-label="Close settings"
          onClick={closeWithAnimation}
        />
        <div
          id="noxturn-settings-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          className={cn(
            "absolute max-h-[min(80vh,480px)] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_32px_64px_-12px_rgba(0,0,0,1)] transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
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
              Settings
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#98a4bf]">
              Workspace and session — profile, preferences, and sign out.
            </p>
          </div>
          <nav
            className="overflow-y-auto overscroll-contain pb-1"
            style={{ backgroundColor: "#141f42" }}
            aria-label="Settings links"
          >
            <Link
              href="/settings"
              className={linkRowClass}
              style={{ backgroundColor: "#141f42" }}
              onClick={closeWithAnimation}
            >
              <span className="text-sm font-semibold text-[#edf2ff]">
                Workspace &amp; recovery
              </span>
              <span className="mt-1 block text-[12px] leading-snug text-[#98a4bf]">
                Profile, sleep, wearables, and privacy.
              </span>
            </Link>
            <div className="mx-4 my-3 h-px bg-white/[0.08]" aria-hidden />
            <button
              type="button"
              className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-xl border border-rose-900/50 bg-rose-950/25 px-4 py-2.5 text-left text-sm font-medium text-rose-100/90 transition-colors hover:border-rose-800/60 hover:bg-rose-950/40 focus-visible:outline focus-visible:ring-2 focus-visible:ring-rose-400/35"
              onClick={signOut}
            >
              Sign out
            </button>
          </nav>
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
          aria-controls="noxturn-settings-panel"
          aria-label="Open settings"
          className={cn(
            iconBtnClass,
            showOverlay && "bg-white/[0.08] text-[#45e0d4]",
          )}
        >
          <IconCog className="h-[18px] w-[18px]" />
        </button>
      </div>
      {mounted && portal ? createPortal(portal, document.body) : null}
    </>
  );
}
