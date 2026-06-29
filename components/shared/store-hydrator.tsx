"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { useUIStore } from "@/lib/store/ui";
import { useDataStore } from "@/lib/store/data";
import { useAccountsStore } from "@/lib/store/accounts";

/**
 * Persisted stores use `skipHydration` so server + first client render share the
 * deterministic seed (no hydration mismatch). We rehydrate from localStorage
 * after mount.
 */
export function StoreHydrator() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useUIStore.persist.rehydrate();
    useDataStore.persist.rehydrate();
    useAccountsStore.persist.rehydrate();
  }, []);
  return null;
}
