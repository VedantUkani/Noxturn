import { cn } from "@/lib/utils";
import type { RecoveryResilienceTrendsModel } from "./types";

type ResilienceTrendsCardProps = {
  data: RecoveryResilienceTrendsModel;
};

function buildSmoothPath(
  points: readonly { x: number; y: number }[],
  bottomY: number,
): { lineD: string; areaD: string } {
  if (points.length < 2) return { lineD: "", areaD: "" };
  let lineD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    lineD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const last = points[points.length - 1];
  const first = points[0];
  const areaD = `${lineD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  return { lineD, areaD };
}

export function ResilienceTrendsCard({ data }: ResilienceTrendsCardProps) {
  const w = 520;
  const h = 200;
  const padX = 36;
  const padY = 28;
  const bottomPad = 44;
  const innerW = w - padX * 2;
  const innerH = h - padY - bottomPad;

  const pts = data.points.map((p, i) => {
    const x =
      padX + (innerW * (i / Math.max(1, data.points.length - 1))) *
        (data.points.length === 1 ? 0 : 1);
    const y = padY + innerH * (1 - p.value);
    return { x, y };
  });

  const { lineD, areaD } = buildSmoothPath(pts, h);

  return (
    <section
      aria-labelledby="resilience-trends-title"
      className="flex h-full min-h-[280px] flex-col rounded-[22px] border border-white/[0.06] bg-[#141f42] p-6 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] md:min-h-[320px] md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="resilience-trends-title"
            className="text-lg font-semibold tracking-tight text-[#edf2ff] md:text-xl"
          >
            {data.title}
          </h2>
          <p className="mt-1.5 text-sm text-[#98a4bf]">{data.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.pills.map((pill) => {
            const isStable = pill === "STABLE";
            return (
              <span
                key={pill}
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                  isStable
                    ? "border-[#45e0d4]/50 text-[#45e0d4]"
                    : "border-[#7d89a6]/45 text-[#98a4bf]",
                )}
              >
                {pill}
              </span>
            );
          })}
        </div>
      </div>

      <div className="relative mt-6 min-h-0 flex-1">
        <svg
          className="h-[200px] w-full"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Resilience trend over four weeks"
        >
          <defs>
            <linearGradient id="resilience-line-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#45e0d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#45e0d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="resilience-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#45e0d4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#45e0d4" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={areaD} fill="url(#resilience-area)" />
          <path
            d={lineD}
            fill="none"
            stroke="#45e0d4"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>

        <div className="mt-1 flex justify-between px-1">
          {data.points.map((p) => (
            <span
              key={p.weekLabel}
              className="flex-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6]"
            >
              {p.weekLabel}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
