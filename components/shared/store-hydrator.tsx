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
 * Auth state is driven by Firebase: onAuthStateChanged restores the session on
 * reload and loads the user's `users/{uid}` profile (role + industryId).
 * The UI and data stores still use `skipHydration` + localStorage for now
 * (data migrates to Firestore in a later stage).
 */
export function StoreHydrator() {
  useEffect(() => {
    useUIStore.persist.rehydrate();
    useDataStore.persist.rehydrate();

    const setSession = useAuthStore.getState().setSession;
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setSession(null);
        return;
      }
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
    });
    return unsub;
  }, []);
  return null;
}
