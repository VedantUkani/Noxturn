"use client";

import { useEffect, useMemo, useState } from "react";
import { buildDemoWeekInjuryMap } from "@/lib/mocks/week-injury-map-mock";
import { episodeTouchesDay } from "@/lib/week-timeline-math";
import { WeeklyRiskSummary } from "@/components/week/WeeklyRiskSummary";
import { WeeklyTopDangers } from "@/components/week/WeeklyTopDangers";
import { WeeklyTimeline } from "@/components/week/WeeklyTimeline";
import { DayContextPanel } from "@/components/week/DayContextPanel";

function weekStartDateFromKey(weekStartDayKey: string): Date {
  const [y, m, d] = weekStartDayKey.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function WeekPageContent() {
  const data = useMemo(() => buildDemoWeekInjuryMap(), []);
  const weekStart = useMemo(
    () => weekStartDateFromKey(data.weekStartDayKey),
    [data.weekStartDayKey],
  );

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (data.days.length === 0) return;
    if (selectedDayKey === null) {
      setSelectedDayKey(data.days[0]!.dayKey);
    }
  }, [data.days, selectedDayKey]);

  const selectedDayColumn = useMemo(
    () => data.days.find((d) => d.dayKey === selectedDayKey) ?? null,
    [data.days, selectedDayKey],
  );

  const episodesForDay = useMemo(() => {
    if (!selectedDayKey) return [];
    return data.episodes.filter((e) =>
      episodeTouchesDay(e.startTime, e.endTime, selectedDayKey),
    );
  }, [data.episodes, selectedDayKey]);

  useEffect(() => {
    if (!selectedDayKey) return;
    const inDay = data.episodes.filter((e) =>
      episodeTouchesDay(e.startTime, e.endTime, selectedDayKey),
    );
    setSelectedEpisodeId((prev) => {
      if (prev && inDay.some((e) => e.id === prev)) return prev;
      return inDay[0]?.id ?? null;
    });
  }, [selectedDayKey, data.episodes]);

  return (
    <div className="w-full space-y-12 pb-16 md:space-y-16 md:pb-20">
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d89a6]">
          Week overview
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#edf2ff] sm:text-[1.75rem] sm:leading-tight">
          Circadian injury map
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-[#98a4bf]">
          One read of how your rota stresses recovery — then use{" "}
          <span className="font-medium text-[#edf2ff]">Today</span> for actions.
        </p>
      </header>

      <section aria-labelledby="week-strain-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="week-strain-heading"
            className="text-base font-semibold text-[#edf2ff]"
          >
            Strain snapshot
          </h2>
        </div>
        <WeeklyRiskSummary data={data} />
      </section>

      <section
        aria-labelledby="week-schedule-heading"
        className="space-y-6 rounded-[22px] border border-white/[0.06] bg-[#141f42]/60 p-5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] sm:p-6 md:p-8 md:space-y-8"
      >
        <div className="space-y-2">
          <h2
            id="week-schedule-heading"
            className="text-base font-semibold tracking-tight text-[#edf2ff]"
          >
            Schedule & risks
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-[#98a4bf]">
            Pick a day, or tap a risk band. Top = shifts; bottom = where strain
            spikes.
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
              Week strip
            </p>
            <WeeklyTimeline
              variant="embedded"
              data={data}
              weekStart={weekStart}
              selectedDayKey={selectedDayKey}
              onSelectDay={setSelectedDayKey}
              selectedEpisodeId={selectedEpisodeId}
              onSelectEpisode={setSelectedEpisodeId}
            />
          </div>

          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[min(100%,320px)]">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6] lg:mt-0">
              Day detail
            </p>
            <DayContextPanel
              day={selectedDayColumn}
              episodesForDay={episodesForDay}
              onPickEpisode={setSelectedEpisodeId}
              selectedEpisodeId={selectedEpisodeId}
            />
          </aside>
        </div>
      </section>

      <section aria-labelledby="week-avoid-heading" className="space-y-4">
        <h2
          id="week-avoid-heading"
          className="text-base font-semibold text-[#edf2ff]"
        >
          What to ease up on
        </h2>
        <p className="-mt-1 max-w-lg text-sm text-[#98a4bf]">
          The three highest-impact schedule pressures this week.
        </p>
        <WeeklyTopDangers data={data} />
      </section>
    </div>
  );
}
