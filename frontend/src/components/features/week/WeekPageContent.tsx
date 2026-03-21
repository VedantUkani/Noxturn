import { SectionCard } from "@/components/cards/SectionCard";

/** Circadian injury map — risk / week horizon. */
export function WeekPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Week — circadian injury map
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          A calm view of risky flips, short turnarounds, and recovery gaps
          across your horizon. Severity is informational — the goal is to see
          pressure before it becomes harm.
        </p>
      </div>
      <SectionCard title="What appears here">
        <p>
          Episodes like rapid day↔night flips, compressed rest, and windows
          where driving or clinical work sits on top of accumulated strain. Each
          band links forward to{" "}
          <strong className="font-medium text-slate-300">Today</strong> for the
          next best protective action.
        </p>
      </SectionCard>
      <SectionCard title="Charts & timeline">
        <p>
          Timeline strips and optional charts will layer on this page when data
          is wired — kept separate under{" "}
          <code className="rounded bg-slate-800 px-1 text-xs text-slate-300">
            components/timeline
          </code>{" "}
          and{" "}
          <code className="rounded bg-slate-800 px-1 text-xs text-slate-300">
            components/charts
          </code>
          .
        </p>
      </SectionCard>
    </div>
  );
}
