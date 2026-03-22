import { IconSparkleCluster } from "./SandboxIcons";
import { MitigationItem } from "./MitigationItem";
import type { SandboxMitigationItem } from "./types";

type MitigationPlanCardProps = {
  title: string;
  items: SandboxMitigationItem[];
  acceptLabel: string;
  exploreLabel: string;
};

export function MitigationPlanCard({
  title,
  items,
  acceptLabel,
  exploreLabel,
}: MitigationPlanCardProps) {
  return (
    <section className="flex h-full flex-col rounded-[22px] border border-white/[0.07] bg-[#141f42] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2.5">
        <span className="text-[#f4c22b]">
          <IconSparkleCluster className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-[#edf2ff]">
          {title}
        </h2>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {items.map((item) => (
          <MitigationItem key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <button
          type="button"
          className="w-full rounded-2xl bg-[#6a2736] px-4 py-3.5 text-[14px] font-semibold text-[#edf2ff] shadow-[0_12px_40px_-18px_rgba(106,39,54,0.55)] transition hover:brightness-110 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#f3aaa4]/35"
        >
          {acceptLabel}
        </button>
        <button
          type="button"
          className="w-full rounded-2xl border border-white/[0.08] bg-[#101c3c] px-4 py-3.5 text-[14px] font-semibold text-[#edf2ff] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition hover:bg-[#141f42] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#7cd8ff]/25"
        >
          {exploreLabel}
        </button>
      </div>
    </section>
  );
}
