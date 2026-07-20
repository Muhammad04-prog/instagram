import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OwnStoriesSeenState {
  /** Story ids I have watched, with the ms timestamp I watched them at. */
  seen: Record<number, number>;
  markSeen: (storyId: number) => void;
  /** Drops entries older than a story's 24h life, so this cannot grow forever. */
  prune: () => void;
}

/** A story lives 24h; anything older than that can never be on the rail again. */
const TTL_MS = 24 * 60 * 60 * 1000;

/**
 * "Have I watched **my own** story?" — client-side, because the server refuses
 * to answer it.
 *
 * `POST /stories/{id}/view` returns `{ viewed: true }` for your own story and
 * then changes nothing: `GET /stories/my` keeps reporting `isViewed: false` and
 * the rail keeps reporting `allViewed: false` (verified against the live API on
 * 2026-07-20). So the author's own ring could never grey out from server state
 * alone, no matter how many times they opened it.
 *
 * ⚠️ Deliberately **only** for my own stories. Everyone else's seen-state is
 * real server truth (`StoryRailItemDto.allViewed`) and must keep coming from
 * there — the old blanket localStorage store was removed for good reason, since
 * it left other people's rings wrong in every other browser. This one cannot:
 * it answers a question the server has no opinion on.
 */
export const useOwnStoriesSeenStore = create<OwnStoriesSeenState>()(
  persist(
    (set) => ({
      seen: {},
      // ⚠️ Must be a no-op once recorded. Writing a fresh `Date.now()` on every
      // call produced a new object each time, so every subscriber re-rendered,
      // which called this again — "Maximum update depth exceeded".
      markSeen: (storyId) =>
        set((state) =>
          state.seen[storyId] !== undefined
            ? state
            : { seen: { ...state.seen, [storyId]: Date.now() } },
        ),
      prune: () =>
        set((state) => {
          const cutoff = Date.now() - TTL_MS;
          const kept = Object.entries(state.seen).filter(([, at]) => at > cutoff);
          return { seen: Object.fromEntries(kept.map(([id, at]) => [Number(id), at])) };
        }),
    }),
    { name: "ig-own-stories-seen" },
  ),
);

/** True when every one of my live stories has been watched in this browser. */
export function allOwnStoriesSeen(
  stories: { id: number; isViewed: boolean }[],
  seen: Record<number, number>,
): boolean {
  if (stories.length === 0) return false;
  // `isViewed` is still honoured first, so the day the backend starts recording
  // self-views this keeps working with no change here.
  return stories.every((story) => story.isViewed || seen[story.id] !== undefined);
}
