import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-400",
        variant === "primary" &&
          "bg-teal-400 text-slate-950 hover:bg-teal-300",
        variant === "ghost" &&
          "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800",
        className,
      )}
    >
      {children}
    </Link>
  );
}
