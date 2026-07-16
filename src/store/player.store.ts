import { create } from "zustand";
import type { MusicDto } from "@/types/api.types";

interface PlayerState {
  track: MusicDto | null;
  /** The queue the track came from, so next/previous mean something. */
  queue: MusicDto[];
  isPlaying: boolean;
  play: (track: MusicDto, queue?: MusicDto[]) => void;
  toggle: () => void;
  pause: () => void;
  close: () => void;
  next: () => void;
  previous: () => void;
  /** Keeps the loaded copy in step when the track changes elsewhere (e.g. saved). */
  patchTrack: (id: number, patch: Partial<MusicDto>) => void;
}

/**
 * One track plays at a time, app-wide.
 *
 * Which track is playing is client state — no endpoint has an opinion about it —
 * so it lives here rather than in TanStack Query. The single `<audio>` element
 * that follows this store is mounted once in the layout, which is what lets a
 * track keep playing while you navigate.
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  isPlaying: false,

  // Tapping the track that is already loaded toggles it instead of restarting
  // from zero — restarting is never what that tap means.
  play: (track, queue) =>
    set((state) =>
      state.track?.id === track.id
        ? { isPlaying: !state.isPlaying }
        : { track, queue: queue ?? [track], isPlaying: true },
    ),

  toggle: () => set((state) => (state.track ? { isPlaying: !state.isPlaying } : state)),
  pause: () => set({ isPlaying: false }),
  close: () => set({ track: null, queue: [], isPlaying: false }),

  next: () => {
    const { track, queue } = get();
    if (!track) return;
    const at = queue.findIndex((item) => item.id === track.id);
    const following = queue[at + 1];
    // The end of the queue stops playback; it must not wrap silently back to
    // the first track, which reads as a bug.
    set(following ? { track: following, isPlaying: true } : { isPlaying: false });
  },

  previous: () => {
    const { track, queue } = get();
    if (!track) return;
    const at = queue.findIndex((item) => item.id === track.id);
    const preceding = queue[at - 1];
    if (preceding) set({ track: preceding, isPlaying: true });
  },

  // The loaded track is a snapshot, so it goes stale the moment the same track
  // changes in a list — saving from the bar left it reading "Save" forever.
  patchTrack: (id, patch) =>
    set((state) => ({
      track: state.track?.id === id ? { ...state.track, ...patch } : state.track,
      queue: state.queue.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),
}));
