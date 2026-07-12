import { create } from "zustand";

type Panel = "search" | "notifications" | null;

interface UiState {
  panel: Panel;
  openPanel: (panel: Exclude<Panel, null>) => void;
  closePanel: () => void;
  togglePanel: (panel: Exclude<Panel, null>) => void;
}

/** Search and notifications are mutually exclusive slide-out panels, as in IG. */
export const useUiStore = create<UiState>((set) => ({
  panel: null,
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
  togglePanel: (panel) => set((state) => ({ panel: state.panel === panel ? null : panel })),
}));
