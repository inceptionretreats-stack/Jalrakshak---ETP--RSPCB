import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleId } from "@/lib/types";

interface AuthState {
  role: RoleId | null;
  industryId: string | null; // set when an Industry Owner logs in
  isAuthed: boolean;
  login: (role: RoleId, industryId?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      industryId: null,
      isAuthed: false,
      login: (role, industryId = null) => set({ role, industryId, isAuthed: true }),
      logout: () => set({ role: null, industryId: null, isAuthed: false }),
    }),
    { name: "jalrakshak-etp-auth", version: 2, skipHydration: true },
  ),
);

export const isAdmin = (role: RoleId | null) => role === "monitoring-admin";
export const isEtp = (role: RoleId | null) => role === "etp";
