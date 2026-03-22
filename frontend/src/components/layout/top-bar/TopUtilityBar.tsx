import { AccessibilityMenu } from "@/components/accessibility";
import { TodayModePill } from "./TodayModePill";
import { NotificationsUpdatesMenu } from "./NotificationsUpdatesMenu";
import { SettingsMenu } from "./SettingsMenu";

type TopUtilityBarProps = {
  /** When true, mode pill uses compact text on small screens only (handled inside via responsive classes). */
  showModePill?: boolean;
};

export function TopUtilityBar({ showModePill = true }: TopUtilityBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
      <AccessibilityMenu variant="compact" />
      {showModePill ? (
        <>
          <TodayModePill className="hidden sm:inline-flex" />
          <TodayModePill compact className="sm:hidden" />
        </>
      ) : null}
      <NotificationsUpdatesMenu />
      <SettingsMenu />
    </div>
  );
}
