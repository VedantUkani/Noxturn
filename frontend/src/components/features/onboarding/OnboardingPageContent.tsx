"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { POST_ONBOARDING_DEST_KEY } from "@/lib/onboarding-flag";
import { nxMarketing } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

function IconShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      />
    </svg>
  );
}

function IconActivity({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconZap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: IconShield,
    title: "4-Risk Detection",
    desc: "Detects rapid flips, short turnarounds, low recovery windows, and unsafe drive events in your shift schedule.",
  },
  {
    Icon: IconActivity,
    title: "AI Recovery Plans",
    desc: "Rule-based and Claude AI planners generate personalised task schedules grounded in clinical circadian evidence.",
  },
  {
    Icon: IconZap,
    title: "Research-backed",
    desc: "Plans draw on clinical sleep and circadian science so steps stay credible and actionable.",
  },
  {
    Icon: IconMoon,
    title: "Wearable Sync",
    desc: "Import sleep hours, restlessness, and resting HR to calculate your recovery score and rhythm status.",
  },
  {
    Icon: IconShield,
    title: "Persona-Aware",
    desc: "Plans adapt to your role — nurse, paramedic, or factory worker — with tone and priorities matched to your context.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Import your shifts",
    desc: "Paste a schedule, add manually, or connect Google/Outlook Calendar.",
  },
  {
    n: "02",
    title: "Detect risk episodes",
    desc: "The engine scans for 4 circadian risk patterns and calculates your strain score.",
  },
  {
    n: "03",
    title: "Get your recovery plan",
    desc: "A clinical task schedule is generated — rule-based or via Claude AI with RAG.",
  },
  {
    n: "04",
    title: "Track & adapt",
    desc: "Mark tasks done, log sleep data, and the plan proactively re-optimises.",
  },
] as const;

export function OnboardingPageContent() {
  const [postDest, setPostDest] = useState("/today");

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(POST_ONBOARDING_DEST_KEY);
      if (s && s.startsWith("/") && !s.startsWith("//")) setPostDest(s);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-0">
      <div id="page-root" className="text-[#edf2ff]">
        <section className="relative overflow-hidden pb-20 text-center sm:pb-24">
          <div className={nxMarketing.heroGlow} aria-hidden />
          <div className="relative z-[1] px-4 sm:px-6 md:px-8">
            <div className={cn("mx-auto mb-8 max-w-2xl", nxMarketing.pill)}>
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#45e0d4]" />
              Built for healthcare & shift workers
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem] lg:leading-[1.06]">
              <span className="gradient-text block">Recover smarter</span>
              <span className="mt-2 block text-[#edf2ff] sm:mt-3">
                between your shifts.
              </span>
            </h1>
            <p className="mx-auto mb-12 mt-8 max-w-2xl text-lg leading-relaxed text-[#98a4bf] sm:mt-9 sm:text-xl sm:leading-relaxed">
              Noxturn detects circadian risk in your shift schedule and builds an
              AI-powered recovery plan backed by clinical evidence — so you can
              protect your sleep, safety, and health.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/onboard" className={nxMarketing.primaryCtaLg}>
                Start onboarding →
              </Link>
              <Link href={postDest} className={nxMarketing.secondaryCta}>
                Open dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className={cn(nxMarketing.sectionBand, "py-10 sm:py-12")}>
          <div
            className={cn(
              nxMarketing.contentWide,
              "grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10",
            )}
          >
            {[
              ["4", "Risk detectors"],
              ["12", "Intervention cards"],
              ["10", "Clinical sources"],
              ["3", "Shift personas"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className={nxMarketing.statNumber}>{num}</div>
                <div className="mt-1.5 text-xs text-[#7d89a6]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={cn(nxMarketing.contentWide, "py-20 sm:py-24")}>
          <p className={nxMarketing.eyebrow}>Features</p>
          <h2 className={cn("mb-12 max-w-2xl", nxMarketing.heading2)}>
            Everything you need to recover well
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const I = f.Icon;
              return (
                <div key={f.title} className={nxMarketing.featureCard}>
                  <div className={nxMarketing.featureIcon}>
                    <I className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-[#edf2ff]">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#98a4bf]">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className={cn(nxMarketing.sectionBand, "py-20 sm:py-24")}>
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8">
            <p className={nxMarketing.eyebrow}>How it works</p>
            <h2 className={cn("mb-12 max-w-xl", nxMarketing.heading2)}>
              Four steps to better recovery
            </h2>
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-start gap-5">
                  <div className={nxMarketing.stepWatermark}>{s.n}</div>
                  <div
                    className={cn(
                      "flex-1",
                      i < STEPS.length - 1 && "border-b border-white/[0.06] pb-6",
                    )}
                  >
                    <h3 className="mb-1 text-sm font-semibold text-[#edf2ff]">
                      {s.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#98a4bf]">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(nxMarketing.contentNarrow, "py-24 text-center sm:py-28")}>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#edf2ff]">
            Ready to start?
          </h2>
          <p className="mb-10 text-[#98a4bf]">
            Import your schedule in under 2 minutes and get a clinically-grounded
            recovery plan.
          </p>
          <Link
            href="/onboard"
            className={cn(nxMarketing.primaryCtaLg, "px-8 py-3.5")}
          >
            Start now — it&apos;s free ›
          </Link>
        </section>

        <footer className={nxMarketing.footer}>
          Noxturn — Adaptive recovery for rotating shift teams
        </footer>
      </div>
    </div>
  );
}
