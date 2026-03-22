import type { SVGProps } from "react";

/** Universal access / accessibility symbol — stroke icon for triggers and panels. */
export function AccessibilityIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      {...props}
    >
      <circle cx={12} cy={4} r={1.5} />
      <path d="M6 8h12" />
      <path d="M12 8v13" />
      <path d="M8 21l4-5 4 5" />
    </svg>
  );
}
