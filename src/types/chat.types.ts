import type { ChatListItemDto, MessageDto } from "@/types/api.types";

/**
 * Chat helpers.
 *
 * The DTOs are generated (`api.types.ts`). Note what is NOT here any more:
 * `getChatPeer()` is gone because a chat row now names its `peer` outright —
 * softclub listed both participants and left us to work out which one was not
 * me. `lastMessage` and `unreadCount` arrive with the row too, so a list item no
 * longer fetches a chat's messages just to draw one line of preview.
 */

export type { ChatListItemDto, MessageDto };

/** The name to show for the peer — a per-chat nickname wins over their real one. */
export function peerLabel(chat: ChatListItemDto): string {
  return chat.peerNickname ?? chat.peer.userName;
}

/** True when the message carries an attachment rather than text. */
export function isAttachment(message: Pick<MessageDto, "type">): boolean {
  return message.type === "IMAGE" || message.type === "VIDEO" || message.type === "AUDIO";
}
