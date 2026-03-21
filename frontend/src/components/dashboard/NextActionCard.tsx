import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconArrowRight, IconClock } from "@/components/icons";
import { type NextBestAction } from "@/lib/types";

type Props = {
  action: NextBestAction | null | undefined;
};

const CATEGORY_COLORS: Record<string, string> = {
  sleep:          "indigo",
  nap:            "violet",
  caffeine_cutoff: "amber",
  light_timing:   "cyan",
  meal:           "emerald",
  movement:       "emerald",
  safety:         "red",
  mindfulness:    "violet",
  relaxation:     "violet",
  buddy_checkin:  "slate",
  social:         "slate",
};

export function NextActionCard({ action }: Props) {
  if (!action) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 p-4 flex items-center justify-center min-h-[96px]">
        <p className="text-sm text-slate-600">No active plan — generate one to see your next action.</p>
      </div>
    );
  }

  const catColor = (CATEGORY_COLORS[action.category ?? ""] ?? "indigo") as Parameters<typeof Badge>[0]["color"];
  const time = action.scheduled_time
    ? new Date(action.scheduled_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded-xl bg-indigo-950/40 border border-indigo-800/50 p-4 glow-indigo">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Next Action</span>
          {action.category && (
            <Badge color={catColor} size="xs">{action.category.replace("_", " ")}</Badge>
          )}
        </div>
        {time && (
          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <IconClock size={12} />
            {time}
          </div>
        )}
      </div>

      <p className="text-base font-semibold text-slate-100 mb-1.5">{action.title}</p>
      {action.why_now && (
        <p className="text-sm text-slate-400 leading-relaxed">{action.why_now}</p>
      )}

      <div className="flex items-center gap-1 mt-3 text-xs text-indigo-400 font-medium">
        <IconArrowRight size={12} />
        <span>Take action now</span>
      </div>
    </div>
  );
}
