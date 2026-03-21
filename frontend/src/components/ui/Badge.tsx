import { type ReactNode } from "react";
import { type Severity, type PlanMode, type RecoveryRhythm, type TaskStatus } from "@/lib/types";

type Preset = "severity" | "planMode" | "rhythm" | "taskStatus";

// Generic badge
type GenericProps = {
  children: ReactNode;
  color?: "indigo" | "violet" | "emerald" | "amber" | "red" | "orange" | "slate" | "cyan";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  className?: string;
};

const COLORS: Record<NonNullable<GenericProps["color"]>, string> = {
  indigo:  "bg-indigo-950/70 text-indigo-300 border-indigo-800/50",
  violet:  "bg-violet-950/70 text-violet-300 border-violet-800/50",
  emerald: "bg-emerald-950/70 text-emerald-300 border-emerald-800/50",
  amber:   "bg-amber-950/70  text-amber-300  border-amber-800/50",
  red:     "bg-red-950/70    text-red-300    border-red-800/50",
  orange:  "bg-orange-950/70 text-orange-300 border-orange-800/50",
  slate:   "bg-slate-800/70  text-slate-300  border-slate-700/50",
  cyan:    "bg-cyan-950/70   text-cyan-300   border-cyan-800/50",
};

const DOT_COLORS: Record<NonNullable<GenericProps["color"]>, string> = {
  indigo:  "bg-indigo-400",
  violet:  "bg-violet-400",
  emerald: "bg-emerald-400",
  amber:   "bg-amber-400",
  red:     "bg-red-400",
  orange:  "bg-orange-400",
  slate:   "bg-slate-400",
  cyan:    "bg-cyan-400",
};

const SIZES = {
  xs: "px-1.5 py-0.5 text-xs rounded gap-1",
  sm: "px-2   py-0.5 text-xs rounded-md gap-1.5",
  md: "px-2.5 py-1   text-sm rounded-md gap-2",
};

export function Badge({ children, color = "slate", size = "sm", dot = false, className = "" }: GenericProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-medium border",
        COLORS[color],
        SIZES[size],
        className,
      ].join(" ")}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[color]}`} />}
      {children}
    </span>
  );
}

// ─── Semantic convenience wrappers ───

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, GenericProps["color"]> = {
    low: "emerald", moderate: "amber", high: "orange", critical: "red",
  };
  return <Badge color={map[severity]} dot>{severity}</Badge>;
}

export function PlanModeBadge({ mode }: { mode: PlanMode }) {
  const map: Record<PlanMode, GenericProps["color"]> = {
    protect: "red", recover: "amber", stabilize: "indigo", perform: "emerald",
  };
  return (
    <Badge color={map[mode]} size="md">
      {mode.charAt(0).toUpperCase() + mode.slice(1)}
    </Badge>
  );
}

export function RhythmBadge({ rhythm }: { rhythm: RecoveryRhythm }) {
  const map: Record<RecoveryRhythm, GenericProps["color"]> = {
    steady: "emerald", rebuilding: "amber", interrupted: "red", unknown: "slate",
  };
  return <Badge color={map[rhythm]} dot>{rhythm}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, GenericProps["color"]> = {
    planned: "indigo", completed: "emerald", skipped: "slate", expired: "orange",
  };
  return <Badge color={map[status]} size="xs">{status}</Badge>;
}
