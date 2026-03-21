import type {
  DashboardTask,
  TodayAvoidanceRow,
  TodayNextBestHero,
  TodayRecommendationRow,
} from "@/lib/dashboard-types";
import type { TodayRecommendationId } from "@/components/features/today-plan/today-demo-data";

export type EvidenceLensFocus =
  | { kind: "overview" }
  | { kind: "task"; taskId: string }
  | { kind: "recommendation"; id: TodayRecommendationId }
  | { kind: "avoid"; id: string }
  | { kind: "recovery" };

export type EvidenceLensPanel = {
  title: string;
  subtitle?: string;
  why: string;
  scheduleReason: string;
  evidenceSummary: string;
  assumptions: string;
  confidence: string;
  preferenceNote?: string;
};

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function evidenceLensId(): string {
  return uid();
}

type BuildCtx = {
  tasks: DashboardTask[];
  nextBest: TodayNextBestHero;
  recommendations: TodayRecommendationRow[];
  avoid: TodayAvoidanceRow[];
  readinessScore: number;
  recoveryMessage: string;
  planMode: string;
};

export function buildEvidenceLensPanel(
  focus: EvidenceLensFocus,
  ctx: BuildCtx,
): EvidenceLensPanel {
  const pref =
    "When you’ve told us you prefer steadier nights, we bias toward earlier wind-downs and lighter optional load.";

  if (focus.kind === "overview") {
    return {
      title: "Evidence lens",
      subtitle: "How Noxturn is reasoning right now",
      why: "Recommendations combine your near-term schedule with recovery signals and circadian safety margins — not willpower scoring.",
      scheduleReason:
        "Shift blocks define when sleep pressure and alertness curves are steepest; we anchor changes to those windows first.",
      evidenceSummary:
        "Shift-work sleep and light-timing guidance consistently supports protected sleep windows and earlier caffeine cutoffs when nights are ahead.",
      assumptions:
        "We assume today’s roster matches what you saved; sync or edit schedule if something moved.",
      confidence: "Medium — stronger when recovery sync is live and recent.",
      preferenceNote: pref,
    };
  }

  if (focus.kind === "recovery") {
    return {
      title: "Recovery signal",
      subtitle: "Why this affects the near-term plan",
      why:
        ctx.recoveryMessage.trim() ||
        "Readiness informs how much optional load we stack before your next protected rest window.",
      scheduleReason:
        "When recovery reads softer, we shorten the “prove it” steps and keep anchors that protect sleep onset.",
      evidenceSummary:
        "Lower readiness is treated as a capacity signal — plans narrow to fewer, higher-leverage moves.",
      assumptions:
        "Wearable or manual sync reflects how you actually feel within the last several hours.",
      confidence:
        ctx.readinessScore >= 55
          ? "Higher — signal looks supportive."
          : "Moderate — treat as a nudge, not a verdict.",
      preferenceNote: pref,
    };
  }

  if (focus.kind === "task") {
    const task = ctx.tasks.find((t) => t.id === focus.taskId);
    if (!task) {
      return buildEvidenceLensPanel({ kind: "overview" }, ctx);
    }
    return {
      title: task.title,
      subtitle: task.anchor ? "Anchor task" : "Support task",
      why: task.rationale,
      scheduleReason: `Timed for ${fmtTime(task.scheduled_time)} to line up with the rest of today’s shift window and your ${ctx.planMode} plan mode.`,
      evidenceSummary:
        task.evidence_ref?.trim() ||
        "Anchors map to sleep protection and circadian stability; support steps add comfort without restructuring the core plan.",
      assumptions:
        "You can reach this window with roughly the commute and breaks you indicated in setup.",
      confidence: task.anchor ? "Higher for anchors when schedule data is current." : "Moderate — helpful if bandwidth allows.",
      preferenceNote: pref,
    };
  }

  if (focus.kind === "recommendation") {
    const row = ctx.recommendations.find((r) => r.id === focus.id);
    const title =
      focus.id === "sleep"
        ? "Sleep block"
        : focus.id === "light"
          ? "Light timing"
          : "Caffeine cutoff";
    return {
      title,
      subtitle: row?.value,
      why: row?.note ?? "Holds the day’s structure so the next rest window stays reachable.",
      scheduleReason:
        focus.id === "sleep"
          ? "Sleep blocks are placed where they do the most work before your upcoming high-demand stretch."
          : focus.id === "light"
            ? "Light is sequenced to reinforce daytime alertness without sharpening the evening transition."
            : "Caffeine timing is set to preserve sleep pressure when you need it most.",
      evidenceSummary:
        "Consistent sleep anchors and earlier caffeine boundaries are among the most reliable levers in rotating shift schedules.",
      assumptions: "Today’s shift pattern in Noxturn still matches what you’re living.",
      confidence: "Medium — refines as tasks and sync update.",
      preferenceNote: pref,
    };
  }

  const avoid = ctx.avoid.find((a) => a.id === focus.id);
  return {
    title: avoid?.title ?? "Avoidance note",
    subtitle: "Gentle guardrail",
    why:
      avoid?.detail ??
      "Some patterns stack poorly with short sleep opportunity — this is a softness-first steer, not a rule.",
    scheduleReason:
      "Timed relative to your sleep window and the next shift transition.",
    evidenceSummary:
      "Large swings in late-day stimulation often narrow how easily you can downshift before sleep.",
    assumptions: "Intensity and timing here are typical for your saved pattern.",
    confidence: "Low–medium — personal tolerance varies.",
    preferenceNote: pref,
  };
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
