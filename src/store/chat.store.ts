import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatState {
  /** Unsent input per chat, so switching conversations does not lose typing. */
  drafts: Record<number, string>;
  setDraft: (chatId: number, text: string) => void;
  clearDraft: (chatId: number) => void;
}

/**
 * Drafts only. There is no unread/read flag anywhere in the Chat API, so no
 * unread counter is kept here — inventing one would be a lie (BACKEND_BUGS #16).
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (chatId, text) => set((s) => ({ drafts: { ...s.drafts, [chatId]: text } })),
      clearDraft: (chatId) =>
        set((s) => {
          const { [chatId]: _removed, ...rest } = s.drafts;
          return { drafts: rest };
        }),
    }),
    { name: "ig-chat-drafts" },
  ),
);
