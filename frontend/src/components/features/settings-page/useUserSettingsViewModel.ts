"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSessionIdentityState } from "@/hooks/useSessionIdentityState";
import {
  applyUserProfileToViewModel,
  loadUserProfileSettings,
  userProfileDefaultsFromViewModel,
  USER_PROFILE_SETTINGS_STORAGE_KEY,
  type UserProfileSettings,
} from "@/lib/user-profile-settings";
import {
  IDENTITY_CHANGED_EVENT,
  SESSION_IDENTITY_KEY,
} from "@/lib/session-identity";
import { SETTINGS_PAGE_MOCK } from "./settings-mock-data";
import type { SettingsPageViewModel } from "./types";

type UseUserSettingsViewModelOptions = {
  base?: SettingsPageViewModel;
};

export function useUserSettingsViewModel({
  base = SETTINGS_PAGE_MOCK,
}: UseUserSettingsViewModelOptions = {}) {
  const [stored, setStored] = useState<UserProfileSettings | null>(null);
  const sessionIdentity = useSessionIdentityState();

  useEffect(() => {
    const sync = () => setStored(loadUserProfileSettings(base));
    sync();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === USER_PROFILE_SETTINGS_STORAGE_KEY ||
        e.key === SESSION_IDENTITY_KEY
      ) {
        sync();
      }
    };
    window.addEventListener(IDENTITY_CHANGED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(IDENTITY_CHANGED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [base]);

  const data = useMemo(() => {
    if (stored) return applyUserProfileToViewModel(base, stored);
    if (sessionIdentity) {
      return {
        ...base,
        profile: {
          ...base.profile,
          fullName: sessionIdentity.displayName,
          email: sessionIdentity.email,
        },
      };
    }
    return base;
  }, [base, stored, sessionIdentity]);

  const effectiveProfile = useMemo(() => {
    if (stored) return stored;
    const defaults = userProfileDefaultsFromViewModel(base);
    if (sessionIdentity) {
      return {
        ...defaults,
        fullName: sessionIdentity.displayName,
        email: sessionIdentity.email,
      };
    }
    return defaults;
  }, [stored, base, sessionIdentity]);

  const commitProfile = useCallback((next: UserProfileSettings) => {
    setStored(next);
  }, []);

  return {
    data,
    /** Normalized profile for form initial state (defaults + stored). */
    effectiveProfile,
    commitProfile,
  };
}
