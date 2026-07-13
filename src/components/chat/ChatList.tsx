"use client";

import { Search, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChat";
import { usePathname } from "@/i18n/navigation";
import { getChatPeer } from "@/types/chat.types";

/** Left column of /chat (img18): title + new-message button, filter, conversations. */
export function ChatList() {
  const t = useTranslations("chat");
  const { user } = useAuth();
  const pathname = usePathname();
  const { data: chats, isPending, isError, refetch } = useChats();
  const [filter, setFilter] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);

  const myUserId = user?.userId ?? "";
  const rows = (chats ?? [])
    .map((chat) => ({ chat, peer: getChatPeer(chat, myUserId) }))
    // The API cannot sort by recency (no timestamp on the chat), so newest chat
    // id first is the closest honest approximation.
    .sort((a, b) => b.chat.chatId - a.chat.chatId)
    .filter(({ peer }) => peer.userName.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <div className="border-ig-border flex h-full w-full flex-col border-r md:w-[414px]">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <h1 className="text-ig-text truncate text-xl font-bold">{user?.userName ?? t("title")}</h1>
        <button
          type="button"
          onClick={() => setNewChatOpen(true)}
          aria-label={t("newMessage")}
          className="text-ig-text"
        >
          <SquarePen className="size-6" />
        </button>
      </div>

      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="text-ig-text-secondary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-9 w-full rounded-lg pr-3 pl-9 text-sm outline-none"
          />
        </div>
      </div>

      <h2 className="text-ig-text px-6 pb-2 text-base font-bold">{t("title")}</h2>

      <div className="flex-1 overflow-y-auto">
        {isPending ? (
          <Loader className="py-10" />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : rows.length === 0 ? (
          <p className="text-ig-text-secondary px-6 py-10 text-center text-sm">{t("noChats")}</p>
        ) : (
          <ul>
            {rows.map(({ chat, peer }) => (
              <ChatListItem
                key={chat.chatId}
                chat={chat}
                peer={peer}
                myUserId={myUserId}
                active={pathname === `/chat/${chat.chatId}`}
              />
            ))}
          </ul>
        )}
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
    </div>
  );
}
