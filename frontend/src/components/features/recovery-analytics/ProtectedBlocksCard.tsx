import { IconBarChartMini } from "./RecoveryIcons";
import type { RecoveryProtectedBlocksModel } from "./types";

type ProtectedBlocksCardProps = {
  data: RecoveryProtectedBlocksModel;
};

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

      <div className="relative mt-6 min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#0a1228]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27px,
              rgba(69, 224, 212, 0.06) 27px,
              rgba(69, 224, 212, 0.06) 28px
            )`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1228]/90" />
      </div>

      <div className="mt-4 flex justify-between gap-1 px-0.5">
        {data.weekdayLabels.map((d) => (
          <span
            key={d}
            className="flex-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6]"
          >
            {d}
          </span>
        ))}
      </div>
    </section>
  );
}
