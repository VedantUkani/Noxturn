"use client";

import { useEffect, useState, useMemo } from "react";
import { SETTINGS_PAGE_MOCK } from "@/components/features/settings-page/settings-mock-data";
import type { SettingsPageViewModel } from "@/components/features/settings-page/types";
import { DEMO_USER_NAME, DEMO_USER_ROLE } from "@/lib/constants";
import {
  loadUserProfileSettings,
  profileCardRoleLine,
  type UserProfileSettings,
} from "@/lib/user-profile-settings";
import { IDENTITY_CHANGED_EVENT } from "@/lib/session-identity";
import { useSessionIdentityState } from "./useSessionIdentityState";

/**
 * Display name + role line for shell chrome: saved profile → login session → demo constants.
 */
export function useEffectiveUserDisplay(
  baseVm: SettingsPageViewModel = SETTINGS_PAGE_MOCK,
) {
  const session = useSessionIdentityState();
  const [storedProfile, setStoredProfile] = useState<UserProfileSettings | null>(
    null,
  );

  useEffect(() => {
    const sync = () => setStoredProfile(loadUserProfileSettings(baseVm));
    sync();
    window.addEventListener(IDENTITY_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(IDENTITY_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [baseVm]);

  return useMemo(() => {
    if (storedProfile) {
      const name = storedProfile.fullName.trim();
      return {
        displayName: name || DEMO_USER_NAME,
        roleLine: profileCardRoleLine(storedProfile),
      };
    }
    if (session) {
      return {
        displayName: session.displayName || DEMO_USER_NAME,
        roleLine: DEMO_USER_ROLE,
      };
    }
    return { displayName: DEMO_USER_NAME, roleLine: DEMO_USER_ROLE };
  }, [storedProfile, session]);
}
