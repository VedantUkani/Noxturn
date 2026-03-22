import { cn } from "@/lib/utils";
import type { AnchorSleepModel } from "./types";

type AnchorSleepWindowProps = {
  data: AnchorSleepModel;
};

const box =
  "flex flex-1 flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#0f1b3a] px-4 py-4 text-center";

export function AnchorSleepWindow({ data }: AnchorSleepWindowProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className={cn(box, "min-h-[5.5rem]")}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6]">
            {data.startLabel}
          </span>
          <span className="mt-2 text-lg font-semibold tabular-nums text-[#edf2ff]">
            {data.startTime}
          </span>
        </div>
        <div className={cn(box, "min-h-[5.5rem]")}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6]">
            {data.endLabel}
          </span>
          <span className="mt-2 text-lg font-semibold tabular-nums text-[#edf2ff]">
            {data.endTime}
          </span>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-[#7d89a6]">{data.note}</p>
    </div>
  );
}
