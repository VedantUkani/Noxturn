import type { SandboxScheduleBlock } from "./types";

type ScheduleShiftCardProps = {
  block: SandboxScheduleBlock;
};

export function ScheduleShiftCard({ block }: ScheduleShiftCardProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#07142f] px-4 py-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c87a2]">
        {block.dayTimeLine}
      </p>
      <p className="mt-2 text-[15px] font-semibold tracking-tight text-[#edf2ff]">
        {block.shiftLabel}
      </p>
    </div>
  );
}
