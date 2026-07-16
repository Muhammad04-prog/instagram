import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type {
  CreateNoteDto,
  DeletedDto,
  NoteDto,
  NoteLikeItemDto,
  NoteLikeToggleDto,
  NoteReplyDto,
  NoteReplyItemDto,
  NoteReplySentDto,
  UpdateNoteDto,
} from "@/types/api.types";

/**
 * Swagger tag: notes (8 endpoints).
 *
 * The little thought bubbles above the chat list: ≤60 characters, optionally a
 * track and a background colour, and they expire after 24h on their own.
 * Entirely new — softclub had nothing of the sort.
 *
 * A reply is not a comment: it becomes a **message in the author's chat**, which
 * is why `NoteReplySentDto` hands back a `chatId`.
 */
export const noteService = {
  /** Mine + the people I follow, active only — the server drops expired ones. */
  getNotes: () => http.get<NoteDto[]>("/notes"),

  create: (dto: CreateNoteDto) => http.post<NoteDto>("/notes", dto),

  update: (id: number, dto: UpdateNoteDto) => http.put<NoteDto>(`/notes/${id}`, dto),

  remove: (id: number) => http.delete<DeletedDto>(`/notes/${id}`),

  /** Toggle → `{ liked, likesCount }`; also raises a LIKE_NOTE notification. */
  like: (id: number) => http.post<NoteLikeToggleDto>(`/notes/${id}/like`),

  /** Author-only. */
  getLikes: (id: number, params: CursorParams) =>
    http.get<NoteLikeItemDto[]>(`/notes/${id}/likes`, params),

  reply: (id: number, dto: NoteReplyDto) => http.post<NoteReplySentDto>(`/notes/${id}/reply`, dto),

  /** Author-only. */
  getReplies: (id: number, params: CursorParams) =>
    http.get<NoteReplyItemDto[]>(`/notes/${id}/replies`, params),
};
