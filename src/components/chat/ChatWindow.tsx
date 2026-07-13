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
import { useChatMessages, useChats } from "@/hooks/useChat";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { getChatPeer, type Message } from "@/types/chat.types";

/** Groups messages (oldest → newest) under one heading per calendar day. */
function groupByDay(messages: Message[]): { day: string; items: Message[] }[] {
  const groups: { day: string; items: Message[] }[] = [];

  for (const message of messages) {
    const day = message.sendMassageDate.slice(0, 10);
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
  const { data: chats } = useChats();
  const { data: messages, isPending, isError, refetch } = useChatMessages(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myUserId = user?.userId ?? "";
  const chat = chats?.find((c) => c.chatId === chatId);
  const peer = chat ? getChatPeer(chat, myUserId) : null;

  // The API returns newest first; the window reads oldest → newest.
  const ordered = [...(messages ?? [])].reverse();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [ordered.length]);

  return (
    <div className="flex h-full flex-1 flex-col">
      {peer ? (
        <Link
          href={ROUTES.profile(peer.userId)}
          className="border-ig-border flex items-center gap-3 border-b px-6 py-3"
        >
          <UserAvatar src={peer.userImage} size={44} />
          <span className="text-ig-text text-base font-bold">{peer.userName}</span>
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
                    key={message.messageId}
                    message={message}
                    mine={message.userId === myUserId}
                    peerImage={peer?.userImage ?? null}
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
