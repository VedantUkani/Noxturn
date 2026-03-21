import { AvoidanceCard } from "./AvoidanceCard";
import { WhatToAvoidSection } from "./WhatToAvoidSection";
import type { TodayAvoidanceItem } from "./today-demo-data";
import { todayAvoidanceGridClass } from "./today-surfaces";
import { TodayWarningSectionIcon, todayAvoidanceIcons } from "./today-icons";

type TodayAvoidanceBlockProps = {
  items: readonly TodayAvoidanceItem[];
  onEvidence?: (id: string) => void;
};

export function TodayAvoidanceBlock({
  items,
  onEvidence,
}: TodayAvoidanceBlockProps) {
  if (items.length === 0) return null;

  return (
    <WhatToAvoidSection title="What to Avoid" titleIcon={<TodayWarningSectionIcon />}>
      <div className={todayAvoidanceGridClass}>
        {items.map((item) => (
          <AvoidanceCard
            key={item.id}
            icon={todayAvoidanceIcons[item.icon]}
            title={item.title}
            detail={item.detail}
            onEvidence={
              onEvidence ? () => onEvidence(item.id) : undefined
            }
          />
        ))}
      </div>
    </WhatToAvoidSection>
  );
}
