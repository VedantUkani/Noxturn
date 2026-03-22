import Link from "next/link";
import type { SettingsFooterModel } from "./types";

type SettingsFooterRowProps = {
  data: SettingsFooterModel;
};

export function SettingsFooterRow({ data }: SettingsFooterRowProps) {
  return (
    <footer className="mt-14 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm text-[#98a4bf]">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-[#45e0d4]"
          aria-hidden
        />
        <span>{data.brandLine}</span>
      </p>
      <nav
        className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#98a4bf]"
        aria-label="Footer links"
      >
        {data.links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="transition-colors hover:text-[#edf2ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
