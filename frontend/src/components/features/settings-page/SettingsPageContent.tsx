"use client";

import { useCallback, useState } from "react";
import { SETTINGS_PAGE_MOCK } from "./settings-mock-data";
import { DataPrivacyCard } from "./DataPrivacyCard";
import { EditProfilePanel } from "./edit-profile/EditProfilePanel";
import { ProfileAccountCard } from "./ProfileAccountCard";
import { SettingsFooterRow } from "./SettingsFooterRow";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsTopBar } from "./SettingsTopBar";
import { SleepPreferencesCard } from "./SleepPreferencesCard";
import { useUserSettingsViewModel } from "./useUserSettingsViewModel";
import { WearableSyncCard } from "./WearableSyncCard";
import type { SettingsPageViewModel } from "./types";
import type { UserProfileSettings } from "@/lib/user-profile-settings";

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
  const [editOpen, setEditOpen] = useState(false);

  const handleSaved = useCallback(
    (profile: UserProfileSettings) => {
      commitProfile(profile);
    },
    [commitProfile],
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] pb-10">
      <SettingsTopBar data={data.topBar} />
      <SettingsHeader data={data.header} />

      <EditProfilePanel
        open={editOpen}
        initialProfile={effectiveProfile}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
      />

      <div className="flex flex-col gap-8">
        <ProfileAccountCard
          data={data.profile}
          onEditProfile={() => setEditOpen(true)}
        />
        <SleepPreferencesCard data={data.sleep} />

        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-8">
            <WearableSyncCard data={data.wearables} />
          </div>
          <div className="lg:col-span-4">
            <DataPrivacyCard data={data.privacy} />
          </div>
        </div>
      </div>

      <SettingsFooterRow data={data.footer} />
    </div>
  );
}
