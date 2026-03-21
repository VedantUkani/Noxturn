type Props = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

export function Spinner({ size = "md", className = "" }: Props) {
  return (
    <div
      className={[
        "rounded-full border-slate-700 border-t-indigo-500 animate-spin",
        SIZES[size],
        className,
      ].join(" ")}
      role="status"
      aria-label="Loading"
    />
  );
}
