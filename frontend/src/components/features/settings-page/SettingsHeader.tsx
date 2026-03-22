import type { SettingsHeaderModel } from "./types";

type SettingsHeaderProps = {
  data: SettingsHeaderModel;
};

export function SettingsHeader({ data }: SettingsHeaderProps) {
  return (
    <header className="mb-10 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45e0d4]">
        {data.eyebrow}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-[#edf2ff] md:text-[2rem] md:leading-tight">
        {data.title}
      </h1>
      <p className="max-w-3xl text-base leading-relaxed text-[#98a4bf]">
        {data.subtitle}
      </p>
    </header>
  );
}
