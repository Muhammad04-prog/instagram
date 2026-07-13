import { http } from "@/lib/axios";
import type { Chat, Message, SendMessageDto } from "@/types/chat.types";

/**
 * Swagger tag: Chat (6 endpoints). No response schema is declared for any of
 * them — every shape below came from the live API (docs/API_REAL_DTO.md).
 */
export const chatService = {
  getChats: () => http.get<Chat[]>("/Chat/get-chats"),

  /** Newest message first. Unknown chatId → 400 "Chat not found". */
  getChatById: (chatId: number) => http.get<Message[]>("/Chat/get-chat-by-id", { chatId }),

  /** Idempotent: an existing chat with the same peer returns its id, not a new one. */
  createChat: (receiverUserId: string) =>
    http.post<number>("/Chat/create-chat", undefined, { receiverUserId }),

  /** PUT + multipart. Returns the new messageId. */
  sendMessage: ({ chatId, messageText, file }: SendMessageDto) => {
    const form = new FormData();
    form.append("ChatId", String(chatId));
    if (messageText) form.append("MessageText", messageText);
    if (file) form.append("File", file);
    return http.put<number>("/Chat/send-message", form);
  },

  /**
   * ⚠️ `massageId` is the backend's spelling — do not "fix" it.
   * ⚠️ The server does NOT check ownership: it happily deletes the other
   * person's message. The UI only offers this on your own (BACKEND_BUGS #15).
   */
  deleteMessage: (messageId: number) =>
    http.delete<boolean>("/Chat/delete-message", { massageId: messageId }),

  deleteChat: (chatId: number) => http.delete<boolean>("/Chat/delete-chat", { chatId }),
};
