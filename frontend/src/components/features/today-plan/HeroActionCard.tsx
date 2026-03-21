"use client";

import { cn } from "@/lib/utils";
import { todayCardShell } from "./today-surfaces";

export type HeroActionCardProps = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  /** Shown after meaningful replans — concise, non-judgmental. */
  changeHint?: string | null;
  className?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onEvidenceClick?: () => void;
};

export function HeroActionCard({
  eyebrow,
  titleLine1,
  titleLine2,
  body,
  primaryCta,
  secondaryCta,
  changeHint,
  className,
  onPrimaryClick,
  onSecondaryClick,
  onEvidenceClick,
}: HeroActionCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-[#0c1220] p-6 md:p-7 lg:p-8",
        todayCardShell,
        className,
      )}
    >
      {/* Soft teal wash */}
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-teal-400/[0.06] blur-3xl"
        aria-hidden
      />
      {/* Crescent / moon accent */}
      <div
        className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full border-[10px] border-teal-400/20 shadow-[0_0_60px_-10px_rgba(45,212,191,0.35)] md:h-52 md:w-52 md:border-[12px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-2 top-4 h-32 w-32 rounded-full bg-[#0a1020]/90 blur-xl md:right-6 md:top-6"
        aria-hidden
      />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300/90">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-lg text-[1.65rem] font-bold leading-[1.14] tracking-tight text-white md:mt-4 md:text-4xl md:leading-[1.1]">
          {titleLine1}
          <br />
          <span className="bg-gradient-to-r from-teal-200 to-cyan-300 bg-clip-text text-transparent">
            {titleLine2}
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400/95 md:mt-5 md:text-[15px] md:leading-relaxed">
          {body}
        </p>
        {changeHint ? (
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-teal-200/70 md:text-[13px]">
            {changeHint}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
          <button
            type="button"
            onClick={onPrimaryClick}
            className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-teal-400 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_24px_-8px_rgba(45,212,191,0.5)] transition-colors hover:bg-teal-300 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b14]"
          >
            {primaryCta}
          </button>
          <button
            type="button"
            onClick={onSecondaryClick}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-600/75 bg-slate-950/45 px-5 text-sm font-medium text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors hover:border-slate-500/90 hover:bg-slate-800/55 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b14]"
          >
            {secondaryCta}
          </button>
          {onEvidenceClick ? (
            <button
              type="button"
              onClick={onEvidenceClick}
              className="text-xs font-medium text-teal-300/85 underline-offset-4 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b14] sm:ml-1"
            >
              Evidence lens
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
