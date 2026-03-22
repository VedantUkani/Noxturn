import { IconBarChartMini } from "./RecoveryIcons";
import type { RecoveryProtectedBlocksModel } from "./types";
import { cn } from "@/lib/utils";

type ProtectedBlocksCardProps = {
  data: RecoveryProtectedBlocksModel;
};

function dayColor(protected_: number, total: number): string {
  if (total === 0) return "bg-[#0d1833] border border-white/[0.06]";
  const rate = protected_ / total;
  if (rate >= 0.8) return "bg-[#45e0d4]/80 shadow-[0_0_12px_rgba(69,224,212,0.3)]";
  if (rate >= 0.5) return "bg-[#86c9ff]/60";
  if (rate > 0) return "bg-[#f7c22c]/50";
  return "bg-rose-500/40";
}

function dayLabel(protected_: number, total: number): string {
  if (total === 0) return "—";
  return `${protected_}/${total}`;
}

function dayTitle(day: string, protected_: number, total: number, date: string): string {
  const d = new Date(date);
  const formatted = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  if (total === 0) return `${formatted}: no tasks scheduled`;
  return `${formatted}: ${protected_} of ${total} anchor tasks protected`;
}

export function ProtectedBlocksCard({ data }: ProtectedBlocksCardProps) {
  return (
    <section
      aria-labelledby="protected-blocks-title"
      className="flex h-full min-h-[280px] flex-col rounded-[22px] border border-white/[0.06] bg-[#141f42] p-6 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] md:min-h-[320px] md:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="protected-blocks-title"
            className="text-lg font-semibold tracking-tight text-[#edf2ff] md:text-xl"
          >
            {data.title}
          </h2>
          <p className="mt-1.5 text-sm text-[#98a4bf]">{data.subtitle}</p>
        </div>
        <div className="shrink-0 rounded-xl p-1.5 text-[#45e0d4]/80">
          <IconBarChartMini />
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-6 flex flex-1 items-end gap-2 sm:gap-3">
        {data.daily.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            {/* Bar column */}
            <div
              className="relative w-full overflow-hidden rounded-xl"
              style={{ height: "120px" }}
            >
              {/* Background track */}
              <div className="absolute inset-0 rounded-xl bg-[#0d1833]" />
              {/* Filled portion — height proportional to rate */}
              {d.total > 0 ? (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 rounded-xl transition-all duration-700",
                    dayColor(d.protected, d.total),
                  )}
                  style={{
                    height: `${Math.max(12, (d.protected / d.total) * 100)}%`,
                  }}
                  title={dayTitle(d.day, d.protected, d.total, d.date)}
                />
              ) : (
                <div
                  className="absolute bottom-0 left-0 right-0 h-3 rounded-xl bg-[#141f42]"
                  title={dayTitle(d.day, d.protected, d.total, d.date)}
                />
              )}
            </div>

            {/* Count label */}
            <span
              className={cn(
                "text-[10px] font-semibold tabular-nums",
                d.total === 0
                  ? "text-[#3d4f70]"
                  : d.protected === d.total
                  ? "text-[#45e0d4]"
                  : d.protected > 0
                  ? "text-[#86c9ff]"
                  : "text-rose-300",
              )}
            >
              {dayLabel(d.protected, d.total)}
            </span>

            {/* Day label */}
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6]">
              {d.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.05] pt-4">
        {[
          { color: "bg-[#45e0d4]/80", label: "All protected" },
          { color: "bg-[#86c9ff]/60", label: "Partial" },
          { color: "bg-[#f7c22c]/50", label: "Low" },
          { color: "bg-rose-500/40", label: "None" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", item.color)} />
            <span className="text-[10px] text-[#7d89a6]">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
