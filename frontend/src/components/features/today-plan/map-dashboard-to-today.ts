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
  { id: "sleep",    categories: ["sleep", "nap"],     title: "Sleep Block" },
  { id: "light",    categories: ["light_timing"],      title: "Light Timing" },
  { id: "caffeine", categories: ["caffeine_cutoff"],   title: "Caffeine Cutoff" },
  { id: "social",   categories: ["social"],            title: "Social Interaction" },
];

function categoryAccent(category: TaskCategory): string {
  switch (category) {
    case "sleep":        return "Sleep focus";
    case "nap":          return "Rest window";
    case "light_timing": return "Light timing";
    case "caffeine_cutoff": return "Caffeine cutoff";
    case "social":       return "Social connection";
    case "relaxation":   return "Wind-down";
    case "movement":     return "Movement";
    case "mindfulness":  return "Mindfulness";
    case "meal":         return "Meal timing";
    default:             return category.replace(/_/g, " ");
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

/** Extracts the first sentence from a longer description string. */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : trimmed.slice(0, 120);
}

function slotValue(
  id: TodayRecommendationId,
  task: DashboardTodayResponse["anchor_tasks"][number],
): string {
  const time = fmtTime(task.scheduled_time);
  const dur = task.duration_minutes;
  switch (id) {
    case "sleep":
      return `${time} · ${dur} min rest`;
    case "caffeine":
      return `Cutoff by ${time}`;
    case "social":
      return `${time} · ${dur} min connection`;
    case "light":
    default: {
      // Keep the task title (it's already very descriptive from the backend)
      const shortTitle = task.title.length > 36 ? task.title.slice(0, 34) + "…" : task.title;
      return `${time} · ${shortTitle}`;
    }
  }
}

function recommendationForSlot(
  slot: (typeof SLOT_ORDER)[number],
  tasks: DashboardTodayResponse["anchor_tasks"],
): TodayRecommendation {
  const fallback = todayDemo.recommendations.find((r) => r.id === slot.id)!;
  const task = tasks.find((t) => slot.categories.includes(t.category));
  if (!task) return fallback;

  const rawNote =
    task.description?.trim() || task.source_reason?.trim() || fallback.note;

  return {
    id: slot.id,
    title: slot.title,
    value: slotValue(slot.id, task),
    note: firstSentence(rawNote),
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
 * Maps `GET /dashboard/today` JSON into the Today page view model. Vitals, sync
 * affordance, anchor-backed recommendations, and next-best copy all reflect the
 * backend plan / agent — not hardcoded UI defaults.
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
