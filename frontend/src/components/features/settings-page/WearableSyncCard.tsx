import { cn } from "@/lib/utils";
import type { WearableSyncModel } from "./types";
import {
  IconAppleHealthTile,
  IconOuraTile,
  IconWhoopTile,
} from "./settings-icons";
import { WearableRow } from "./WearableRow";

const card = "rounded-[22px] border border-white/[0.06] bg-[#141f42] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]";

type WearableSyncCardProps = {
  data: WearableSyncModel;
};

function iconForId(id: string) {
  switch (id) {
    case "oura":
      return <IconOuraTile />;
    case "whoop":
      return <IconWhoopTile />;
    case "apple":
      return <IconAppleHealthTile className="text-rose-400" />;
    default:
      return <IconOuraTile />;
  }
}

export function WearableSyncCard({ data }: WearableSyncCardProps) {
  return (
    <section
      className={cn("p-6 sm:p-8", card)}
      aria-labelledby="wearable-sync-heading"
    >
      <h2
        id="wearable-sync-heading"
        className="text-lg font-semibold text-[#45e0d4]"
      >
        {data.cardTitle}
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        {data.items.map((item) => (
          <WearableRow key={item.id} data={item} icon={iconForId(item.id)} />
        ))}
      </div>
    </section>
  );
}
