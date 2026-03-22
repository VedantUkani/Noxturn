import type { SleepDurationModel } from "./types";

type SleepDurationDisplayProps = {
  data: SleepDurationModel;
};

export function SleepDurationDisplay({ data }: SleepDurationDisplayProps) {
  const ratio = Math.min(1, Math.max(0, data.sliderFillRatio));

  return (
    <div className="space-y-4">
      <p className="text-2xl font-semibold tracking-tight text-[#edf2ff] md:text-[1.65rem]">
        {data.hoursLabel}
      </p>
      <div className="relative pt-1" role="img" aria-label="Sleep duration slider (preview)">
        <span className="sr-only">
          Preferred duration set to {data.hoursLabel}. Interactive adjustment is not
          connected yet.
        </span>
        <div className="relative h-2.5 w-full rounded-full bg-[#0f1b3a]">
          <div
            className="absolute left-0 top-0 h-2.5 rounded-full bg-gradient-to-r from-[#45e0d4]/50 to-[#45e0d4]"
            style={{ width: `${ratio * 100}%` }}
          />
          <div
            className="pointer-events-none absolute top-1/2 z-[1] h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#45e0d4] bg-[#141f42] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            style={{ left: `calc(${ratio * 100}% - 10px)` }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
