/**
 * Shapes read off the live API — Swagger declares no response schema for any of
 * the 6 Chat endpoints. See docs/API_REAL_DTO.md.
 */

/** `GET /Chat/get-chats` — participants only: no last message, no unread count. */
export interface Chat {
  chatId: number;
  sendUserId: string;
  sendUserName: string;
  sendUserImage: string | null;
  receiveUserId: string;
  receiveUserName: string;
  receiveUserImage: string | null;
}

/** `GET /Chat/get-chat-by-id` — newest message FIRST. */
export interface Message {
  messageId: number;
  chatId: number;
  userId: string;
  userName: string | null;
  userImage: string | null;
  messageText: string | null;
  /** Backend typo (`Massage`) — kept as-is to match the wire format. */
  sendMassageDate: string;
  file: string | null;
}

export interface SendMessageDto {
  chatId: number;
  messageText?: string;
  file?: File;
}

/** A chat row names both sides; the peer is whichever one is not me. */
export interface ChatPeer {
  userId: string;
  userName: string;
  userImage: string | null;
}

export function getChatPeer(chat: Chat, myUserId: string): ChatPeer {
  return chat.sendUserId === myUserId
    ? {
        userId: chat.receiveUserId,
        userName: chat.receiveUserName,
        userImage: chat.receiveUserImage,
      }
    : { userId: chat.sendUserId, userName: chat.sendUserName, userImage: chat.sendUserImage };
}
