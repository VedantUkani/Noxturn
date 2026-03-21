import { RecoveryRecommendationCard } from "./RecoveryRecommendationCard";
import type { TodayRecommendation, TodayRecommendationId } from "./today-demo-data";
import { todayRecommendationGridClass } from "./today-surfaces";
import { todayRecommendationIcons } from "./today-icons";
import { cn } from "@/lib/utils";

type TodayRecommendationsRowProps = {
  items: readonly TodayRecommendation[];
  /** Pulse all cards briefly after a plan update. */
  pulse?: boolean;
  onEvidence?: (id: TodayRecommendationId) => void;
};

export function TodayRecommendationsRow({
  items,
  pulse,
  onEvidence,
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
          onEvidence={
            onEvidence ? () => onEvidence(item.id) : undefined
          }
          className={cn(
            pulse && "animate-reweave-emphasis ring-1 ring-teal-400/25",
          )}
        />
      ))}
    </div>
  );
}
