import type { RecoveryPageHeaderModel } from "./types";

type RecoveryHeaderProps = {
  header: RecoveryPageHeaderModel;
};

export function RecoveryHeader({ header }: RecoveryHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-[2.35rem] font-bold leading-[1.12] tracking-tight md:text-[2.65rem]">
        <span className="text-[#edf2ff]">{header.titleWhite}</span>{" "}
        <span className="text-[#45e0d4]">{header.titleAccent}</span>
      </h1>
    </header>
  );
}
