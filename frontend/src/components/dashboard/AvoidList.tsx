import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { IconAlertTriangle } from "@/components/icons";

type Props = {
  items: string[];
};

export function AvoidList({ items }: Props) {
  if (!items.length) return null;

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>Avoid Today</CardTitle>
      </CardHeader>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
            <IconAlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
