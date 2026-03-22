import { IconInfoCircle } from "./SandboxIcons";

type ScenarioInsightCalloutProps = {
  text: string;
};

export function ScenarioInsightCallout({ text }: ScenarioInsightCalloutProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#7cd8ff]/15 bg-[#07142f] px-3.5 py-3">
      <span className="mt-0.5 text-[#7cd8ff]">
        <IconInfoCircle />
      </span>
      <p className="text-[13px] leading-relaxed text-[#a0abc5]">{text}</p>
    </div>
  );
}
