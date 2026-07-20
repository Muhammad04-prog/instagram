"use client";

import { ChevronLeft, SquareArrowOutUpRight, SquarePen, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ShareIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useChats } from "@/hooks/useChat";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";
import { cn } from "@/lib/utils";
import { useFloatingChatStore } from "@/store/floating-chat.store";
import { chatAvatar, chatLabel, isAttachment } from "@/types/chat.types";

/**
 * The quick-access "Messages" bubble — present on every page except `/chat`
 * itself (where the full inbox is already open; a second copy floating over
 * it would just be redundant chrome). Mounted once in the main layout, next
 * to `MusicPlayerBar`, so it survives navigation between pages.
 */
export function FloatingMessages() {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const panel = useFloatingChatStore((s) => s.panel);
  const openList = useFloatingChatStore((s) => s.openList);
  const openChat = useFloatingChatStore((s) => s.openChat);
  const backToList = useFloatingChatStore((s) => s.backToList);
  const close = useFloatingChatStore((s) => s.close);

  const { data, isPending, isError, refetch } = useChats();
  const chats = flattenPages(data);
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  const openChatId = typeof panel === "number" ? panel : null;
  const openChatItem = openChatId !== null ? chats.find((c) => c.id === openChatId) : undefined;
  // The three faces on the pill — most recent conversations, as IG shows them.
  const recentFaces = chats.slice(0, 3);

  if (pathname.startsWith(ROUTES.chat)) return null;

  return (
    <div className="fixed right-4 bottom-20 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      {panel !== "closed" ? (
        <div className="border-ig-border bg-ig-elevated relative flex h-[520px] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border shadow-2xl">
          <div className="border-ig-separator flex items-center gap-2 border-b px-4 py-3">
            {openChatId !== null ? (
              <button
                type="button"
                onClick={backToList}
                aria-label={t("back")}
                className="text-ig-text shrink-0"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}

            {openChatId !== null && openChatItem ? (
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <UserAvatar src={chatAvatar(openChatItem)} size={28} />
                <span className="text-ig-text truncate text-sm font-semibold">
                  {chatLabel(openChatItem)}
                </span>
              </span>
            ) : (
              <span className="text-ig-text flex-1 text-base font-bold">{t("title")}</span>
            )}

            {openChatId !== null ? (
              <Link
                href={ROUTES.chatById(openChatId)}
                onClick={close}
                aria-label={t("expand")}
                className="text-ig-text shrink-0"
              >
                <SquareArrowOutUpRight className="size-4" />
              </Link>
            ) : null}

            <button
              type="button"
              onClick={close}
              aria-label={tCommon("close")}
              className="text-ig-text shrink-0"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {openChatId !== null ? (
              <ChatWindow chatId={openChatId} compact />
            ) : isPending ? (
              <Loader className="py-10" />
            ) : isError ? (
              <ErrorState onRetry={() => void refetch()} className="py-10" />
            ) : chats.length === 0 ? (
              <EmptyState title={t("noChats")} className="py-10" />
            ) : (
              <ul className="h-full scrollbar-none overflow-y-auto py-1">
                {chats.map((chat) => {
                  const unread = chat.unreadCount > 0;
                  const preview = !chat.lastMessage
                    ? ""
                    : chat.lastMessage.text
                      ? chat.lastMessage.text
                      : isAttachment(chat.lastMessage)
                        ? t("sentAttachment", { user: t("you") })
                        : "";

                  return (
                    <li key={chat.id}>
                      <button
                        type="button"
                        onClick={() => openChat(chat.id)}
                        className="hover:bg-ig-bg-secondary flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      >
                        <UserAvatar src={chatAvatar(chat)} size={48} />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "text-ig-text block truncate text-sm",
                              unread && "font-semibold",
                            )}
                          >
                            {chatLabel(chat)}
                          </span>
                          <span
                            className={cn(
                              "block truncate text-xs",
                              unread ? "text-ig-text font-semibold" : "text-ig-text-secondary",
                            )}
                          >
                            {preview}
                          </span>
                        </span>
                        {unread ? (
                          <span className="bg-ig-primary min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold text-white">
                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Compose, pinned over the list like IG's own pencil FAB (img13).
              Only on the list view — inside a thread there is already an input. */}
          {openChatId === null ? (
            <Link
              href={ROUTES.chat}
              onClick={close}
              aria-label={t("newMessage")}
              className="bg-ig-elevated border-ig-border text-ig-text absolute right-4 bottom-4 flex size-12 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-105"
            >
              <SquarePen className="size-5" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* IG's own pill: the send glyph, the word, then the faces of the people
          who wrote last — stacked and overlapping (docs/screenshots/img12). */}
      <button
        type="button"
        onClick={() => (panel === "closed" ? openList() : close())}
        aria-expanded={panel !== "closed"}
        className="bg-ig-elevated border-ig-border text-ig-text flex items-center gap-2.5 rounded-full border py-2 pr-2.5 pl-4 text-sm font-semibold shadow-xl transition-transform hover:scale-[1.02]"
      >
        <span className="relative">
          <ShareIcon className="size-5" />
          {totalUnread > 0 ? (
            <span
              aria-label={t("unreadCount", { count: totalUnread })}
              className="bg-ig-badge absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-semibold text-white"
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          ) : null}
        </span>
        <span className="whitespace-nowrap">{t("title")}</span>
        {recentFaces.length > 0 ? (
          <span className="flex shrink-0 items-center -space-x-2" aria-hidden>
            {recentFaces.map((chat) => (
              <UserAvatar
                key={chat.id}
                src={chatAvatar(chat)}
                size={26}
                className="border-2 border-[color:var(--ig-elevated)]"
              />
            ))}
          </span>
        ) : null}
      </button>
    </div>
  );
}
