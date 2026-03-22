import { cn } from "@/lib/utils";
import type { SandboxMetricStat } from "./types";

const toneClass: Record<
  SandboxMetricStat["tone"],
  { primary: string }
> = {
  default: { primary: "text-[#edf2ff]" },
  coral: { primary: "text-[#f3aaa4]" },
  yellow: { primary: "text-[#f4c22b]" },
  teal: { primary: "text-[#45e0d4]" },
};

export function MetricStatCard({ metric }: { metric: SandboxMetricStat }) {
  const t = toneClass[metric.tone];
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-[#141f42] px-5 py-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.85)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7c87a2]">
        {metric.label}
      </p>
      <p
        className={cn(
          "mt-2 text-xl font-bold tabular-nums tracking-tight",
          t.primary,
        )}
      >
        {metric.primary}
      </p>
      <p className="mt-1 text-[12px] text-[#a0abc5]">{metric.secondary}</p>
    </div>
  );
}
