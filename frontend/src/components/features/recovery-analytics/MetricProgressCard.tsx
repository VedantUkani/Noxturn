import { IconCoffee, IconSunRecovery } from "./RecoveryIcons";
import { cn } from "@/lib/utils";
import type { RecoveryMetricModel } from "./types";

type MetricProgressCardProps = {
  metric: RecoveryMetricModel;
};

export function MetricProgressCard({ metric }: MetricProgressCardProps) {
  const isYellow = metric.accent === "yellow";
  const barColor = isYellow ? "#f7c22c" : "#86c9ff";
  const labelColor = isYellow ? "#f7c22c" : "#86c9ff";

  return (
    <div className="rounded-[22px] border border-white/[0.06] bg-[#16264a] p-5 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              isYellow ? "bg-[#f7c22c]/10" : "bg-[#86c9ff]/10",
            )}
          >
            {isYellow ? (
              <IconCoffee className="text-[#f7c22c]" />
            ) : (
              <IconSunRecovery className="text-[#86c9ff]" />
            )}
          </div>
          <p className="truncate text-[15px] font-medium text-[#edf2ff]">
            {metric.label}
          </p>
        </div>
        <span
          className="shrink-0 text-2xl font-semibold tabular-nums tracking-tight"
          style={{ color: labelColor }}
        >
          {metric.percent}%
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#0d1833]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${metric.percent}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 12px ${barColor}55`,
          }}
        />
      </div>
    </div>
  );
}
