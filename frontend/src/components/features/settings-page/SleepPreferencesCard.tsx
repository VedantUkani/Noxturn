import { cn } from "@/lib/utils";
import type { SleepPreferencesModel } from "./types";
import { AnchorSleepWindow } from "./AnchorSleepWindow";
import { ChronotypeCard } from "./ChronotypeCard";
import { SleepDurationDisplay } from "./SleepDurationDisplay";

const card = "rounded-[22px] border border-white/[0.06] bg-[#141f42] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]";
const colLabel = "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]";

type SleepPreferencesCardProps = {
  data: SleepPreferencesModel;
};

export function SleepPreferencesCard({ data }: SleepPreferencesCardProps) {
  return (
    <section
      className={cn("p-6 sm:p-8", card)}
      aria-labelledby="sleep-preferences-heading"
    >
      <h2
        id="sleep-preferences-heading"
        className="text-lg font-semibold text-[#f4c22b]"
      >
        {data.cardTitle}
      </h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-8 xl:gap-10">
        <div className="space-y-4">
          <p className={colLabel}>{data.chronotype.columnLabel}</p>
          <ChronotypeCard data={data.chronotype} />
        </div>
        <div className="space-y-4">
          <p className={colLabel}>{data.duration.columnLabel}</p>
          <SleepDurationDisplay data={data.duration} />
        </div>
        <div className="space-y-4">
          <p className={colLabel}>{data.anchor.columnLabel}</p>
          <AnchorSleepWindow data={data.anchor} />
        </div>
      </div>
    </section>
  );
}
