import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** Four vertical bars — Week nav (screenshot). */
export function IconWeekBars({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <rect x="3" y="3" width="3.5" height="18" rx="1" />
      <rect x="9.25" y="6" width="3.5" height="15" rx="1" />
      <rect x="15.5" y="9" width="3.5" height="12" rx="1" />
      <rect x="21.75" y="5" width="2.25" height="16" rx="1" />
    </svg>
  );
}

export function IconShieldBadge({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

export function IconSparkleCluster({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.2 4.2L17 7l-3.8 1.8L12 13l-1.2-4.2L7 7l3.8-1.8L12 2zM19 13l.7 2.4L22 16l-2.3 1.1L19 19.5l-1.1-2.4L15.5 16l2.4-1.1L19 13zM5 14l.9 3.1L9 18l-3.1 1.5L5 22.5 3.4 19.5.5 18l3.1-1.5L5 14z" />
    </svg>
  );
}

export function IconInfoCircle({ className }: IconProps) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.123.449l1.682 5.03a.75.75 0 01-1.23.71l-1.682-5.03a.75.75 0 01.449-1.11zM12 9a1 1 0 100-2 1 1 0 000 2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      />
    </svg>
  );
}
