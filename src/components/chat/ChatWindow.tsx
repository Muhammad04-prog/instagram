"use client";

import { Info } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatSettingsDialog } from "@/components/chat/ChatSettingsDialog";
import { MessageInput } from "@/components/chat/MessageInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useBulkDeleteMessages, useChat, useChatMessages, useMarkChatRead } from "@/hooks/useChat";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { chatAvatar, chatLabel, type MessageDto } from "@/types/chat.types";
import { flattenPages } from "@/lib/cursor";

/**
 * The header's clickable part. A 1-on-1 header opens the peer's profile; a group
 * has no profile behind it, so its header is plain text rather than a dead link.
 */
function ChatHeaderShell({
  peerId,
  children,
}: {
  peerId: string | undefined;
  children: React.ReactNode;
}) {
  const className = "flex min-w-0 flex-1 items-center gap-3";
  if (!peerId) return <div className={className}>{children}</div>;
  return (
    <Link href={ROUTES.profile(peerId)} className={className}>
      {children}
    </Link>
  );
}

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
  const bulkDelete = useBulkDeleteMessages(chatId);

  // null = not selecting. A Set, not an array: toggling is the only operation
  // and order means nothing here.
  const [selected, setSelected] = useState<Set<number> | null>(null);
  const selecting = selected !== null;
  const markRead = useMarkChatRead(chatId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myUserId = user?.id ?? "";

  // The API returns newest first; the window reads oldest → newest.
  const ordered = [...flattenPages(data)].reverse();

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
        <div className="border-ig-border flex items-center gap-3 border-b px-6 py-3">
          {/* A group has no peer and so no profile to open — only its members. */}
          <ChatHeaderShell peerId={chat.peer?.id}>
            <UserAvatar src={chatAvatar(chat)} size={44} />
            <span className="min-w-0">
              <span className="text-ig-text block truncate text-base font-bold">
                {chatLabel(chat)}
              </span>
              {/* Presence is real data now — softclub had no online/last-seen at all. */}
              <span className="text-ig-text-secondary block text-xs">
                {chat.isGroup
                  ? t("members", { count: chat.participantsCount })
                  : chat.isOnline
                    ? t("online")
                    : chat.lastSeenAt
                      ? t("lastSeen", { time: format.relativeTime(new Date(chat.lastSeenAt)) })
                      : ""}
              </span>
            </span>
          </ChatHeaderShell>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={t("chatDetails")}
            className="text-ig-text shrink-0"
          >
            <Info className="size-6" />
          </button>
        </div>
      ) : null}

      {chat ? (
        <ChatSettingsDialog chat={chat} open={settingsOpen} onOpenChange={setSettingsOpen} />
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
                    peerImage={chat ? chatAvatar(chat) : null}
                    theme={chat?.theme}
                    selecting={selecting}
                    selected={selected?.has(message.id) ?? false}
                    onStartSelecting={() => setSelected(new Set([message.id]))}
                    onToggleSelected={() =>
                      setSelected((current) => {
                        const next = new Set(current);
                        if (next.has(message.id)) next.delete(message.id);
                        else next.add(message.id);
                        // Deselecting the last one leaves selection mode, so the
                        // bar cannot sit there offering to delete nothing.
                        return next.size === 0 ? null : next;
                      })
                    }
                  />
                ))}
              </section>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* The composer gives way to the selection bar — IG does the same, and
          two bars stacked would fight for the same corner. */}
      {selecting ? (
        <SelectionBar
          count={selected.size}
          pending={bulkDelete.isPending}
          onCancel={() => setSelected(null)}
          onDelete={() => bulkDelete.mutate([...selected], { onSuccess: () => setSelected(null) })}
        />
      ) : (
        <MessageInput chatId={chatId} />
      )}
    </div>
  );
}

/** Replaces the composer while messages are selected. */
function SelectionBar({
  count,
  pending,
  onCancel,
  onDelete,
}: {
  count: number;
  pending: boolean;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("chat");

  return (
    <div className="border-ig-border flex items-center gap-3 border-t px-6 py-3">
      <button type="button" onClick={onCancel} className="text-ig-text text-sm font-semibold">
        {t("cancel")}
      </button>
      <span className="text-ig-text-secondary flex-1 text-center text-sm">
        {t("selectedCount", { count })}
      </span>
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="text-ig-danger text-sm font-semibold disabled:opacity-50"
      >
        {t("deleteSelected")}
      </button>
    </div>
  );
}
