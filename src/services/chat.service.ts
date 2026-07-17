import { http } from "@/lib/axios";
import type { CursorParams, Page } from "@/lib/cursor";
import type {
  BulkDeleteDto,
  CallStartedDto,
  ChatCreatedDto,
  ChatDetailDto,
  ChatListItemDto,
  CreateChatDto,
  DeletedDto,
  EditMessageDto,
  MessageDto,
  MessageReactionDto,
  MessageRequestItemDto,
  MuteDto,
  NicknameDto,
  OkDto,
  ReactionDto,
  ReportChatDto,
  ThemeDto,
} from "@/types/api.types";

/** `POST /chats/{id}/messages` — multipart when there is a file, JSON otherwise. */
export interface SendMessageInput {
  text?: string;
  file?: File;
  replyToId?: number;
  sharedPostId?: number;
  stickerUrl?: string;
}

/**
 * Swagger tag: chats (20 endpoints).
 *
 * The list finally carries what a chat list needs — `lastMessage`,
 * `lastMessageAt`, `unreadCount`, `isOnline` — none of which softclub had, which
 * is why Phase 9 had to fetch each chat to render one row.
 *
 * Ownership is enforced server-side now (OwnerGuard), so deleting someone else's
 * message is a 403 rather than a silent success (bug #15).
 */
export const chatService = {
  getChats: (params: CursorParams) => http.get<ChatListItemDto[]>("/chats", params),

  /** Idempotent — an existing chat with the same peer returns its id. */
  create: (dto: CreateChatDto) => http.post<ChatCreatedDto>("/chats", dto),

  getChatById: (id: number) => http.get<ChatDetailDto>(`/chats/${id}`),

  /** Leaves the chat. */
  remove: (id: number) => http.delete<DeletedDto>(`/chats/${id}`),

  getMessages: (id: number, params: CursorParams) =>
    http.get<Page<MessageDto>>(`/chats/${id}/messages`, params),

  send: (id: number, input: SendMessageInput) => {
    if (!input.file) return http.post<MessageDto>(`/chats/${id}/messages`, input);

    const form = new FormData();
    form.append("file", input.file);
    if (input.text) form.append("text", input.text);
    if (input.replyToId !== undefined) form.append("replyToId", String(input.replyToId));
    if (input.sharedPostId !== undefined) form.append("sharedPostId", String(input.sharedPostId));
    if (input.stickerUrl) form.append("stickerUrl", input.stickerUrl);

    return http.post<MessageDto>(`/chats/${id}/messages`, form);
  },

  /** Own message only, within 15 minutes of sending. */
  editMessage: (messageId: number, dto: EditMessageDto) =>
    http.put<MessageDto>(`/chats/messages/${messageId}`, dto),

  deleteMessage: (messageId: number) => http.delete<DeletedDto>(`/chats/messages/${messageId}`),

  bulkDeleteMessages: (dto: BulkDeleteDto) =>
    http.post<DeletedDto>("/chats/messages/bulk-delete", dto),

  reactToMessage: (messageId: number, dto: ReactionDto) =>
    http.post<MessageReactionDto>(`/chats/messages/${messageId}/reaction`, dto),

  removeMessageReaction: (messageId: number) =>
    http.delete<OkDto>(`/chats/messages/${messageId}/reaction`),

  /** "Seen" — marks the whole chat read. */
  markRead: (id: number) => http.post<OkDto>(`/chats/${id}/read`),

  setTheme: (id: number, dto: ThemeDto) => http.put<OkDto>(`/chats/${id}/theme`, dto),

  setNickname: (id: number, dto: NicknameDto) => http.put<OkDto>(`/chats/${id}/nickname`, dto),

  setMuted: (id: number, dto: MuteDto) => http.put<OkDto>(`/chats/${id}/mute`, dto),

  report: (id: number, dto: ReportChatDto) => http.post<OkDto>(`/chats/${id}/report`, dto),

  /** WebRTC signalling rides the socket; this only opens the call. */
  startCall: (id: number) => http.post<CallStartedDto>(`/chats/${id}/call`),

  /** Message requests — chats opened by people you do not follow (img22). */
  getRequests: (params: CursorParams) =>
    http.get<MessageRequestItemDto[]>("/chats/requests", params),

  /** ⚠️ A request id is a **string** (uuid), unlike chat and message ids. */
  acceptRequest: (id: string) => http.post<OkDto>(`/chats/requests/${id}/accept`),

  declineRequest: (id: string) => http.post<OkDto>(`/chats/requests/${id}/decline`),
};
