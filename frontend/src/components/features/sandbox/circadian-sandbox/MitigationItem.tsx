import type { ComponentType } from "react";
import { IconCoffee, IconMoon, IconSun } from "@/components/icons/NavIcons";
import type { SandboxMitigationIcon, SandboxMitigationItem as T } from "./types";

const iconMap: Record<SandboxMitigationIcon, ComponentType<{ className?: string }>> =
  {
  moon: IconMoon,
  sun: IconSun,
  coffee: IconCoffee,
};

export function MitigationItem({ item }: { item: T }) {
  const Icon = iconMap[item.icon];
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#07142f] text-[#f4c22b] ring-1 ring-white/[0.08]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold tracking-tight text-[#edf2ff]">
          {item.title}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#a0abc5]">
          {item.description}
        </p>
      </div>
    </div>
  );
}
