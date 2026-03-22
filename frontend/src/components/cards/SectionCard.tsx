import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

/** Shared section surface — Recovery-aligned card treatment. */
export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        nx.card,
        "p-5 sm:p-6",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-[#edf2ff]">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-[#98a4bf]">{children}</div>
    </section>
  );
}
