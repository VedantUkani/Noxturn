/**
 * Client-side simulation for the Today demo: task taps, snooze, recovery bands,
 * and vitals nudges. Production anchor tasks, live sync, and readiness come from
 * the planner agent via the API — this module only mirrors interactions locally.
 */
import type {
  DashboardTask,
  RecoverySimulationBand,
  TodayAvoidanceRow,
  TodayDashboardPayload,
  TodayNextBestHero,
  TodayRecommendationRow,
  WhatChangedEntry,
} from "@/lib/dashboard-types";

function changeEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type LiveBanner = {
  message: string;
  why?: string;
  /** Strong = anchor-scale update; soft = support-scale nudge. */
  tone?: "strong" | "soft";
};

export type LiveDashboardState = {
  vitals: TodayDashboardPayload["vitals"];
  /** Snapshot from initial payload — recovery simulations reset here. */
  baselineVitals: TodayDashboardPayload["vitals"];
  recoveryProfile: RecoverySimulationBand;
  vitalsSyncedAt: string;
  nextBest: TodayNextBestHero;
  tasks: DashboardTask[];
  recommendations: TodayRecommendationRow[];
  avoid: TodayAvoidanceRow[];
  banner: LiveBanner | null;
  whatChanged: WhatChangedEntry[];
  detailTaskId: string | null;
  /** Brief visual pulse on hero + recovery + recommendations after a plan touch. */
  pulse: boolean;
  /** One-line hint when next-best hero shifts. */
  heroChangeHint: string | null;
  /** Ties recovery card copy to the plan without sounding judgmental. */
  planRelationLine: string;
};

type LiveEvent =
  | { type: "TASK_COMPLETE"; taskId: string }
  | { type: "TASK_SKIP"; taskId: string }
  | { type: "TASK_MISSED"; taskId: string }
  | { type: "TASK_SNOOZE"; taskId: string; minutes: number }
  | { type: "SIMULATE_RECOVERY"; band: RecoverySimulationBand }
  | { type: "DISMISS_BANNER" }
  | { type: "OPEN_DETAIL"; taskId: string }
  | { type: "CLOSE_DETAIL" }
  | { type: "CLEAR_PULSE" }
  | { type: "CLEAR_HERO_HINT" }
  | { type: "APPEND_WHAT_CHANGED"; entry: Omit<WhatChangedEntry, "id"> };

const NEAR_TERM = "Next ~12–24 hours only.";
const REC_TAG = "· Near-term plan adjusted.";

function nowIso(): string {
  return new Date().toISOString();
}

function pushChange(
  entries: WhatChangedEntry[],
  entry: Omit<WhatChangedEntry, "id">,
): WhatChangedEntry[] {
  const next: WhatChangedEntry = { ...entry, id: changeEntryId() };
  return [...entries.slice(-11), next];
}

function taskViable(t: DashboardTask): boolean {
  return (
    t.status === "planned" ||
    t.status === "snoozed"
  );
}

function inferBand(
  readiness: number,
): RecoverySimulationBand {
  if (readiness >= 62) return "stable";
  if (readiness >= 38) return "low_recovery";
  return "severe_strain";
}

function vitalsForBand(
  base: TodayDashboardPayload["vitals"],
  band: RecoverySimulationBand,
): TodayDashboardPayload["vitals"] {
  const b = { ...base };
  switch (band) {
    case "stable":
      return {
        ...b,
        liveSync: true,
        message:
          "Recovery looks steady — today’s plan keeps protective anchors and lighter optional steps.",
      };
    case "low_recovery":
      return {
        ...b,
        readinessScore: Math.max(28, Math.min(48, b.readinessScore - 12)),
        hrv: Math.max(14, b.hrv - 8),
        liveSync: true,
        message:
          "Recovery was lower than expected — tonight’s sleep block and caffeine cutoff were nudged earlier.",
      };
    case "severe_strain":
      return {
        ...b,
        readinessScore: Math.max(18, Math.min(32, b.readinessScore - 22)),
        hrv: Math.max(12, b.hrv - 12),
        liveSync: true,
        message:
          "Sync suggests elevated strain — the next stretch prioritizes rest windows and trims optional load.",
      };
    default:
      return b;
  }
}

function planRelationForBand(band: RecoverySimulationBand): string {
  switch (band) {
    case "stable":
      return "Readiness supports your current anchors — optional steps stay available.";
    case "low_recovery":
      return "Readiness is informing a gentler near-term mix: anchors stay, extras ease.";
    case "severe_strain":
      return "Readiness is steering the plan toward fewer demands before the next protected rest.";
    default:
      return "";
  }
}

/** Next hero follows remaining planned/snoozed work: anchors first, then soonest. */
export function deriveNextBest(
  tasks: DashboardTask[],
  previous: TodayNextBestHero,
): TodayNextBestHero {
  const linked = tasks.find((t) => t.id === previous.linkedTaskId);
  if (linked && taskViable(linked)) return previous;

  const pool = tasks
    .filter(taskViable)
    .sort((a, b) => {
      if (a.anchor !== b.anchor) return a.anchor ? -1 : 1;
      return a.scheduled_time.localeCompare(b.scheduled_time);
    });
  const next = pool[0];
  if (!next) {
    return {
      ...previous,
      titleLine1: "Nothing queued",
      titleLine2: "in this window",
      body: "When new steps arrive, they’ll show up here. Rest still counts.",
      linkedTaskId: "",
    };
  }

  const cat = next.category.replace(/_/g, " ");
  return {
    eyebrow: "Next best action",
    titleLine1: next.title,
    titleLine2: cat.charAt(0).toUpperCase() + cat.slice(1),
    body: next.rationale,
    primaryCta: "Start",
    secondaryCta: "Remind later",
    linkedTaskId: next.id,
  };
}

function touchRecommendations(recs: TodayRecommendationRow[]): TodayRecommendationRow[] {
  return recs.map((r) => ({
    ...r,
    note: r.note.includes("Near-term plan adjusted")
      ? r.note
      : `${r.note} ${REC_TAG}`,
  }));
}

function heroHint(prev: TodayNextBestHero, next: TodayNextBestHero): string | null {
  if (!next.linkedTaskId || prev.linkedTaskId === next.linkedTaskId) return null;
  if (!prev.titleLine1.trim()) return null;
  return `Previous next step was “${prev.titleLine1}”. Next best action has been updated.`;
}

export function initialLiveState(p: TodayDashboardPayload): LiveDashboardState {
  const baselineVitals = { ...p.vitals };
  const recoveryProfile = inferBand(p.vitals.readinessScore);
  return {
    vitals: { ...p.vitals },
    baselineVitals,
    recoveryProfile,
    vitalsSyncedAt: nowIso(),
    nextBest: { ...p.nextBest },
    tasks: p.tasks.map((t) => ({ ...t })),
    recommendations: p.recommendations.map((r) => ({ ...r })),
    avoid: p.avoid.map((a) => ({ ...a })),
    banner: null,
    whatChanged: [],
    detailTaskId: null,
    pulse: false,
    heroChangeHint: null,
    planRelationLine: planRelationForBand(recoveryProfile),
  };
}

function setTaskStatus(
  tasks: DashboardTask[],
  id: string,
  status: DashboardTask["status"],
  snoozedUntil?: string,
): DashboardTask[] {
  return tasks.map((t) =>
    t.id === id
      ? {
          ...t,
          status,
          snoozedUntil: status === "snoozed" ? snoozedUntil : undefined,
        }
      : t,
  );
}

function addMinutesIso(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export function applyLiveEvent(
  state: LiveDashboardState,
  event: LiveEvent,
): LiveDashboardState {
  switch (event.type) {
    case "CLEAR_PULSE":
      return { ...state, pulse: false };

    case "CLEAR_HERO_HINT":
      return { ...state, heroChangeHint: null };

    case "DISMISS_BANNER":
      return { ...state, banner: null };

    case "OPEN_DETAIL":
      return { ...state, detailTaskId: event.taskId };

    case "CLOSE_DETAIL":
      return { ...state, detailTaskId: null };

    case "APPEND_WHAT_CHANGED":
      return {
        ...state,
        whatChanged: pushChange(state.whatChanged, event.entry),
      };

    case "SIMULATE_RECOVERY": {
      const vitals = vitalsForBand(state.baselineVitals, event.band);
      const nextBest = deriveNextBest(state.tasks, state.nextBest);
      const heroChanged =
        nextBest.linkedTaskId !== state.nextBest.linkedTaskId ||
        nextBest.titleLine1 !== state.nextBest.titleLine1;
      const shouldReweave = event.band !== "stable";
      return {
        ...state,
        vitals,
        recoveryProfile: event.band,
        vitalsSyncedAt: nowIso(),
        nextBest,
        recommendations: shouldReweave
          ? touchRecommendations(state.recommendations)
          : state.recommendations,
        planRelationLine: planRelationForBand(event.band),
        heroChangeHint: heroChanged
          ? heroHint(state.nextBest, nextBest)
          : state.heroChangeHint,
        banner:
          shouldReweave
            ? {
                message: "Plan updated",
                why:
                  event.band === "severe_strain"
                    ? `Recovery sync suggests elevated strain. ${NEAR_TERM}`
                    : `Recovery was lower than expected. ${NEAR_TERM}`,
                tone: event.band === "severe_strain" ? "strong" : "soft",
              }
            : state.banner,
        whatChanged: shouldReweave
          ? pushChange(state.whatChanged, {
              headline:
                event.band === "severe_strain"
                  ? "Near-term plan tightened after strain signal."
                  : "Sleep block and caffeine cutoff adjusted slightly.",
              reason: "Recovery simulation updated sync picture.",
              source: "recovery_sync",
            })
          : state.whatChanged,
        pulse: shouldReweave,
      };
    }

    case "TASK_SNOOZE": {
      const task = state.tasks.find((x) => x.id === event.taskId);
      if (!task) return state;
      const tasks = setTaskStatus(
        state.tasks,
        event.taskId,
        "snoozed",
        addMinutesIso(event.minutes),
      );
      const prevHero = state.nextBest;
      const nextBest = deriveNextBest(tasks, state.nextBest);
      return {
        ...state,
        tasks,
        whatChanged: pushChange(state.whatChanged, {
          headline: `“${task.title}” snoozed ~${event.minutes} min.`,
          reason: "You asked for more time before this step surfaces again.",
          source: "task",
        }),
        nextBest,
        heroChangeHint: heroHint(prevHero, nextBest),
      };
    }

    case "TASK_COMPLETE": {
      const task = state.tasks.find((x) => x.id === event.taskId);
      if (!task) return state;
      const tasks = setTaskStatus(state.tasks, event.taskId, "completed");
      const prevHero = state.nextBest;
      const nextBest = deriveNextBest(tasks, state.nextBest);
      const heroChanged =
        nextBest.linkedTaskId !== state.nextBest.linkedTaskId ||
        nextBest.titleLine1 !== state.nextBest.titleLine1;
      let recs = state.recommendations;

      if (task.anchor) {
        recs = touchRecommendations(recs);
      }

      return {
        ...state,
        tasks,
        nextBest,
        recommendations: recs,
        /** Task actions surface in What changed + pulse; avoid duplicating a banner. */
        banner: null,
        whatChanged: pushChange(state.whatChanged, {
          headline: task.anchor
            ? `Anchor completed: “${task.title}”.`
            : `Completed “${task.title}”.`,
          reason: "Near-term ordering updates when steps finish.",
          source: "task",
        }),
        pulse: heroChanged || task.anchor,
        heroChangeHint: heroHint(prevHero, nextBest),
        planRelationLine: state.planRelationLine,
      };
    }

    case "TASK_SKIP": {
      const task = state.tasks.find((x) => x.id === event.taskId);
      if (!task) return state;
      const tasks = setTaskStatus(state.tasks, event.taskId, "skipped");
      const prevHero = state.nextBest;
      const nextBest = deriveNextBest(tasks, state.nextBest);
      const heroChanged =
        nextBest.titleLine1 !== state.nextBest.titleLine1 ||
        nextBest.linkedTaskId !== state.nextBest.linkedTaskId;

      if (task.anchor) {
        return {
          ...state,
          tasks,
          nextBest,
          recommendations: touchRecommendations(state.recommendations),
          banner: null,
          whatChanged: pushChange(state.whatChanged, {
            headline: `Anchor skipped: “${task.title}”.`,
            reason: "Anchors carry more weight — next best action was rechecked.",
            source: "task",
          }),
          pulse: true,
          heroChangeHint: heroHint(prevHero, nextBest),
        };
      }

      return {
        ...state,
        tasks,
        nextBest,
        whatChanged: pushChange(state.whatChanged, {
          headline: `Support step skipped: “${task.title}”.`,
          reason: "Support changes lightly nudge ordering when they were guiding the hero.",
          source: "task",
        }),
        pulse: heroChanged,
        banner: null,
        heroChangeHint: heroHint(prevHero, nextBest),
      };
    }

    case "TASK_MISSED": {
      const task = state.tasks.find((x) => x.id === event.taskId);
      if (!task) return state;
      const tasks = setTaskStatus(state.tasks, event.taskId, "expired");
      const prevHero = state.nextBest;
      const nextBest = deriveNextBest(tasks, state.nextBest);
      const heroChanged =
        nextBest.titleLine1 !== state.nextBest.titleLine1 ||
        nextBest.linkedTaskId !== state.nextBest.linkedTaskId;

      if (task.anchor) {
        return {
          ...state,
          tasks,
          nextBest,
          recommendations: touchRecommendations(state.recommendations),
          banner: null,
          whatChanged: pushChange(state.whatChanged, {
            headline: `Anchor window passed: “${task.title}”.`,
            reason: "We replanned the near-term without implying fault.",
            source: "task",
          }),
          pulse: true,
          heroChangeHint: heroHint(prevHero, nextBest),
        };
      }

      return {
        ...state,
        tasks,
        nextBest,
        whatChanged: pushChange(state.whatChanged, {
          headline: `Support window noted: “${task.title}”.`,
          reason: "Optional steps can roll forward without a heavy replan.",
          source: "task",
        }),
        pulse: heroChanged,
        heroChangeHint: heroHint(prevHero, nextBest),
      };
    }

    default:
      return state;
  }
}
