"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { type Severity, SEVERITY_META } from "@/lib/types";
import { useA11y } from "@/contexts/AccessibilityContext";

type DayRisk = { severity: Severity; label: string };

type Props = {
  weekDates: string[];
  risks: Record<string, DayRisk>;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return DAYS[d.getDay()];
}

function formatDate(iso: string): string {
  return iso.slice(8); // day number
}

export function RiskCalendar({ weekDates, risks }: Props) {
  const { t } = useA11y();
  const dates = weekDates.length
    ? weekDates
    : Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
      });

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>{t("dashboard", "riskMap")}</CardTitle>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-700" /> ok</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-700" /> mod</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-700" /> high</span>
        </div>
      </CardHeader>

      <div className="grid grid-cols-7 gap-1.5">
        {dates.map((day, i) => {
          const risk = risks[day];
          const sev: Severity = risk?.severity ?? "low";
          const meta = SEVERITY_META[sev];
          const noRisk = !risk;

          return (
            <div
              key={day || i}
              title={risk ? `${day}: ${risk.label.replace(/_/g, " ")} (${risk.severity})` : `${day}: no risk`}
              className={[
                "rounded-lg border flex flex-col items-center justify-center py-2 px-1 gap-0.5 text-center",
                "transition-colors duration-150",
                noRisk
                  ? "bg-emerald-950/40 border-emerald-900/40"
                  : meta.bg,
              ].join(" ")}
            >
              <span className="text-xs text-slate-500 leading-none">{day ? formatDay(day) : DAYS[i]}</span>
              <span className={`text-base font-bold leading-none ${noRisk ? "text-emerald-400" : meta.color}`}>
                {day ? formatDate(day) : i + 1}
              </span>
              {risk && (
                <span className={`text-[9px] font-medium leading-none mt-0.5 ${meta.color}`}>
                  {risk.label.replace(/_/g, " ").slice(0, 8)}
                </span>
              )}
              {!risk && (
                <span className="text-[9px] text-emerald-600 leading-none mt-0.5">ok</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
