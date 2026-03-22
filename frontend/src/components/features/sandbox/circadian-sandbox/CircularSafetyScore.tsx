type CircularSafetyScoreProps = {
  score: number;
  ringFillPercent: number;
  label: string;
};

/**
 * Ring progress uses `ringFillPercent` (0–100) for the coral arc length.
 * Score is displayed as the large center number.
 */
export function CircularSafetyScore({
  score,
  ringFillPercent,
  label,
}: CircularSafetyScoreProps) {
  const r = 108;
  const stroke = 16;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, ringFillPercent)) / 100) * c;

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 260 260"
        role="img"
        aria-label={`${label} ${score}`}
      >
        <defs>
          <linearGradient id="sandboxRingTrack" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#101c3c" />
            <stop offset="100%" stopColor="#0c1734" />
          </linearGradient>
        </defs>
        <circle
          cx="130"
          cy="130"
          r={r}
          fill="none"
          stroke="url(#sandboxRingTrack)"
          strokeWidth={stroke}
          className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        />
        <circle
          cx="130"
          cy="130"
          r={r}
          fill="none"
          stroke="#f3aaa4"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-[stroke-dasharray] duration-500 ease-out"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-bold tabular-nums tracking-tight text-[#edf2ff] md:text-6xl">
          {score}
        </p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7c87a2]">
          {label}
        </p>
      </div>
    </div>
  );
}
