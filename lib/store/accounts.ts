import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleId } from "@/lib/types";

/**
 * Demo-grade local accounts. Passwords are stored in localStorage in plain text
 * — this is a frontend prototype, NOT real authentication. A future phase swaps
 * this for a real backend (server-side auth + database).
 */
export interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleId;
  industryId: string | null;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: RoleId;
  industryId: string | null;
}

type SignupResult = { ok: true; user: Account } | { ok: false; error: string };

interface AccountsState {
  users: Account[];
  signup: (input: SignupInput) => SignupResult;
  authenticate: (email: string, password: string) => Account | null;
}

/** Seeded demo logins so the app is usable immediately (shown as a hint on Sign In). */
export const DEMO_ACCOUNTS: Account[] = [
  { id: "U-ADMIN", name: "RSPCB Monitoring Body", email: "admin@rspcb.in", password: "rspcb123", role: "monitoring-admin", industryId: null },
  { id: "U-ETP", name: "ETP Unit Operator", email: "etp@demo.in", password: "demo123", role: "etp", industryId: "IND-019" },
];

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      users: DEMO_ACCOUNTS.map((u) => ({ ...u })),
      signup: (input) => {
        const email = input.email.trim().toLowerCase();
        if (!input.name.trim()) return { ok: false, error: "Name is required." };
        if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email." };
        if (input.password.length < 4) return { ok: false, error: "Password must be at least 4 characters." };
        if (get().users.some((u) => u.email === email)) return { ok: false, error: "An account with this email already exists." };
        const user: Account = {
          id: `U-${Date.now().toString(36).toUpperCase()}`,
          name: input.name.trim(),
          email,
          password: input.password,
          role: input.role,
          industryId: input.industryId,
        };
        set((s) => ({ users: [user, ...s.users] }));
        return { ok: true, user };
      },
      authenticate: (email, password) => {
        const e = email.trim().toLowerCase();
        return get().users.find((u) => u.email === e && u.password === password) ?? null;
      },
    }),
    { name: "jalrakshak-etp-accounts", version: 1, skipHydration: true },
  ),
);
