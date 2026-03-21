type Props = {
  value: number;      // 0–100
  size?: number;      // px
  strokeWidth?: number;
  color?: string;     // tailwind or hex
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
};

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  color = "#6366f1",
  trackColor = "#1e293b",
  label,
  sublabel,
  className = "",
}: Props) {
  const clamp = Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp / 100) * circ;
  const cx = size / 2;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {(label !== undefined || sublabel !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
          {label !== undefined && (
            <span className="text-lg font-bold text-slate-100 tabular-nums">{label}</span>
          )}
          {sublabel && (
            <span className="text-xs text-slate-500 mt-0.5">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
