import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionUser } from "@/types/auth.types";

interface AuthState {
  user: SessionUser | null;
  isAuth: boolean;
  isReady: boolean;
  setUser: (user: SessionUser | null) => void;
  setReady: (ready: boolean) => void;
}

/**
 * Holds only non-sensitive claims. The JWT never reaches the client — it stays
 * in the httpOnly cookie and is attached server-side by /api/proxy.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      isReady: false,

      setUser: (user) => set({ user, isAuth: Boolean(user), isReady: true }),
      setReady: (isReady) => set({ isReady }),
    }),
    {
      name: "ig-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
