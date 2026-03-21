import type { ReactNode } from "react";
import {
  IconBed,
  IconCoffee,
  IconSnack,
  IconStride,
  IconSun,
  IconWarning,
} from "@/components/icons/NavIcons";
import type {
  TodayAvoidanceGlyph,
  TodayRecommendationId,
} from "./today-demo-data";
import { todayChipIconClass } from "./today-surfaces";

const chip = todayChipIconClass;

/** Icons for recommendation cards — keys must match `todayDemo.recommendations[].id`. */
export const todayRecommendationIcons = {
  sleep: <IconBed className={chip} />,
  light: <IconSun className={chip} />,
  caffeine: <IconCoffee className={chip} />,
} as const satisfies Record<TodayRecommendationId, ReactNode>;

/** Icons for avoidance rows — keys must match `todayDemo.avoid[].icon`. */
export const todayAvoidanceIcons = {
  snack: <IconSnack className={chip} />,
  stride: <IconStride className={chip} />,
} as const satisfies Record<TodayAvoidanceGlyph, ReactNode>;

export function TodayWarningSectionIcon(): ReactNode {
  return <IconWarning className={chip} />;
}
