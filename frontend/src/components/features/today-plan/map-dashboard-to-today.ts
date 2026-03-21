import type { DashboardTodayResponse } from "@/lib/types";
import type { TaskCategory } from "@/lib/types";
import { getStoredAvoidList } from "@/lib/session";
import type {
  TodayAvoidanceItem,
  TodayRecommendation,
  TodayRecommendationId,
  TodayViewModel,
} from "./today-demo-data";
import { todayDemo } from "./today-demo-data";

const SLOT_ORDER: {
  id: TodayRecommendationId;
  categories: TaskCategory[];
  title: string;
}[] = [
  { id: "sleep", categories: ["sleep", "nap"], title: "Sleep Block" },
  { id: "light", categories: ["light_timing"], title: "Light Timing" },
  { id: "caffeine", categories: ["caffeine_cutoff"], title: "Caffeine Cutoff" },
];

function categoryAccent(category: TaskCategory): string {
  switch (category) {
    case "sleep":
      return "Sleep focus";
    case "nap":
      return "Rest window";
    case "light_timing":
      return "Light timing";
    case "caffeine_cutoff":
      return "Caffeine cutoff";
    default:
      return category.replace(/_/g, " ");
  }
}

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(11, 16);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(11, 16);
  }
}

function rhythmCopy(label: string, score: number): string {
  const n = Math.round(score);
  switch (label) {
    case "steady":
      return `Recovery score ${n} — rhythm looks steady. Protect the habits that got you here.`;
    case "rebuilding":
      return `Recovery score ${n} — your system is rebuilding. The next rest window matters more than extra prep.`;
    case "interrupted":
      return `Recovery score ${n} — load is elevated. Prioritize rest and lighter optional tasks when you can.`;
    default:
      return `Recovery score ${n} — sync wearables when you can for a clearer read.`;
  }
}

function recommendationForSlot(
  slot: (typeof SLOT_ORDER)[number],
  tasks: DashboardTodayResponse["anchor_tasks"],
): TodayRecommendation {
  const fallback = todayDemo.recommendations.find((r) => r.id === slot.id)!;
  const task = tasks.find((t) => slot.categories.includes(t.category));
  if (!task) return fallback;
  return {
    id: slot.id,
    title: slot.title,
    value: `${fmtTime(task.scheduled_time)} · ${task.title}`,
    note:
      (task.description?.trim() || task.source_reason?.trim() || fallback.note) ??
      fallback.note,
  };
}

function mapStoredAvoidList(): TodayAvoidanceItem[] {
  const strings = getStoredAvoidList();
  if (!strings.length) return [];
  return strings.map((title, i) => ({
    id: `avoid-${i}`,
    title,
    detail:
      "Worth keeping in mind when you plan food and movement around sleep.",
    icon: i % 2 === 0 ? "snack" : "stride",
  }));
}

/**
 * Maps `GET /dashboard/today` JSON into the Today page view model (current UI).
 */
export function mapDashboardToTodayView(d: DashboardTodayResponse): TodayViewModel {
  const nba = d.next_best_action;
  const score = d.recovery_score;
  const hasScore = score != null && !Number.isNaN(Number(score));

  const vitals = hasScore
    ? {
        hrv: Math.round(Number(score)),
        liveSync: true,
        message: rhythmCopy(d.recovery_rhythm_label, Number(score)),
        readinessScore: Math.min(100, Math.max(0, Math.round(Number(score)))),
        metricLabel: "Recovery",
      }
    : { ...todayDemo.vitals };

  const recommendations = SLOT_ORDER.map((slot) =>
    recommendationForSlot(slot, d.anchor_tasks),
  );

  const storedAvoid = mapStoredAvoidList();
  const avoid: readonly TodayAvoidanceItem[] =
    storedAvoid.length > 0 ? storedAvoid : [];

  return {
    nextBestAction: {
      eyebrow: "Next best action",
      titleLine1: nba.title,
      titleLine2: categoryAccent(nba.category),
      body: [nba.why_now, nba.description].filter(Boolean).join(" "),
      primaryCta: todayDemo.nextBestAction.primaryCta,
      secondaryCta: todayDemo.nextBestAction.secondaryCta,
    },
    vitals,
    recommendations,
    avoid,
  };
}
