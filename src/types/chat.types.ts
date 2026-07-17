import type { ChatDetailDto, ChatListItemDto, MessageDto } from "@/types/api.types";

/**
 * Chat helpers.
 *
 * The DTOs are generated (`api.types.ts`). Note what is NOT here any more:
 * `getChatPeer()` is gone because a 1-on-1 chat now names its `peer` outright —
 * softclub listed both participants and left us to work out which one was not
 * me. `lastMessage` and `unreadCount` arrive with the row too, so a list item no
 * longer fetches a chat's messages just to draw one line of preview.
 *
 * `peer` is nullable: a group has no single peer, only `participants`. The app
 * cannot create groups yet, but a group row can reach these screens from
 * elsewhere, so nothing here may assume a peer is there.
 */

export type { ChatDetailDto, ChatListItemDto, MessageDto };

/** Either chat shape — the helpers below only touch fields common to both. */
type AnyChat = ChatListItemDto | ChatDetailDto;

/**
 * The name to show for a chat: a per-chat nickname wins over a real one, and a
 * group falls back to naming its members when it was never given a title.
 */
export function chatLabel(chat: AnyChat): string {
  if (chat.isGroup) {
    return chat.title ?? chat.participants.map((participant) => participant.userName).join(", ");
  }
  const nickname = "peerNickname" in chat ? chat.peerNickname : null;
  return nickname ?? chat.peer?.userName ?? "";
}

/** The avatar to show — a group has none of its own, so it borrows a member's. */
export function chatAvatar(chat: AnyChat): string | null {
  if (chat.isGroup) return chat.participants[0]?.avatarUrl ?? null;
  return chat.peer?.avatarUrl ?? null;
}

/** True when the message carries an attachment rather than text. */
export function isAttachment(message: Pick<MessageDto, "type">): boolean {
  return message.type === "IMAGE" || message.type === "VIDEO" || message.type === "AUDIO";
}
