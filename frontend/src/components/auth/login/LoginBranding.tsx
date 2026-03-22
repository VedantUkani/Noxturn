import { APP_NAME, APP_TAGLINE, LOGIN_VALUE_PROPOSITION } from "@/lib/constants";
import { nxMarketing } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

export function LoginBranding() {
  return (
    <header className="mb-9 text-center sm:mb-10">
      <p
        className={cn(
          nxMarketing.eyebrow,
          "text-[#86c9ff]/90 [letter-spacing:0.22em]",
        )}
      >
        {APP_TAGLINE.toUpperCase()}
      </p>
      <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-[#edf2ff] sm:text-[2.25rem]">
        {APP_NAME}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#98a4bf] sm:text-base">
        {LOGIN_VALUE_PROPOSITION}
      </p>
    </header>
  );
}
