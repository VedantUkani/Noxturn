import { type ReactNode } from "react";

type Variant = "default" | "elevated" | "glow" | "flat";

const VARIANTS: Record<Variant, string> = {
  default:  "bg-slate-900 border border-slate-800",
  elevated: "bg-slate-800/80 border border-slate-700/60 shadow-xl shadow-black/30",
  glow:     "bg-slate-900/80 border border-indigo-800/40 shadow-lg shadow-indigo-950/40",
  flat:     "bg-slate-900/50 border border-slate-800/50",
};

type Props = {
  variant?: Variant;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

const PADDING = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
};

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  onClick,
}: Props) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={[
        "rounded-xl",
        VARIANTS[variant],
        PADDING[padding],
        onClick ? "cursor-pointer hover:border-slate-600 transition-colors duration-150 text-left w-full" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-sm font-semibold text-slate-400 uppercase tracking-wider ${className}`}>
      {children}
    </h3>
  );
}
