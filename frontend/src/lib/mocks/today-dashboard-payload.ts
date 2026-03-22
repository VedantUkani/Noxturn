/**
 * Builds `TodayDashboardPayload` from the dashboard API or from local demo data.
 * Anchor tasks, vitals, live-sync, and next-best fields from `payloadFromDashboardApi`
 * originate from the planner agent’s plan; `mockSupportTasks` is frontend-only filler
 * until support tasks are fully API-backed.
 */
import type { PlanTask } from "../types";
import type {
  TodayDashboardPayload,
  TodayNextBestHero,
} from "../dashboard-types";
import type { DashboardTask } from "../dashboard-types";
import { todayDemo } from "@/components/features/today-plan/today-demo-data";
import type { DashboardTodayResponse } from "../types";
import { mapDashboardToTodayView } from "@/components/features/today-plan/map-dashboard-to-today";

function planTaskToDashboard(t: PlanTask): DashboardTask {
  return {
    id: t.id,
    title: t.title,
    category: t.category,
    anchor: t.anchor_flag,
    scheduled_time: t.scheduled_time,
    duration_minutes: t.duration_minutes,
    status: t.status,
    rationale:
      t.source_reason?.trim() ||
      t.description?.trim() ||
      "This step is here to protect the next sleep window and keep load predictable.",
    evidence_ref: t.evidence_ref,
  };
}

function mockSupportTasks(): DashboardTask[] {
  return [
    {
      id: "support-stretch",
      title: "Five-minute mobility reset",
      category: "movement",
      anchor: false,
      scheduled_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      duration_minutes: 5,
      status: "planned",
      rationale:
        "Light movement can ease stiffness between blocks without raising core temperature much.",
    },
    {
      id: "support-hydration",
      title: "Hydration check-in",
      category: "meal",
      anchor: false,
      scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 2,
      status: "planned",
      rationale:
        "Steady fluids through the shift reduce the urge to over-caffeinate later.",
    },
  ];
}

/** Maps persisted/API `next_best_action` (from Claude or rule planner) into the hero card. */
export function nextBestFromApi(nba: DashboardTodayResponse["next_best_action"]): TodayNextBestHero {
  const catLabel = nba.category.replace(/_/g, " ");
  return {
    eyebrow: "Next best action",
    titleLine1: nba.title,
    titleLine2: catLabel.charAt(0).toUpperCase() + catLabel.slice(1),
    body: [nba.why_now, nba.description].filter(Boolean).join(" "),
    primaryCta: todayDemo.nextBestAction.primaryCta,
    secondaryCta: todayDemo.nextBestAction.secondaryCta,
    linkedTaskId: nba.task_id,
  };
}

export function payloadFromDashboardApi(d: DashboardTodayResponse): TodayDashboardPayload {
  const view = mapDashboardToTodayView(d);
  const anchors = d.anchor_tasks.map(planTaskToDashboard);
  return {
    vitals: view.vitals,
    nextBest: nextBestFromApi(d.next_best_action),
    tasks: anchors,
    recommendations: [...view.recommendations],
    avoid: [...view.avoid],
  };
}

export function payloadFromDemo(): TodayDashboardPayload {
  const linkedId = "demo-anchor-nap";
  return {
    vitals: todayDemo.vitals,
    nextBest: {
      ...todayDemo.nextBestAction,
      linkedTaskId: linkedId,
    },
    tasks: [
      {
        id: linkedId,
        title: "Protected nap window",
        category: "nap",
        anchor: true,
        scheduled_time: new Date().toISOString(),
        duration_minutes: 90,
        status: "planned",
        rationale:
          "This window has the highest payoff for alertness before your upcoming shift block.",
      },
      {
        id: "demo-anchor-light",
        title: "Outdoor light exposure",
        category: "light_timing",
        anchor: true,
        scheduled_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 15,
        status: "planned",
        rationale: "Anchors daytime alertness so the evening transition feels less abrupt.",
      },
      ...mockSupportTasks(),
    ],
    recommendations: [...todayDemo.recommendations],
    avoid: [...todayDemo.avoid],
  };
}
