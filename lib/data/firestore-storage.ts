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
    try {
      await setDoc(stateDoc(), { json: value, updatedAt: Date.now() });
    } catch {
      // ignore — persistence is best-effort
    }
  },
  removeItem: async () => {
    try {
      await setDoc(stateDoc(), { json: "", updatedAt: Date.now() });
    } catch {
      // ignore
    }
  },
};
