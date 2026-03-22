"use client";

import { useEffect, useMemo, useState } from "react";
import { episodeTouchesDay } from "@/lib/week-timeline-math";
import { useWeekInjuryMapData } from "@/hooks/useWeekInjuryMapData";
import { WeekPageHeader } from "./WeekPageHeader";
import { WeeklySummaryCard } from "./WeeklySummaryCard";
import { WeeklyScheduleRiskPanel } from "./WeeklyScheduleRiskPanel";
import { DayDetailCard } from "./DayDetailCard";
import { WeeklyPressureCards } from "./WeeklyPressureCards";
import { RecoveryWindowCard } from "./RecoveryWindowCard";

export function WeekPageContent() {
  const data = useWeekInjuryMapData();

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
            <DayDetailCard
              day={selectedDayColumn}
              episodesForDay={episodesForDay}
              onPickEpisode={setSelectedEpisodeId}
              selectedEpisodeId={selectedEpisodeId}
            />
          </div>
        </div>
      </div>

      <WeeklyPressureCards data={data} />

      {data.recoveryWindowLine ? (
        <RecoveryWindowCard line={data.recoveryWindowLine} />
      ) : null}
    </div>
  );
}
