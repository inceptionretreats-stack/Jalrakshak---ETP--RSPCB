import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CetpId } from "@/lib/types";

interface UIState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  activeCetp: CetpId | null;
  toggleSidebar: () => void;
  setMobileNav: (v: boolean) => void;
  setActiveCetp: (id: CetpId | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      activeCetp: null,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNav: (v) => set({ mobileNavOpen: v }),
      setActiveCetp: (id) => set({ activeCetp: id }),
    }),
    {
      name: "jalrakshak-etp-ui",
      version: 1,
      skipHydration: true,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, activeCetp: s.activeCetp }),
    },
  ),
);
