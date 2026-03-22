"use client";

import { useTodayDashboardContext } from "@/contexts/TodayDashboardContext";
import { DashboardTaskSections } from "./DashboardTaskSections";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { PlanUpdateBanner } from "./PlanUpdateBanner";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";
import { USER_PROFILE_SETTINGS_STORAGE_KEY } from "@/lib/user-profile-settings";

function isFitbitConnected(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(USER_PROFILE_SETTINGS_STORAGE_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw) as { fitbitConnected?: boolean };
    return p.fitbitConnected === true;
  } catch {
    return false;
  }
}

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

function readinessStatus(score: number): { label: string; hint: string } {
  if (score >= 70) return { label: "Good",  hint: "Ready to train hard" };
  if (score >= 40) return { label: "Fair",  hint: "Take it easy today" };
  return                   { label: "Low",   hint: "Focus on rest" };
}

export function TodayDashboardView() {
  const d = useTodayDashboardContext();

  const detailTask =
    d.detailTaskId === null
      ? null
      : d.tasks.find((t) => t.id === d.detailTaskId) ?? null;

  const wearableConnected = isFitbitConnected();
  const readiness = Math.min(100, Math.max(0, d.vitals.readinessScore));
  const { bar, text, border } = readinessColor(readiness);
  const status = readinessStatus(readiness);
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
          {wearableConnected && (
            <div className={cn("flex flex-col items-end rounded-2xl border px-4 py-2", border, "bg-[#141f42]")}>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-bold tabular-nums", text)}>{readiness}</span>
                <span className="text-xs text-[#7d89a6]">/ 100</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7d89a6]">Readiness</span>
            </div>
          )}
        </div>
      </div>

      {/* Readiness bar — only shown when wearable is connected */}
      {wearableConnected && (
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
      )}

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
            Do this now
          </p>

          <h2 className="relative mt-2 text-xl font-bold leading-snug tracking-tight text-[#edf2ff]">
            {d.nextBest.titleLine1}
            {d.nextBest.titleLine2 ? (
              <span className="text-[#45e0d4]"> {d.nextBest.titleLine2}</span>
            ) : null}
          </h2>

          <div className="relative mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={d.startNextBest}
              className={cn(nx.primaryButton, "h-9 px-5 text-xs")}
            >
              {d.nextBest.primaryCta}
            </button>
          </div>
        </section>

        {/* Recovery vitals */}
        <section className={cn("flex flex-col justify-between lg:col-span-4", nx.card, "p-5")}>
          <div>
            <p className={cn(nx.labelUpper, "mb-3")}>Body Status</p>

            {wearableConnected ? (
              <>
                {/* Status badge */}
                <div className={cn("mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
                  readiness >= 70 ? "bg-emerald-400/10 text-emerald-400" :
                  readiness >= 40 ? "bg-amber-400/10 text-amber-400" :
                  "bg-rose-400/10 text-rose-400"
                )}>
                  <span className={cn("h-2 w-2 rounded-full", bar)} />
                  {status.label}
                </div>

                <p className="text-sm text-[#7d89a6]">{status.hint}</p>

                {/* HRV */}
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold tabular-nums text-[#edf2ff]">{d.vitals.hrv}</span>
                  <span className="text-xs text-[#7d89a6]">HRV</span>
                </div>
                <p className="text-[10px] text-[#3a4560]">heart rate variability</p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#0d1833]">
                  <svg className="h-5 w-5 text-[#3a4560]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#5c6a85]">No wearable connected</p>
                <p className="mt-1 text-[11px] text-[#3a4560]">Connect Fitbit in Settings to see live HRV &amp; readiness</p>
              </div>
            )}
          </div>

          {wearableConnected && (
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
            </div>
          )}
        </section>
      </div>

      {/* ── Tasks ── */}
      <section>
        <p className={cn(nx.labelUpper, "mb-4")}>Tasks</p>
        <DashboardTaskSections />
      </section>

      {/* ── Plan highlights ── */}
      {d.recommendations.length > 0 ? (
        <section>
          <div className="mb-4 flex items-baseline gap-3">
            <p className={nx.labelUpper}>Today&apos;s Targets</p>
            <p className="text-xs text-[#7d89a6]">key numbers to hit today</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {d.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={cn(nx.card, "flex flex-col gap-1 p-4 sm:p-5")}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#45e0d4]">
                  {rec.title}
                </p>
                <p className="text-lg font-bold leading-snug text-[#edf2ff]">
                  {rec.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── What to avoid ── */}
      {d.avoid.length > 0 ? (
        <section className={cn(nx.card, "border-amber-500/[0.18] bg-amber-500/[0.03] p-5")}>
          <div className="mb-4 flex items-baseline gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-400/80">
              Skip Today
            </p>
            <p className="text-xs text-[#7d89a6]">things to leave out of today&apos;s training</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {d.avoid.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1.5 text-sm font-medium text-amber-300"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" aria-hidden />
                {item.title}
              </span>
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
