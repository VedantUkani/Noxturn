"use client";

import Link from "next/link";
import type { WeekDayColumn } from "@/lib/week-risk-view-model";
import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import { DayContextPanel } from "@/components/week/DayContextPanel";
import { cn } from "@/lib/utils";

type DayDetailCardProps = {
  day: WeekDayColumn | null;
  episodesForDay: WeekRiskEpisodeVM[];
  onPickEpisode: (id: string) => void;
  selectedEpisodeId: string | null;
  className?: string;
};

export function DayDetailCard({
  day,
  episodesForDay,
  onPickEpisode,
  selectedEpisodeId,
  className,
}: DayDetailCardProps) {
  return (
    <aside
      className={cn("min-w-0", className)}
      aria-label="Selected day detail"
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
        Selected day
      </p>
      <DayContextPanel
        day={day}
        episodesForDay={episodesForDay}
        onPickEpisode={onPickEpisode}
        selectedEpisodeId={selectedEpisodeId}
        compact
        footer={
          <Link
            href="/today"
            className="flex w-full items-center justify-center rounded-xl bg-[#45e0d4]/12 px-4 py-3 text-sm font-medium text-[#45e0d4] ring-1 ring-[#45e0d4]/25 transition-colors hover:bg-[#45e0d4]/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#45e0d4]/50"
          >
            Open Today for actions
          </Link>
        }
      />
    </aside>
  );
}
