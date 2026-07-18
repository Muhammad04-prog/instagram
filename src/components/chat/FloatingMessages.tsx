"use client";

import { ChevronLeft, MessageCircle, SquareArrowOutUpRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChatWindow } from "@/components/chat/ChatWindow";
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

  if (pathname.startsWith(ROUTES.chat)) return null;

  return (
    <div className="fixed right-4 bottom-20 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      {panel !== "closed" ? (
        <div className="border-ig-border bg-ig-bg flex h-[480px] w-[92vw] max-w-[360px] flex-col overflow-hidden rounded-xl border shadow-2xl">
          <div className="border-ig-border flex items-center gap-2 border-b px-3 py-2">
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
              <span className="text-ig-text flex-1 text-sm font-semibold">{t("title")}</span>
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
                        className="hover:bg-ig-bg-secondary flex w-full items-center gap-3 px-3 py-2 text-left"
                      >
                        <UserAvatar src={chatAvatar(chat)} size={40} />
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
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => (panel === "closed" ? openList() : close())}
        aria-expanded={panel !== "closed"}
        className="bg-ig-bg border-ig-border text-ig-text flex items-center gap-2 rounded-full border py-2 pr-4 pl-3 text-sm font-semibold shadow-lg"
      >
        <span className="relative">
          <MessageCircle className="size-5" />
          {totalUnread > 0 ? (
            <span
              aria-label={t("unreadCount", { count: totalUnread })}
              className="bg-ig-badge absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-semibold text-white"
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          ) : null}
        </span>
        {t("title")}
      </button>
    </div>
  );
}
