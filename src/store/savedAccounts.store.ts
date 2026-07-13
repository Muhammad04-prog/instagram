import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedAccount {
  userId: string;
  userName: string;
  image: string | null;
}

interface SavedAccountsState {
  accounts: SavedAccount[];
  remember: (account: SavedAccount) => void;
  forget: (userId: string) => void;
}

/**
 * Accounts this *browser* has signed in with — exactly what Instagram's
 * "Continue as …" screen is built on. It is a local convenience list, not a
 * session: no token is kept here, so continuing still asks for the password.
 */
export const useSavedAccountsStore = create<SavedAccountsState>()(
  persist(
    (set) => ({
      accounts: [],
      remember: (account) =>
        set((state) => ({
          // Most recent first, no duplicates.
          accounts: [account, ...state.accounts.filter((a) => a.userId !== account.userId)].slice(
            0,
            5,
          ),
        })),
      forget: (userId) =>
        set((state) => ({ accounts: state.accounts.filter((a) => a.userId !== userId) })),
    }),
    { name: "ig-saved-accounts" },
  ),
);
