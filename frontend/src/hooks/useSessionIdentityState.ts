"use client";

import { useEffect, useState } from "react";
import {
  IDENTITY_CHANGED_EVENT,
  loadSessionIdentity,
  type SessionIdentity,
} from "@/lib/session-identity";

/** Live session identity from localStorage; updates on login, profile save, sign-out. */
export function useSessionIdentityState(): SessionIdentity | null {
  const [identity, setIdentity] = useState<SessionIdentity | null>(null);

  useEffect(() => {
    const sync = () => setIdentity(loadSessionIdentity());
    sync();
    window.addEventListener(IDENTITY_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(IDENTITY_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return identity;
}
