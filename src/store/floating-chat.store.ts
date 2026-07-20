import { create } from "zustand";

/** `"closed"` | `"list"` (inbox) | a chat id (that thread, compact). */
type FloatingChatPanel = "closed" | "list" | number;

interface FloatingChatState {
  panel: FloatingChatPanel;
  openList: () => void;
  openChat: (chatId: number) => void;
  backToList: () => void;
  close: () => void;
}

/**
 * The floating "Messages" bubble's own open/closed state — separate from
 * `/chat` itself, so browsing any other page keeps a quick way back into a
 * conversation without losing your place on the page you were on.
 */
export const useFloatingChatStore = create<FloatingChatState>((set) => ({
  panel: "closed",
  openList: () => set({ panel: "list" }),
  openChat: (chatId) => set({ panel: chatId }),
  backToList: () => set({ panel: "list" }),
  close: () => set({ panel: "closed" }),
}));
