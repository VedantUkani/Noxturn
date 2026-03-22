"use client";

import type { WeekShiftSegment } from "@/lib/week-risk-view-model";
import type { SegmentLayout } from "@/lib/week-timeline-math";
import { blockTypeClasses } from "./week-risk-meta";
import { cn } from "@/lib/utils";

type ShiftBlockProps = {
  segment: WeekShiftSegment;
  layout: SegmentLayout;
  className?: string;
};

function fmtRange(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const t = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${t.format(a)}–${t.format(b)}`;
  } catch {
    return "";
  }
}

export function ShiftBlock({ segment, layout, className }: ShiftBlockProps) {
  return (
    <div
      className={cn(
        "absolute top-1 bottom-1 flex min-w-0 flex-col justify-center overflow-hidden rounded-lg px-2 py-1 text-[10px] leading-tight shadow-sm sm:text-[11px]",
        blockTypeClasses(segment.blockType, segment.kind),
        className,
      )}
      style={{
        left: `${layout.leftPct}%`,
        width: `${layout.widthPct}%`,
      }}
      title={`${segment.title} · ${fmtRange(segment.startTime, segment.endTime)}`}
    >
      <span className="truncate font-semibold tracking-tight">
        {segment.title}
      </span>
      <span className="truncate opacity-80">
        {fmtRange(segment.startTime, segment.endTime)}
      </span>
    </div>
  );
}
