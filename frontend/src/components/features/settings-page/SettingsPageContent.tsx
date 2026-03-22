"use client";

import { useCallback } from "react";
import { SETTINGS_PAGE_MOCK } from "./settings-mock-data";
import { ProfileAccountCardEditable } from "./ProfileAccountCardEditable";
import { SleepPreferencesCardEditable } from "./SleepPreferencesCardEditable";
import { SettingsFooterRow } from "./SettingsFooterRow";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsTopBar } from "./SettingsTopBar";
import { WearableSyncCard } from "./WearableSyncCard";
import { useUserSettingsViewModel } from "./useUserSettingsViewModel";
import type { SettingsPageViewModel } from "./types";
import type { UserProfileSettings } from "@/lib/user-profile-settings";
import { persistUserProfileSettings } from "@/lib/user-profile-settings";

type SettingsPageContentProps = {
  /** Pass server-fetched model later; defaults to mock. */
  data?: SettingsPageViewModel;
};

export function SettingsPageContent({
  data: baseData = SETTINGS_PAGE_MOCK,
}: SettingsPageContentProps) {
  const { data, effectiveProfile, commitProfile } = useUserSettingsViewModel({
    base: baseData,
  });

  const handleSave = useCallback(
    async (profile: UserProfileSettings) => {
      await persistUserProfileSettings(profile);
      commitProfile(profile);
    },
    [commitProfile],
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] pb-10">
      <SettingsTopBar data={data.topBar} />
      <SettingsHeader data={data.header} />

      <div className="flex flex-col gap-8">
        <ProfileAccountCardEditable
          profile={effectiveProfile}
          onSave={handleSave}
        />
        <SleepPreferencesCardEditable
          data={data.sleep}
          profile={effectiveProfile}
          onSave={handleSave}
        />
        <WearableSyncCard />
      </div>

      <SettingsFooterRow data={data.footer} />
    </div>
  );
}
