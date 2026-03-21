import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

/** Simple surface for route placeholders; swap for richer cards later. */
export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-800 bg-slate-900/50 p-4 sm:p-5",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate-400">{children}</div>
    </section>
  );
}
