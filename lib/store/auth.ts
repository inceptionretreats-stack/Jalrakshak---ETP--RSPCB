import { create } from "zustand";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useDataStore } from "@/lib/store/data";
import { remoteApply } from "@/lib/data/firestore-storage";
import type { RoleId } from "@/lib/types";

interface Session {
  uid: string;
  role: RoleId;
  industryId: string | null;
}

interface AuthState {
  uid: string | null;
  role: RoleId | null;
  industryId: string | null; // set when an Industry (ETP) operator logs in
  isAuthed: boolean;
  authReady: boolean; // true once Firebase has reported the initial auth state
  /** Called by the Firebase onAuthStateChanged listener (see StoreHydrator). */
  setSession: (session: Session | null) => void;
  /** Optimistic set right after a successful sign-in/sign-up, for instant UI. */
  login: (role: RoleId, industryId?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  uid: null,
  role: null,
  industryId: null,
  isAuthed: false,
  authReady: false,
  setSession: (session) =>
    session
      ? set({ uid: session.uid, role: session.role, industryId: session.industryId, isAuthed: true, authReady: true })
      : set({ uid: null, role: null, industryId: null, isAuthed: false, authReady: true }),
  login: (role, industryId = null) => set({ role, industryId, isAuthed: true, authReady: true }),
  logout: () => {
    void signOut(auth);
    // Clear the shared dataset from memory WITHOUT persisting — a persist here
    // would overwrite the shared state/app doc with the local seed.
    remoteApply.active = true;
    try {
      useDataStore.getState().resetData();
    } finally {
      remoteApply.active = false;
    }
    set({ uid: null, role: null, industryId: null, isAuthed: false });
  },
}));

export const isAdmin = (role: RoleId | null) => role === "monitoring-admin";
export const isEtp = (role: RoleId | null) => role === "etp";
