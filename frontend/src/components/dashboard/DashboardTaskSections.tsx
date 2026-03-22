"use client";

import { useTodayDashboardContext } from "@/contexts/TodayDashboardContext";
import { DashboardTaskCard } from "./DashboardTaskCard";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

export function DashboardTaskSections() {
  const { tasks, completeTask, skipTask, markTaskMissed, snoozeTask, openTaskDetail } =
    useTodayDashboardContext();

  const anchors = tasks.filter((t) => t.anchor);
  const support = tasks.filter((t) => !t.anchor);

  if (tasks.length === 0) {
    return (
      <div className={cn(nx.card, "px-5 py-10 text-center")}>
        <p className="text-sm text-[#7d89a6]">No tasks for today — enjoy the rest.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Anchor tasks */}
      {anchors.length > 0 && (
        <div className={cn("overflow-hidden", nx.card, "border-[#45e0d4]/20")}>
          <div className="flex items-center gap-2 border-b border-white/[0.05] px-5 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#45e0d4]" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#45e0d4]/80">
              Anchor
            </span>
            <span className="ml-auto text-[10px] text-[#3a4560]">
              {anchors.length} task{anchors.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
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
        </div>
      )}

      {/* Support tasks */}
      {support.length > 0 && (
        <div className={cn("overflow-hidden", nx.card)}>
          <div className="flex items-center gap-2 border-b border-white/[0.05] px-5 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3a4560]" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d89a6]/70">
              Support
            </span>
            <span className="ml-auto text-[10px] text-[#3a4560]">
              {support.length} task{support.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
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
        </div>
      )}
    </div>
  );
}
