"use client";

import { useTodayDashboardContext } from "@/contexts/TodayDashboardContext";
import { DashboardTaskSections } from "./DashboardTaskSections";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { PlanUpdateBanner } from "./PlanUpdateBanner";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function readinessColor(score: number) {
  if (score >= 70) return { bar: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-400/20" };
  if (score >= 40) return { bar: "bg-amber-400",   text: "text-amber-400",   border: "border-amber-400/20"   };
  return              { bar: "bg-rose-400",     text: "text-rose-400",     border: "border-rose-400/20"     };
}

export function TodayDashboardView() {
  const d = useTodayDashboardContext();

  const detailTask =
    d.detailTaskId === null
      ? null
      : d.tasks.find((t) => t.id === d.detailTaskId) ?? null;

  const readiness = Math.min(100, Math.max(0, d.vitals.readinessScore));
  const { bar, text, border } = readinessColor(readiness);
  const pendingCount = d.tasks.filter(
    (t) => t.status === "planned" || t.status === "snoozed",
  ).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 lg:gap-7">

      {/* Banner */}
      {d.banner ? (
        <PlanUpdateBanner
          message={d.banner.message}
          why={d.banner.why}
          tone={d.banner.tone ?? "strong"}
          onDismiss={d.dismissPlanBanner}
        />
      ) : null}

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#45e0d4]">
            Today
          </p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#edf2ff]">
            {todayLabel()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 ? (
            <span className="rounded-full border border-[#45e0d4]/25 bg-[#45e0d4]/10 px-3 py-1 text-xs font-semibold text-[#45e0d4]">
              {pendingCount} pending
            </span>
          ) : null}
          <div className={cn("flex items-baseline gap-1 rounded-2xl border px-4 py-2", border, "bg-[#141f42]")}>
            <span className={cn("text-2xl font-bold tabular-nums", text)}>{readiness}</span>
            <span className="text-xs text-[#7d89a6]">/ 100</span>
          </div>
        </div>
      </div>

      {/* Readiness bar */}
      <div
        className="-mt-3 h-[3px] w-full overflow-hidden rounded-full bg-[#0d1833]"
        role="progressbar"
        aria-valuenow={readiness}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", bar)}
          style={{ width: `${readiness}%` }}
        />
      </div>

      {/* ── Top row: Next action (8/12) + Vitals (4/12) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-7">

        {/* Next best action */}
        <section className={cn("relative overflow-hidden lg:col-span-8", nx.card, "p-6")}>
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#45e0d4]/[0.06] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-[#86c9ff]/[0.04] blur-2xl"
            aria-hidden
          />

          <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-[#45e0d4]">
            {d.nextBest.eyebrow}
          </p>

          <h2 className="relative mt-2 text-lg font-bold leading-snug tracking-tight text-[#edf2ff]">
            {d.nextBest.titleLine1}
            {d.nextBest.titleLine2 ? (
              <span className="text-[#45e0d4]"> {d.nextBest.titleLine2}</span>
            ) : null}
          </h2>

          {d.nextBest.body ? (
            <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-[#7d89a6]">
              {d.nextBest.body}
            </p>
          ) : null}

          {d.heroChangeHint ? (
            <p className="relative mt-1.5 text-xs text-[#86c9ff]/70">
              {d.heroChangeHint}
            </p>
          ) : null}

          <div className="relative mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={d.startNextBest}
              className={cn(nx.primaryButton, "h-9 px-5 text-xs")}
            >
              {d.nextBest.primaryCta}
            </button>
            <button
              type="button"
              onClick={d.remindNextBest}
              className="h-9 rounded-2xl border border-white/[0.12] bg-[#101c3c]/90 px-5 text-xs font-medium text-[#edf2ff] transition hover:border-white/[0.2] hover:bg-[#141f42]"
            >
              {d.nextBest.secondaryCta}
            </button>
          </div>
        </section>

        {/* Recovery vitals */}
        <section className={cn("flex flex-col justify-between lg:col-span-4", nx.card, "p-5")}>
          <div>
            <p className={cn(nx.labelUpper, "mb-3")}>Recovery</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums text-[#edf2ff]">
                {d.vitals.hrv}
              </span>
              <span className="text-sm text-[#7d89a6]">
                {d.vitals.metricLabel ?? "HRV ms"}
              </span>
            </div>
            {d.vitals.message ? (
              <p className="mt-3 text-xs leading-relaxed text-[#7d89a6]">
                {d.vitals.message}
              </p>
            ) : null}
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7d89a6]">Readiness</span>
              <span className={cn("font-semibold tabular-nums", text)}>{readiness}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#0d1833]">
              <div
                className={cn("h-full rounded-full transition-[width] duration-700", bar)}
                style={{ width: `${readiness}%` }}
              />
            </div>
            {d.vitals.liveSync ? (
              <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#45e0d4]/80">
                Live sync active
              </p>
            ) : (
              <p className="pt-1 text-[10px] uppercase tracking-[0.1em] text-[#3a4560]">
                Sync paused
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ── Tasks ── */}
      <section>
        <p className={cn(nx.labelUpper, "mb-4")}>Tasks</p>
        <DashboardTaskSections />
      </section>

      {/* ── Plan highlights — 2-col mobile / 4-col desktop, driven by schedule ── */}
      {d.recommendations.length > 0 ? (
        <section>
          <p className={cn(nx.labelUpper, "mb-4")}>Plan highlights</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {d.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={cn(nx.card, "flex flex-col gap-1.5 p-4 sm:p-5")}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#45e0d4]">
                  {rec.title}
                </p>
                <p className="text-sm font-bold leading-snug text-[#edf2ff] sm:text-base">
                  {rec.value}
                </p>
                <p className="line-clamp-3 text-xs leading-relaxed text-[#7d89a6]">
                  {rec.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── What to avoid ── */}
      {d.avoid.length > 0 ? (
        <section className={cn(nx.card, "border-amber-500/[0.18] bg-amber-500/[0.03] p-5")}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-400/80">
            Avoid today
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {d.avoid.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                <div>
                  <p className="text-sm font-semibold text-[#edf2ff]">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#7d89a6]">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <TaskDetailSheet
        task={detailTask}
        open={d.detailTaskId !== null}
        onClose={d.closeTaskDetail}
      />
    </div>
  );
}
