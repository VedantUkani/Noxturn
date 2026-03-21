"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
  POST_ONBOARDING_DEST_KEY,
} from "@/lib/onboarding-flag";
import { cn } from "@/lib/utils";

export function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  const devPreview =
    process.env.NODE_ENV === "development" &&
    searchParams.get("preview") === "1";

  useEffect(() => {
    if (devPreview) {
      setShow(true);
      return;
    }
    if (hasCompletedOnboarding()) {
      let next = "/today";
      try {
        const s = sessionStorage.getItem(POST_ONBOARDING_DEST_KEY);
        if (s && s.startsWith("/") && !s.startsWith("//")) next = s;
        sessionStorage.removeItem(POST_ONBOARDING_DEST_KEY);
      } catch {
        /* ignore */
      }
      router.replace(next);
      router.refresh();
      return;
    }
    setShow(true);
  }, [router, devPreview]);

  if (!show) {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-3 text-center">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400/20 border-t-teal-400"
          aria-hidden
        />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  function clearPostOnboardingHint() {
    try {
      sessionStorage.removeItem(POST_ONBOARDING_DEST_KEY);
    } catch {
      /* ignore */
    }
  }

  function finish(path: string) {
    markOnboardingComplete();
    clearPostOnboardingHint();
    router.replace(path);
    router.refresh();
  }

  function onSkip() {
    let next = "/today";
    try {
      const s = sessionStorage.getItem(POST_ONBOARDING_DEST_KEY);
      if (s && s.startsWith("/") && !s.startsWith("//")) next = s;
    } catch {
      /* ignore */
    }
    finish(next);
  }

  function onContinueSchedule() {
    // Do not mark onboarding done — user may use Back from schedule to skip from welcome.
    router.replace("/schedule");
    router.refresh();
  }

  return (
    <div className="relative w-full max-w-[28rem] px-2 sm:max-w-xl sm:px-0">
      <div
        className="pointer-events-none absolute -left-1/3 -top-40 h-72 w-[140%] max-w-none rounded-full bg-teal-400/[0.14] blur-[64px] sm:-left-1/4"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 top-1/3 h-48 w-48 rounded-full bg-indigo-500/[0.08] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-[56px]"
        aria-hidden
      />

      <div
        className={cn(
          "nox-onboarding-enter relative overflow-hidden rounded-3xl border border-white/[0.1]",
          "bg-gradient-to-b from-[#172554]/[0.55] via-[#0f172a]/90 to-[#0a0f1c]/95",
          "shadow-[0_40px_80px_-32px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)_inset]",
          "backdrop-blur-xl",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_50%_-10%,rgba(45,212,191,0.16),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal-400/10 blur-2xl"
          aria-hidden
        />

        <div className="relative space-y-8 p-8 sm:space-y-9 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span
              className={cn(
                "mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5",
                "bg-gradient-to-r from-teal-500/20 to-cyan-500/15 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-100/95",
                "ring-1 ring-teal-400/30 shadow-[0_0_24px_-8px_rgba(45,212,191,0.45)]",
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.9)]"
                aria-hidden
              />
              Welcome
            </span>

            <div
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/25 to-cyan-600/10 ring-1 ring-white/10 shadow-[0_12px_40px_-16px_rgba(45,212,191,0.35)]"
              aria-hidden
            >
              <svg
                className="h-7 w-7 text-teal-200/90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>

            <h1 className="text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.125rem]">
              Welcome —{" "}
              <span className="bg-gradient-to-r from-teal-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent">
                let&apos;s line up your shifts
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-[22rem] text-pretty text-[15px] leading-relaxed text-slate-400 sm:max-w-none">
              {APP_NAME} uses your rota to shape recovery and your day. Hook up a
              calendar, drop in a file, or add blocks yourself — pick what feels
              easiest.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {[
              {
                step: "1",
                label: "Schedule",
                hint: "Bring in your blocks",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
                  />
                ),
              },
              {
                step: "2",
                label: "Week",
                hint: "See how the week flows",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h3.75a2.25 2.25 0 012.25 2.25v3.75a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM17.25 6A2.25 2.25 0 0119.5 3.75H21a2.25 2.25 0 012.25 2.25v3.75A2.25 2.25 0 0121 12h-1.5a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h3.75a2.25 2.25 0 012.25 2.25V21a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-3.75zM17.25 15.75A2.25 2.25 0 0119.5 13.5H21a2.25 2.25 0 012.25 2.25V21a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v-3.75z"
                  />
                ),
              },
              {
                step: "3",
                label: "Today",
                hint: "What matters right now",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className={cn(
                  "flex gap-3 rounded-2xl border border-slate-600/40 bg-slate-950/40 p-3.5",
                  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
                  "sm:flex-col sm:items-center sm:text-center sm:gap-2 sm:p-4",
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-200/95 ring-1 ring-teal-400/20 sm:h-11 sm:w-11">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                  >
                    {item.icon}
                  </svg>
                </div>
                <div className="min-w-0 flex-1 sm:flex-none">
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:justify-center">
                    <span className="font-mono text-[10px] text-teal-400/80">
                      {item.step}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-100">
                      {item.label}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-slate-500 sm:mt-1">
                    {item.hint}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={onContinueSchedule}
              className={cn(
                "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold outline-none transition-[transform,box-shadow,background-color] duration-200",
                "bg-gradient-to-b from-teal-300 to-teal-500 text-slate-950",
                "shadow-[0_0_0_1px_rgba(45,212,191,0.4),0_16px_40px_-14px_rgba(45,212,191,0.55)]",
                "hover:from-teal-200 hover:to-teal-400 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.55),0_20px_48px_-14px_rgba(45,212,191,0.6)]",
                "active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]",
              )}
            >
              Add my schedule
              <svg
                className="h-4 w-4 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onSkip}
              className={cn(
                "inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-2xl border border-slate-500/50 bg-slate-900/50 px-5 text-sm font-medium text-slate-200 outline-none backdrop-blur-sm transition-[border-color,background-color,color] duration-200",
                "hover:border-slate-400/60 hover:bg-slate-800/60 hover:text-white",
                "focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]",
              )}
            >
              Explore the app
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
