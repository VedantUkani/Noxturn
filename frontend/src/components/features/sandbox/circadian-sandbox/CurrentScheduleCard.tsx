import { IconCalendar } from "@/components/icons/NavIcons";
import { ScheduleShiftCard } from "./ScheduleShiftCard";
import { ScenarioInsightCallout } from "./ScenarioInsightCallout";
import { ScenarioSelector } from "./ScenarioSelector";
import type { SandboxScheduleBlock, SandboxScenarioOption } from "./types";

type CurrentScheduleCardProps = {
  title: string;
  blocks: SandboxScheduleBlock[];
  newScenarioTitle: string;
  targetShiftLabel: string;
  scenarioOptions: SandboxScenarioOption[];
  selectedScenarioId: string;
  onScenarioChange: (id: string) => void;
};

export function CurrentScheduleCard({
  title,
  blocks,
  newScenarioTitle,
  targetShiftLabel,
  scenarioOptions,
  selectedScenarioId,
  onScenarioChange,
}: CurrentScheduleCardProps) {
  const selected = scenarioOptions.find((o) => o.id === selectedScenarioId);
  const insight = selected?.insightCallout ?? "";

  return (
    <section className="flex h-full flex-col rounded-[22px] border border-white/[0.07] bg-[#141f42] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2.5">
        <span className="text-[#45e0d4]">
          <IconCalendar className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-[#edf2ff]">
          {title}
        </h2>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {blocks.map((b) => (
          <ScheduleShiftCard key={b.id} block={b} />
        ))}
      </div>

      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#45e0d4]">
        {newScenarioTitle}
      </p>

      <div className="mt-4 space-y-4">
        <ScenarioSelector
          label={targetShiftLabel}
          options={scenarioOptions}
          value={selectedScenarioId}
          onChange={onScenarioChange}
        />
        <ScenarioInsightCallout text={insight} />
      </div>
    </section>
  );
}
