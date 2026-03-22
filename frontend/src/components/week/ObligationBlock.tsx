"use client";

import type { WeekShiftSegment } from "@/lib/week-risk-view-model";
import type { SegmentLayout } from "@/lib/week-timeline-math";
import { ShiftBlock } from "./ShiftBlock";

/** Obligation / class / fixed block — same layout as shifts, distinct styling via `kind`. */
export function ObligationBlock({
  segment,
  layout,
}: {
  segment: WeekShiftSegment;
  layout: SegmentLayout;
}) {
  return <ShiftBlock segment={{ ...segment, kind: "obligation" }} layout={layout} />;
}
