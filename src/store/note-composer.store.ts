import { create } from "zustand";
import type { NoteDto } from "@/types/api.types";

interface NoteComposerState {
  open: boolean;
  /** The note being replaced, or null when writing a fresh one. */
  editingNote: NoteDto | null;
  openComposer: (note: NoteDto | null) => void;
  closeComposer: () => void;
}

/**
 * Real IG's note composer takes over only the right pane of /chat — the
 * conversation list stays put on the left. Its trigger lives in NotesRail
 * (left column) but it renders in ChatShell's right slot (see ChatShell.tsx),
 * so the open/editing state has to live above both.
 */
export const useNoteComposerStore = create<NoteComposerState>((set) => ({
  open: false,
  editingNote: null,
  openComposer: (note) => set({ open: true, editingNote: note }),
  closeComposer: () => set({ open: false, editingNote: null }),
}));
