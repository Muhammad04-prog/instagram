"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useChat, useChatMessages, useMarkChatRead } from "@/hooks/useChat";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { MessageDto } from "@/types/chat.types";

/** Groups messages (oldest → newest) under one heading per calendar day. */
function groupByDay(messages: MessageDto[]): { day: string; items: MessageDto[] }[] {
  const groups: { day: string; items: MessageDto[] }[] = [];

  for (const message of messages) {
    const day = message.sentAt.slice(0, 10);
    const last = groups.at(-1);
    if (last && last.day === day) last.items.push(message);
    else groups.push({ day, items: [message] });
  }

  return groups;
}

export function ChatWindow({ chatId }: { chatId: number }) {
  const t = useTranslations("chat");
  const format = useFormatter();
  const { user } = useAuth();
  const { data: chat } = useChat(chatId);
  const { data, isPending, isError, refetch } = useChatMessages(chatId);
  const markRead = useMarkChatRead(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myUserId = user?.id ?? "";

  // The API returns newest first; the window reads oldest → newest.
  const ordered = [...(data?.pages.flat() ?? [])].reverse();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [ordered.length]);

  // Opening a chat marks it read ("Просмотрено"), which clears its unread badge
  // in the list. Re-fires as new messages land while the window is open.
  const lastMessageId = ordered.at(-1)?.id;
  const markReadMutate = markRead.mutate;

  useEffect(() => {
    if (lastMessageId === undefined) return;
    markReadMutate();
  }, [chatId, lastMessageId, markReadMutate]);

  return (
    <div className="flex h-full flex-1 flex-col">
      {chat ? (
        <Link
          href={ROUTES.profile(chat.peer.id)}
          className="border-ig-border flex items-center gap-3 border-b px-6 py-3"
        >
          <UserAvatar src={chat.peer.avatarUrl ?? null} size={44} />
          <span className="min-w-0">
            <span className="text-ig-text block truncate text-base font-bold">
              {chat.peer.userName}
            </span>
            {/* Presence is real data now — softclub had no online/last-seen at all. */}
            <span className="text-ig-text-secondary block text-xs">
              {chat.isOnline
                ? t("online")
                : chat.lastSeenAt
                  ? t("lastSeen", { time: format.relativeTime(new Date(chat.lastSeenAt)) })
                  : ""}
            </span>
          </span>
        </Link>
      ) : null}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isPending ? (
          <Loader className="py-10" />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : ordered.length === 0 ? (
          <EmptyState title={t("noMessages")} description={t("noMessagesDescription")} />
        ) : (
          <div className="space-y-4">
            {groupByDay(ordered).map((group) => (
              <section key={group.day} className="space-y-2">
                <p className="text-ig-text-secondary py-2 text-center text-xs">
                  {format.dateTime(new Date(group.day), {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {group.items.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    mine={message.senderId === myUserId}
                    peerImage={chat?.peer.avatarUrl ?? null}
                  />
                ))}
              </section>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageInput chatId={chatId} />
    </div>
  );
}
