import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoryState {
  /** Ids of stories this browser has already opened. */
  seen: number[];
  markSeen: (storyId: number) => void;
  isSeen: (storyId: number) => boolean;
}

/**
 * The API exposes no "did I view this" flag (`add-story-view` records the view
 * but nothing reads it back per-viewer), so the grey-vs-gradient ring is decided
 * from what this browser has opened. Persisted, otherwise every reload would
 * turn all rings colourful again.
 */
export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      seen: [],
      markSeen: (storyId) =>
        set((state) => (state.seen.includes(storyId) ? state : { seen: [...state.seen, storyId] })),
      isSeen: (storyId) => get().seen.includes(storyId),
    }),
    { name: "ig-seen-stories" },
  ),
);
