import { IconMoon } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";
import type { ChronotypeModel } from "./types";

type ChronotypeCardProps = {
  data: ChronotypeModel;
};

export function ChronotypeCard({ data }: ChronotypeCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1b3a] p-5 pl-6 shadow-inner",
      )}
    >
      <div
        className="absolute inset-y-3 left-0 w-1 rounded-full bg-[#f4c22b]"
        aria-hidden
      />
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#07142f] text-[#f4c22b]">
          <IconMoon className="h-6 w-6" />
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-base font-semibold text-[#f4c22b]">{data.title}</p>
          <p className="text-sm leading-relaxed text-[#98a4bf]">
            {data.description}
          </p>
        </div>
      </div>
    </div>
  );
}
