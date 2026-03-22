import { IconShieldBadge } from "./SandboxIcons";

type HealthStatusPillProps = {
  label: string;
  value: string;
};

export function HealthStatusPill({ label, value }: HealthStatusPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#101c3c]/80 px-4 py-3 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07142f] text-[#7cd8ff] ring-1 ring-white/[0.08]">
        <IconShieldBadge className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7c87a2]">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold tracking-tight text-[#edf2ff]">
          {value}
        </p>
      </div>
    </div>
  );
}
