"use client";

import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import type { SegmentLayout } from "@/lib/week-timeline-math";
import { severityAccent, WEEK_RISK_TITLES } from "./week-risk-meta";
import { cn } from "@/lib/utils";

type RiskOverlayProps = {
  episode: WeekRiskEpisodeVM;
  layout: SegmentLayout;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function RiskOverlay({
  episode,
  layout,
  selected,
  onSelect,
}: RiskOverlayProps) {
  const label = WEEK_RISK_TITLES[episode.label];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(episode.id);
      }}
      aria-label={`${label}. ${episode.headline}`}
      aria-pressed={selected}
      className={cn(
        "absolute top-1 bottom-1 cursor-pointer rounded-md border transition-[box-shadow,transform] hover:z-10 hover:ring-1 hover:ring-[#45e0d4]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#45e0d4]/60",
        severityAccent(episode.severity),
        selected && "z-20 ring-2 ring-[#45e0d4]/45",
      )}
      style={{
        left: `${layout.leftPct}%`,
        width: `${Math.max(layout.widthPct, 0.35)}%`,
      }}
      title={`${label} — ${episode.headline}`}
    >
      <span className="sr-only">{label}</span>
    </button>
  );
}
