import { RecoveryRecommendationCard } from "./RecoveryRecommendationCard";
import type { TodayRecommendation } from "./today-demo-data";
import { todayRecommendationGridClass } from "./today-surfaces";
import { todayRecommendationIcons } from "./today-icons";
import { cn } from "@/lib/utils";

type TodayRecommendationsRowProps = {
  items: readonly TodayRecommendation[];
  /** Pulse all cards briefly after a plan update. */
  pulse?: boolean;
};

export function TodayRecommendationsRow({
  items,
  pulse,
}: TodayRecommendationsRowProps) {
  return (
    <div className={todayRecommendationGridClass}>
      {items.map((item) => (
        <RecoveryRecommendationCard
          key={item.id}
          icon={todayRecommendationIcons[item.id]}
          title={item.title}
          value={item.value}
          note={item.note}
          className={cn(
            pulse && "animate-reweave-emphasis ring-1 ring-[#45e0d4]/25",
          )}
        />
      ))}
    </div>
  );
}
