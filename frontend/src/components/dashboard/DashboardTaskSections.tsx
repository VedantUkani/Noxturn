"use client";

import { useTodayDashboardContext } from "@/contexts/TodayDashboardContext";
import { DashboardTaskCard } from "./DashboardTaskCard";

export function DashboardTaskSections() {
  const {
    tasks,
    completeTask,
    skipTask,
    markTaskMissed,
    snoozeTask,
    openTaskDetail,
  } = useTodayDashboardContext();

  const anchors = tasks.filter((t) => t.anchor);
  const support = tasks.filter((t) => !t.anchor);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Anchor tasks</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            These protect sleep and recovery windows — when one shifts, the plan
            may reprioritize what you see next.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {anchors.map((task) => (
            <DashboardTaskCard
              key={task.id}
              task={task}
              onComplete={() => completeTask(task.id)}
              onSkip={() => skipTask(task.id)}
              onMissed={() => markTaskMissed(task.id)}
              onSnooze={() => snoozeTask(task.id, 20)}
              onDetails={() => openTaskDetail(task.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Support tasks</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Helpful when you have spare attention — skipping them won&apos;t
            restructure your plan the way anchor changes can.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {support.map((task) => (
            <DashboardTaskCard
              key={task.id}
              task={task}
              onComplete={() => completeTask(task.id)}
              onSkip={() => skipTask(task.id)}
              onMissed={() => markTaskMissed(task.id)}
              onSnooze={() => snoozeTask(task.id, 20)}
              onDetails={() => openTaskDetail(task.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
