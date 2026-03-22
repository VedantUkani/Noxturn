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
  return (
    <button
      type="button"
      onClick={() => onSelect(episode.id)}
      className={cn(
        "absolute top-0.5 bottom-0.5 cursor-pointer rounded border px-1 text-left text-[9px] font-medium leading-tight transition-[box-shadow,transform] hover:z-10 hover:ring-1 hover:ring-[#45e0d4]/40",
        severityAccent(episode.severity),
        selected && "z-20 ring-2 ring-teal-300/50",
      )}
      style={{
        left: `${layout.leftPct}%`,
        width: `${layout.widthPct}%`,
      }}
      title={WEEK_RISK_TITLES[episode.label]}
    >
      <span className="line-clamp-2">{WEEK_RISK_TITLES[episode.label]}</span>
    </button>
  );
}
