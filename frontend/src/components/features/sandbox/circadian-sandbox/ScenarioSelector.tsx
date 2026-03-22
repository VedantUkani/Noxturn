"use client";

import type { SandboxScenarioOption } from "./types";

type ScenarioSelectorProps = {
  label: string;
  options: SandboxScenarioOption[];
  value: string;
  onChange: (scenarioId: string) => void;
};

export function ScenarioSelector({
  label,
  options,
  value,
  onChange,
}: ScenarioSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c87a2]">
        {label}
      </p>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#2e3653] px-4 py-3 pr-11 text-[14px] font-medium text-[#edf2ff] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] outline-none transition hover:border-white/[0.12] focus-visible:ring-2 focus-visible:ring-[#7cd8ff]/45"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.selectLabel}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a0abc5]">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
