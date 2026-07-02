"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store/auth";
import { useUIStore } from "@/lib/store/ui";
import { useDataStore } from "@/lib/store/data";
import { lastWrite, remoteApply } from "@/lib/data/firestore-storage";
import type { RoleId } from "@/lib/types";

/**
 * Firebase drives auth + the shared data store.
 * - onAuthStateChanged restores the session (role/industryId from `users/{uid}`).
 * - The dataset lives in the shared Firestore doc `state/app`, readable only when
 *   signed in (rules require auth). We load it on sign-in — keyed by uid — so a
 *   fresh login always shows the real shared data (never the local seed), which
 *   fixes "registered units missing until refresh". A live `onSnapshot` listener
 *   then keeps every open session in sync without a manual refresh. On sign-out
 *   we clear the store back to the seed. The UI store stays on localStorage.
 */
export function StoreHydrator() {
  useEffect(() => {
    useUIStore.persist.rehydrate();

    const setSession = useAuthStore.getState().setSession;
    const stateRef = doc(db, "state", "app");
    let hydratedUid: string | null = null;
    let unsubSnap: (() => void) | null = null;

    // Apply a remote `state/app` payload to the store WITHOUT persisting it back
    // (remoteApply suppresses the echo write in firestoreStorage.setItem).
    const applyRemoteState = (json: string) => {
      try {
        const parsed = JSON.parse(json);
        if (!parsed || !parsed.state) return;
        remoteApply.active = true;
        try {
          useDataStore.setState(parsed.state);
        } finally {
          remoteApply.active = false;
        }
      } catch {
        // ignore malformed remote payload
      }
    };

    const detachSnap = () => {
      if (unsubSnap) {
        unsubSnap();
        unsubSnap = null;
      }
    };

    const attachSnap = () => {
      detachSnap();
      unsubSnap = onSnapshot(stateRef, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const json = data.json as string | undefined;
        const updatedAt = (data.updatedAt as number | undefined) ?? 0;
        if (typeof json !== "string" || !json) return;
        if (updatedAt <= lastWrite.at) return; // our own write / stale echo
        const localJson = JSON.stringify({ state: useDataStore.getState(), version: 4 });
        if (json === localJson) return; // no-op change
        applyRemoteState(json);
      });
    };

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      // 1) Session (role + industryId from the Firestore profile).
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

      // 2) Shared data store — only when signed in (rules require auth).
      if (fbUser) {
        if (hydratedUid !== fbUser.uid) {
          hydratedUid = fbUser.uid;
          try {
            const snap = await getDoc(stateRef);
            const json = snap.exists() ? (snap.data().json as string | undefined) : undefined;
            if (typeof json === "string" && json) {
              applyRemoteState(json); // authoritative initial load of the real data
            } else {
              useDataStore.setState((s) => ({ ...s })); // seed the doc on first-ever load
            }
          } catch {
            // best-effort
          }
          attachSnap();
        }
      } else {
        detachSnap();
        hydratedUid = null;
        // Clear to the seed locally WITHOUT persisting (would clobber the shared doc).
        remoteApply.active = true;
        try {
          useDataStore.getState().resetData();
        } finally {
          remoteApply.active = false;
        }
      }
    });

    return () => {
      unsubAuth();
      detachSnap();
    };
  }, []);
  return null;
}
