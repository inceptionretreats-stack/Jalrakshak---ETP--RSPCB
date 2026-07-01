"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store/auth";
import { useUIStore } from "@/lib/store/ui";
import { useDataStore } from "@/lib/store/data";
import type { RoleId } from "@/lib/types";

/**
 * Firebase drives both auth and data:
 * - onAuthStateChanged restores the session and loads the `users/{uid}` profile.
 * - The data store is a shared Firestore doc; we rehydrate it only AFTER auth is
 *   resolved, because the security rules require a signed-in user to read it.
 *   The UI store stays on localStorage (per-device preferences).
 */
export function StoreHydrator() {
  useEffect(() => {
    useUIStore.persist.rehydrate();

    const setSession = useAuthStore.getState().setSession;
    let dataHydrated = false;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      // 1) Auth session (role + industryId from the Firestore profile).
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          const d = snap.exists() ? snap.data() : null;
          setSession({
            uid: fbUser.uid,
            role: (d?.role as RoleId) ?? "etp",
            industryId: (d?.industryId as string | null) ?? null,
          });
        } catch {
          setSession({ uid: fbUser.uid, role: "etp", industryId: null });
        }
      } else {
        setSession(null);
      }

      // 2) Hydrate the shared data store once (after auth is known). For signed-in
      //    users this loads the live dataset from Firestore and seeds it on the
      //    first-ever load; signed-out visitors fall back to the in-memory seed.
      if (!dataHydrated) {
        dataHydrated = true;
        await useDataStore.persist.rehydrate();
        if (fbUser) {
          try {
            const snap = await getDoc(doc(db, "state", "app"));
            if (!snap.exists()) useDataStore.setState((s) => ({ ...s }));
          } catch {
            // best-effort seed
          }
        }
      }
    });
    return unsub;
  }, []);
  return null;
}
