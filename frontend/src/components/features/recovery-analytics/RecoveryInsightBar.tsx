import { IconLightbulb } from "./RecoveryIcons";
import type { RecoveryBottomInsightModel } from "./types";

type RecoveryInsightBarProps = {
  data: RecoveryBottomInsightModel;
};

export function RecoveryInsightBar({ data }: RecoveryInsightBarProps) {
  return (
    <section
      aria-label="Recovery insight"
      className="flex flex-col gap-4 rounded-[22px] border border-white/[0.06] bg-[#141f42] px-5 py-4 shadow-[0_14px_44px_-26px_rgba(0,0,0,0.85)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7 sm:py-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0c2a3d] text-[#45e0d4] sm:mt-0">
          <IconLightbulb />
        </div>
        <p className="text-[14px] leading-relaxed text-[#edf2ff] md:text-[15px]">
          {data.text}
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-xl border border-[#45e0d4]/55 bg-transparent px-5 py-2.5 text-[13px] font-semibold text-[#45e0d4] transition hover:bg-[#45e0d4]/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45"
      >
        {data.ctaLabel}
      </button>
    </section>
  );
}
