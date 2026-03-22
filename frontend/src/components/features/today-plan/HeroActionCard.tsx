"use client";

import { cn } from "@/lib/utils";
import { todayCardShell, todayFocusRing } from "./today-surfaces";

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
}: HeroActionCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#141f42] via-[#101c3c] to-[#0c1734] p-6 md:p-7 lg:p-8",
        todayCardShell,
        className,
      )}
    >
      {/* Soft teal wash */}
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[#45e0d4]/[0.07] blur-3xl"
        aria-hidden
      />
      {/* Crescent / moon accent */}
      <div
        className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full border-[10px] border-[#45e0d4]/20 shadow-[0_0_60px_-10px_rgba(69,224,212,0.35)] md:h-52 md:w-52 md:border-[12px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-2 top-4 h-32 w-32 rounded-full bg-[#04112d]/80 blur-xl md:right-6 md:top-6"
        aria-hidden
      />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#45e0d4]">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-lg text-[1.65rem] font-bold leading-[1.14] tracking-tight text-[#edf2ff] md:mt-4 md:text-4xl md:leading-[1.1]">
          {titleLine1}
          <br />
          <span className="bg-gradient-to-r from-[#a8fff7] to-[#86c9ff] bg-clip-text text-transparent">
            {titleLine2}
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#98a4bf] md:mt-5 md:text-[15px] md:leading-relaxed">
          {body}
        </p>
        {changeHint ? (
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-[#86c9ff]/90 md:text-[13px]">
            {changeHint}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
          <button
            type="button"
            onClick={onPrimaryClick}
            className={cn(
              "inline-flex h-11 min-w-[10rem] items-center justify-center rounded-2xl bg-[#45e0d4] px-5 text-sm font-bold text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.55)] transition hover:brightness-105",
              todayFocusRing,
            )}
          >
            {primaryCta}
          </button>
          <button
            type="button"
            onClick={onSecondaryClick}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-2xl border border-white/[0.12] bg-[#101c3c]/90 px-5 text-sm font-medium text-[#edf2ff] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition hover:border-white/[0.18] hover:bg-[#141f42]",
              todayFocusRing,
            )}
          >
            {secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
}
