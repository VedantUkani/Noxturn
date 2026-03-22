import { HealthStatusPill } from "./HealthStatusPill";
import type { SandboxHealthStatus } from "./types";

type SandboxHeaderProps = {
  title: string;
  description: string;
  healthStatus: SandboxHealthStatus;
};

export function SandboxHeader({
  title,
  description,
  healthStatus,
}: SandboxHeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-[#edf2ff] md:text-[2rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#a0abc5]">
          {description}
        </p>
      </div>
      <div className="shrink-0 lg:pt-1">
        <HealthStatusPill label={healthStatus.label} value={healthStatus.value} />
      </div>
    </header>
  );
}
