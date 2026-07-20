"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { noteService } from "@/services/note.service";
import type { CreateNoteDto, NoteDto, UpdateNoteDto } from "@/types/api.types";

/**
 * One note by id — for a note-related notification (`noteId`) or any other
 * caller that doesn't already have the row from `/notes`. The note may have
 * expired from that list by the time this is reached; 404 is a real "gone",
 * not a bug.
 */
export function useNote(id: number | null) {
  return useQuery({
    queryKey: queryKeys.notes.detail(id ?? 0),
    queryFn: () => noteService.getById(id as number),
    enabled: id !== null,
  });
}

/**
 * Notes live 24h and the server only returns active ones — so a stale cache
 * would show a bubble that no longer exists. Refetch on focus keeps the rail
 * honest without polling.
 */
export function useNotes() {
  return useQuery({
    queryKey: queryKeys.notes.list(),
    queryFn: () => noteService.getNotes(),
    refetchOnWindowFocus: true,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (dto: CreateNoteDto) => noteService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateNoteDto }) => noteService.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (id: number) => noteService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Toggle → the server's `{ liked, likesCount }` wins over our arithmetic. */
export function useLikeNote() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();
  const key = queryKeys.notes.list();

  return useMutation({
    mutationFn: (id: number) => noteService.like(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NoteDto[]>(key);

      queryClient.setQueryData<NoteDto[]>(key, (notes) =>
        notes?.map((note) =>
          note.id === id
            ? {
                ...note,
                isLiked: !note.isLiked,
                likesCount: Math.max(0, note.likesCount + (note.isLiked ? -1 : 1)),
              }
            : note,
        ),
      );

      return { previous };
    },
    onSuccess: (result, id) => {
      queryClient.setQueryData<NoteDto[]>(key, (notes) =>
        notes?.map((note) =>
          note.id === id ? { ...note, isLiked: result.liked, likesCount: result.likesCount } : note,
        ),
      );
    },
    onError: (error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(toMessage(error));
    },
  });
}

/**
 * Replying to a note sends a **message into the author's chat** — not a comment.
 * The response carries the chatId, so the caller can go straight there.
 */
export function useReplyToNote() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => noteService.reply(id, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * An emoji reaction — same "lands in the author's chat" shape as a reply, but
 * its own endpoint (and, unlike a reply, not allowed on your own note).
 */
export function useReactToNote() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: ({ id, emoji }: { id: number; emoji: string }) =>
      noteService.reaction(id, { emoji }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Author-only: who liked my note. */
export function useNoteLikes(noteId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.notes.likes(noteId),
    queryFn: ({ pageParam }) => noteService.getLikes(noteId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    // ⚠️ NoteLikeItemDto has no id of its own, and the cursor IS the last row's
    // id — nothing to page with. One page, honestly.
    getNextPageParam: () => undefined,
    enabled,
  });
}

/** Author-only: replies to my note. */
export function useNoteReplies(noteId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.notes.replies(noteId),
    queryFn: ({ pageParam }) => noteService.getReplies(noteId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled,
  });
}
