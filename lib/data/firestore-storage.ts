import { doc, getDoc, setDoc } from "firebase/firestore";
import type { StateStorage } from "zustand/middleware";
import { db } from "@/lib/firebase";

/**
 * Backs the data store with a single shared Firestore document (`state/app`)
 * instead of per-browser localStorage. This makes the platform behave like a
 * real backend: the Monitoring Body and every ETP operator (and every device)
 * read and write one live dataset. State is serialized to a JSON string field.
 *
 * Reads/writes are best-effort — on any error the app keeps working from its
 * in-memory (deterministic seed) state, so an offline or permission hiccup
 * never breaks the UI.
 */
const stateDoc = () => doc(db, "state", "app");

/**
 * Timestamp (ms) of our most recent LOCAL write. The live listener in
 * StoreHydrator uses it to ignore echoes of our own writes (and stale ones).
 */
export const lastWrite = { at: 0 };

/**
 * When true, `setItem` is suppressed. StoreHydrator sets this while applying a
 * REMOTE snapshot to the store, and while clearing the store on logout — so
 * those changes are NOT written back to Firestore. This prevents echo loops and,
 * critically, stops `resetData()` on logout from overwriting the shared dataset
 * with the local seed.
 */
export const remoteApply = { active: false };

export const firestoreStorage: StateStorage = {
  getItem: async () => {
    try {
      const snap = await getDoc(stateDoc());
      return snap.exists() ? ((snap.data().json as string) ?? null) : null;
    } catch {
      return null;
    }
  },
  setItem: async (_name, value) => {
    if (remoteApply.active) return; // don't persist remote-applied / cleared state
    const at = Date.now();
    lastWrite.at = at;
    try {
      await setDoc(stateDoc(), { json: value, updatedAt: at });
    } catch {
      // ignore — persistence is best-effort
    }
  },
  removeItem: async () => {
    if (remoteApply.active) return;
    const at = Date.now();
    lastWrite.at = at;
    try {
      await setDoc(stateDoc(), { json: "", updatedAt: at });
    } catch {
      // ignore
    }
  },
};
