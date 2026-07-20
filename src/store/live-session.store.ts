import { create } from "zustand";

interface LiveKitCredentials {
  liveId: string;
  token: string;
  wsUrl: string;
}

interface LiveSessionState {
  /**
   * Bridges the LiveKit token from `POST /live/start` (GoLiveScreen) to the
   * `/live/{id}` route (LiveScreen) — two different components either side of
   * a navigation, and `/live/start` is the only place a host ever gets one.
   *
   * Read via a selector (never mutated during render) and cleared from
   * `LiveScreen`'s unmount effect once that broadcast screen is left, so a
   * stale token never leaks into a later, unrelated broadcast.
   */
  hostCredentials: LiveKitCredentials | null;
  setHostCredentials: (credentials: LiveKitCredentials) => void;
  clearHostCredentials: (liveId: string) => void;
}

export const useLiveSessionStore = create<LiveSessionState>((set, get) => ({
  hostCredentials: null,
  setHostCredentials: (credentials) => set({ hostCredentials: credentials }),
  clearHostCredentials: (liveId) => {
    if (get().hostCredentials?.liveId === liveId) set({ hostCredentials: null });
  },
}));
