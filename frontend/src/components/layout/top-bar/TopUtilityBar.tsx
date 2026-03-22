import { AccessibilityMenu } from "@/components/accessibility";
import { NotificationsUpdatesMenu } from "./NotificationsUpdatesMenu";
import { SettingsMenu } from "./SettingsMenu";

export function TopUtilityBar() {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
      <AccessibilityMenu variant="compact" />
      <NotificationsUpdatesMenu />
      <SettingsMenu />
    </div>
  );
}
