import { cn } from "@/lib/utils";

type IconProps = { className?: string };

export function IconSearchSettings({ className }: IconProps) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

export function IconCarCommute({ className }: IconProps) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12 0V9.877"
      />
    </svg>
  );
}

export function IconDownloadJson({ className }: IconProps) {
  return (
    <svg
      className={cn("h-[18px] w-[18px]", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

export function IconShieldCheck({ className }: IconProps) {
  return (
    <svg
      className={cn("h-[18px] w-[18px]", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

export function IconOuraTile({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity={0.35} />
    </svg>
  );
}

export function IconWhoopTile({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect
        x="5"
        y="7"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M9 11h6M9 14h4"
      />
    </svg>
  );
}

export function IconAppleHealthTile({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 4.5c-1.1-1.6-3.1-2.5-5-2-2.4.6-4 2.8-4 5.2 0 3.5 3.2 6.4 7 9.3.4.3 1 .3 1.4 0 3.8-2.9 7-5.8 7-9.3 0-2.4-1.6-4.6-4-5.2-1.9-.5-3.9.4-5 2z" />
    </svg>
  );
}

export function IconCheckSmall({ className }: IconProps) {
  return (
    <svg
      className={cn("h-3.5 w-3.5", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
