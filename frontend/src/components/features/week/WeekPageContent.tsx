"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { episodeTouchesDay } from "@/lib/week-timeline-math";
import { useWeekInjuryMapData } from "@/hooks/useWeekInjuryMapData";
import { WeekPageHeader } from "./WeekPageHeader";
import { WeeklySummaryCard } from "./WeeklySummaryCard";
import { WeeklyScheduleRiskPanel } from "./WeeklyScheduleRiskPanel";
import { DayDetailCard } from "./DayDetailCard";
import { RecoveryWindowCard } from "./RecoveryWindowCard";

export function WeekPageContent() {
  const router = useRouter();
  const { phase, data, errorMsg } = useWeekInjuryMapData();

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Auto-select first day once data arrives
  useEffect(() => {
    if (!data || data.days.length === 0) return;
    if (selectedDayKey === null) setSelectedDayKey(data.days[0]!.dayKey);
  }, [data, selectedDayKey]);

  const selectedDayColumn = useMemo(
    () => data?.days.find((d) => d.dayKey === selectedDayKey) ?? null,
    [data, selectedDayKey],
  );

  const episodesForDay = useMemo(() => {
    if (!selectedDayKey || !data) return [];
    return data.episodes.filter((e) =>
      episodeTouchesDay(e.startTime, e.endTime, selectedDayKey),
    );
  }, [data, selectedDayKey]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#45e0d4]/20 border-t-[#45e0d4]" />
        </div>
        <p className="text-sm text-[#98a4bf]">Analysing your week…</p>
      </div>
    );
  }

  // ── Empty (no schedule uploaded yet) ─────────────────────────────────────
  if (phase === "empty") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#141f42] shadow-[0_0_32px_-8px_rgba(69,224,212,0.15)]">
          <span className="text-3xl" aria-hidden>📅</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#edf2ff]">No schedule yet</h2>
          <p className="max-w-sm text-sm leading-relaxed text-[#7d89a6]">
            Upload your shift roster to see your 7-day circadian risk map,
            strain score, and recovery windows.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/onboard")}
            className="rounded-xl bg-[#45e0d4]/15 px-6 py-2.5 text-sm font-semibold text-[#45e0d4] transition hover:bg-[#45e0d4]/25"
          >
            Upload Schedule
          </button>
          <button
            type="button"
            onClick={() => router.push("/today")}
            className="rounded-xl border border-white/[0.1] px-6 py-2.5 text-sm font-medium text-[#7d89a6] transition hover:border-white/[0.2] hover:text-[#edf2ff]"
          >
            Go to Today
          </button>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-[#f87171]">
          {errorMsg ?? "Could not load week risk data."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-white/[0.12] px-5 py-2 text-xs font-medium text-[#edf2ff] transition hover:border-white/[0.2]"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────
  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 pb-16 md:space-y-12 md:pb-20">
      <WeekPageHeader />

      <WeeklySummaryCard data={data} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="min-w-0 lg:col-span-8">
          <WeeklyScheduleRiskPanel
            data={data}
            selectedDayKey={selectedDayKey}
            onSelectDay={setSelectedDayKey}
          />
        </div>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-6">
            <DayDetailCard day={selectedDayColumn} episodesForDay={episodesForDay} />
          </div>
        </div>
      </div>

      {data.recoveryWindowLine ? (
        <RecoveryWindowCard line={data.recoveryWindowLine} />
      ) : null}
    </div>
  );
}
