import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

const TOKEN_KEY = 'ig_token';

export const useAuthStore = create<AuthState>((set) => ({
  // Hydrate from localStorage on first access (client-side only)
  token:
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    set({ token });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ token: null });
  },
}));
