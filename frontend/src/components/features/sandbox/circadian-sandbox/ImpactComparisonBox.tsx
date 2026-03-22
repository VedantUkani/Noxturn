type ImpactComparisonBoxProps = {
  currentScore: number;
  scenarioScore: number;
  circadianDebtLine: string;
};

export function ImpactComparisonBox({
  currentScore,
  scenarioScore,
  circadianDebtLine,
}: ImpactComparisonBoxProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07142f] px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c87a2]">
            Current
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-[#45e0d4]">
            {currentScore}
          </p>
        </div>

        <div className="relative flex min-h-[30px] min-w-0 flex-1 items-center justify-center px-1">
          <div
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-[#45e0d4]/35 via-[#45e0d4] to-[#f3aaa4]/45"
            aria-hidden
          />
          <svg
            viewBox="0 0 56 18"
            className="relative z-[1] h-[18px] w-14"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 9h14l4 5 4-5h18"
              stroke="#45e0d4"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M44 6l4 3-4 3"
              stroke="#f3aaa4"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c87a2]">
            Scenario
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-[#f3aaa4]">
            {scenarioScore}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] font-medium text-[#f4c22b]">
        {circadianDebtLine}
      </p>
    </div>
  );
}
