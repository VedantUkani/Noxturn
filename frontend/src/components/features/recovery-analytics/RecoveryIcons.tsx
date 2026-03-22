import { cn } from "@/lib/utils";

type IconProps = { className?: string };

export function IconShieldPlus({ className }: IconProps) {
  return (
    <svg
      className={cn("h-7 w-7", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7 4v5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V7l7-4z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v8M8 12h8"
      />
    </svg>
  );
}

export function IconBarChartMini({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" d="M4 19V5M4 19h16" />
      <path strokeLinecap="round" d="M8 19v-5M12 19V9M16 19v-3" />
    </svg>
  );
}

export function IconSunRecovery({ className }: IconProps) {
  return (
    <svg
      className={cn("h-6 w-6", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

export function IconCoffee({ className }: IconProps) {
  return (
    <svg
      className={cn("h-6 w-6", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 8h10a4 4 0 010 8H4c0-2.5 0-5 2-8z"
      />
      <path strokeLinecap="round" d="M16 10h2a2 2 0 012 2v0a2 2 0 01-2 2h-2M6 18h8" />
    </svg>
  );
}

export function IconSparklesThree({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 3l1.2 3.6L15 8l-3.8 1.4L10 13l-1.2-3.6L5 8l3.8-1.4L10 3z" />
      <path
        d="M18 5l.6 1.8L20.5 8l-1.9.7L18 10.5l-.6-1.8L15.5 8l1.9-.7L18 5z"
        opacity=".85"
      />
      <path
        d="M17 15l.8 2.4L20 18l-2.2.8L17 21l-.8-2.4L14 18l2.2-.8L17 15z"
        opacity=".7"
      />
    </svg>
  );
}

export function IconLightbulb({ className }: IconProps) {
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
        d="M9 18h6M10 22h4M12 2a6 6 0 00-3 11.2V16h6v-2.8A6 6 0 0012 2z"
      />
    </svg>
  );
}

export function IconCircleHelp({ className }: IconProps) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        d="M9.5 9.5a2.5 2.5 0 114.2 1.8c-.8.8-1.2 1.4-1.2 2.2V15"
      />
      <path strokeLinecap="round" d="M12 17h.01" />
    </svg>
  );
}

export function IconUserOutline({ className }: IconProps) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        strokeLinecap="round"
        d="M6.5 20.5v-1c0-2.5 2-4.5 5.5-4.5s5.5 2 5.5 4.5v1"
      />
    </svg>
  );
}
