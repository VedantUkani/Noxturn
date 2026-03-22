"use client";

import { useEffect, useState } from "react";
import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { strainScoreHue, WEEK_RISK_TITLES } from "@/components/week/week-risk-meta";
import { cn } from "@/lib/utils";

type WeeklySummaryCardProps = {
  data: Pick<
    CircadianInjuryMapData,
    "weekLabel" | "circadianStrainScore" | "topRisks"
  >;
  className?: string;
};

/** Single friendly line: how the week is expected to feel, from the score band. */
function weekOutlookLine(score: number): string {
  if (score >= 80) {
    return "Expect a demanding week for your body clock — fatigue can stack quickly unless you protect sleep and recovery on purpose.";
  }
  if (score >= 55) {
    return "This week sits in a solid strain band — you’ll feel it, but steady sleep timing and lighter loads between shifts still help a lot.";
  }
  if (score >= 35) {
    return "Overall the week looks moderate — pressure shows up in patches rather than all week long.";
  }
  return "This stretch looks relatively forgiving — keep good sleep habits, especially around any night shifts.";
}

function strainStrokeColor(score: number): string {
  if (score < 35) return "#45e0d4";
  if (score < 60) return "#fcd34d";
  if (score < 80) return "#fb923c";
  return "#fb7185";
}

function StrainRing({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const targetDash = c * pct;
  const [dash, setDash] = useState(0);
  const stroke = strainStrokeColor(score);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDash(targetDash);
      return;
    }
    const id = requestAnimationFrame(() => setDash(targetDash));
    return () => cancelAnimationFrame(id);
  }, [targetDash]);

  return (
    <div
      className="relative mx-auto h-[156px] w-[156px] shrink-0 lg:mx-0"
      role="img"
      aria-label={`Circadian strain ${score} out of 100`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-[0.35] blur-2xl"
        style={{ background: `radial-gradient(circle, ${stroke}55 0%, transparent 70%)` }}
        aria-hidden
      />
      <svg
        className="relative h-full w-full -rotate-90"
        viewBox="0 0 120 120"
        aria-hidden
      >
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="9"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-[1.1s] motion-safe:ease-out"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-[2.35rem] font-semibold leading-none tabular-nums tracking-tight sm:text-[2.6rem]",
            strainScoreHue(score),
          )}
        >
          {score}
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7d89a6]">
          of 100
        </span>
      </div>
    </div>
  );
}

export function WeeklySummaryCard({ data, className }: WeeklySummaryCardProps) {
  const score = data.circadianStrainScore;
  const outlook = weekOutlookLine(score);
  const highlights = data.topRisks.slice(0, 3);

  return (
    <section
      aria-labelledby="week-summary-title"
      className={cn(
        "rounded-[22px] border border-white/[0.07] bg-gradient-to-br from-[#141f42] via-[#121c3d] to-[#101c3c] p-6 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.9)] sm:p-8",
        className,
      )}
    >
      <header className="border-b border-white/[0.12] pb-4">
        <h2
          id="week-summary-title"
          className="text-left text-lg font-semibold tracking-tight text-[#edf2ff] sm:text-xl"
        >
          Summary of this week
        </h2>
        <p className="mt-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
          {data.weekLabel}
        </p>
      </header>

      {/* Fixed side tracks + fluid centre; shared vertical centre; visible dividers */}
      <div className="mt-5 grid grid-cols-1 gap-8 lg:mt-5 lg:grid-cols-[172px_minmax(0,1fr)_minmax(0,220px)] lg:items-center lg:gap-0">
        {/* 1 — Ring: left-aligned with title block */}
        <div className="flex items-center justify-center lg:justify-start lg:pr-5">
          <StrainRing score={score} />
        </div>

        {/* 2 — Outlook: snug to ring; text anchored start */}
        <div className="flex min-w-0 items-center border-white/[0.08] lg:border-l lg:border-white/[0.14] lg:pl-6 lg:pr-6">
          <p className="w-full max-w-xl text-center text-[15px] font-medium leading-relaxed text-[#c5cee0] lg:text-left">
            {outlook}
          </p>
        </div>

        {/* 3 — Reasons: fixed width band, vertically centred with siblings */}
        <div
          className="flex min-w-0 flex-col justify-center border-white/[0.08] lg:border-l lg:border-white/[0.14] lg:pl-6 lg:pr-0"
          aria-label="Top reasons for this week’s strain"
        >
          <p className="mb-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
            Why it feels like this
          </p>
          {highlights.length === 0 ? (
            <p className="text-left text-sm leading-snug text-[#98a4bf]">
              No major pressures flagged this week.
            </p>
          ) : (
            <ul className="space-y-1.5 text-left">
              {highlights.map((r, i) => (
                <li
                  key={`${r.label}-${i}`}
                  className="text-sm font-medium leading-snug text-[#45e0d4]"
                >
                  {WEEK_RISK_TITLES[r.label]}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
