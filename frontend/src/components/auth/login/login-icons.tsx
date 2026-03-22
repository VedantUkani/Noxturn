import type { SVGProps } from "react";

export function GoogleGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function MicrosoftGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" {...props}>
      <path fill="#F35325" d="M2 2h9.5v9.5H2V2z" />
      <path fill="#81BC06" d="M12.5 2H22v9.5h-9.5V2z" />
      <path fill="#05A6F0" d="M2 12.5h9.5V22H2v-9.5z" />
      <path fill="#FFBA08" d="M12.5 12.5H22V22h-9.5v-9.5z" />
    </svg>
  );
}

export function EyeOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" {...props}>
      <path
        fill="currentColor"
        d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      />
    </svg>
  );
}

export function EyeClosedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" {...props}>
      <path
        fill="currentColor"
        d="M2 5.27 5.78 9.05A10.99 10.99 0 0 0 2 12c1.73 3.89 6 7 11 7 1.52 0 2.96-.3 4.27-.86L18.73 19 20 17.73 3.27 1 2 5.27zM7.53 10.8l1.55 1.55A3 3 0 0 0 12 15a3 3 0 0 0 2.13-.88l1.7 1.7A5 5 0 0 1 12 17a5 5 0 0 1-4.47-2.8zM12 7a5 5 0 0 1 4.47 2.8l-1.7 1.7A3 3 0 0 0 12 9c-.66 0-1.27.2-1.78.55L9.05 7.38A4.98 4.98 0 0 1 12 7zm7.8 4.47c.5-.9.8-1.86.8-2.47 0-.61-.3-1.57-.8-2.47L22 12l-2.2-2.53z"
      />
    </svg>
  );
}
