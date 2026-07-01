import { create } from "zustand";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { RoleId } from "@/lib/types";

/**
 * Accounts are backed by Firebase Authentication (email/password). The user's
 * app profile (name, role, ETP industryId) lives in a Firestore `users/{uid}`
 * document. Demo logins (admin@rspcb.in / etp@demo.in) are seeded as real
 * Firebase Auth users.
 */
export interface Account {
  id: string; // Firebase Auth uid
  name: string;
  email: string;
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
  signup: (input: SignupInput) => Promise<SignupResult>;
  authenticate: (email: string, password: string) => Promise<Account | null>;
}

function messageForCode(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Enter a valid email.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error — check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export const useAccountsStore = create<AccountsState>()(() => ({
  signup: async (input) => {
    const email = input.email.trim().toLowerCase();
    if (!input.name.trim()) return { ok: false, error: "Name is required." };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email." };
    if (input.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, input.password);
      const user: Account = {
        id: cred.user.uid,
        name: input.name.trim(),
        email,
        role: input.role,
        industryId: input.industryId,
      };
      await setDoc(doc(db, "users", cred.user.uid), {
        name: user.name,
        email: user.email,
        role: user.role,
        industryId: user.industryId,
      });
      return { ok: true, user };
    } catch (e) {
      return { ok: false, error: messageForCode((e as { code?: string }).code ?? "") };
    }
  },
  authenticate: async (email, password) => {
    const e = email.trim().toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(auth, e, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const d = snap.exists() ? snap.data() : null;
      return {
        id: cred.user.uid,
        name: (d?.name as string) ?? cred.user.email ?? e,
        email: (d?.email as string) ?? e,
        role: (d?.role as RoleId) ?? "etp",
        industryId: (d?.industryId as string | null) ?? null,
      };
    } catch {
      return null;
    }
  },
}));
