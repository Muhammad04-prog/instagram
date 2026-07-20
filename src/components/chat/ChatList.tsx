"use client";

import { ChevronDown, LogOut, Search, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { NotesRail } from "@/components/chat/NotesRail";
import { ErrorState } from "@/components/shared/ErrorState";
import { RowSkeleton } from "@/components/shared/RowSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChat";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { chatLabel } from "@/types/chat.types";
import { flattenPages } from "@/lib/cursor";

/**
 * Left column of /chat (img18): title + new-message button, filter, conversations.
 *
 * Sorted by `lastMessageAt` — real recency. Phase 9 had to sort by chat id and
 * call it "the closest honest approximation", because softclub's chat rows
 * carried no timestamp at all.
 */
export function ChatList() {
  const t = useTranslations("chat");
  const tNav = useTranslations("nav");
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { data, isPending, isError, refetch } = useChats();
  const [filter, setFilter] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);

  const needle = filter.trim().toLowerCase();
  const chats = flattenPages(data)
    .filter((chat) => chatLabel(chat).toLowerCase().includes(needle))
    .sort((a, b) => {
      // A brand-new chat has no messages and therefore no date; keep it on top
      // rather than sinking it below every old conversation.
      const at = a.lastMessageAt ? Date.parse(a.lastMessageAt) : Number.POSITIVE_INFINITY;
      const bt = b.lastMessageAt ? Date.parse(b.lastMessageAt) : Number.POSITIVE_INFINITY;
      return bt - at;
    });

  return (
    <div className="border-ig-border flex h-full w-full flex-col border-r md:w-[397px]">
      <div className="flex items-center justify-between px-4 pt-6 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-ig-text flex min-w-0 items-center gap-1 text-xl font-bold"
            >
              <span className="truncate">{user?.userName ?? t("title")}</span>
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {/* No concurrent multi-account sessions here — logging out is what
                actually gets you to a different account, via the saved-profile
                picker on the login screen. */}
            <DropdownMenuItem variant="destructive" onSelect={() => void logout()}>
              <LogOut className="size-4" />
              {tNav("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          onClick={() => setNewChatOpen(true)}
          aria-label={t("newMessage")}
          className="text-ig-text"
        >
          <SquarePen className="size-6" />
        </button>
      </div>

      <div className="px-4 pb-3">
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

      <NotesRail />

      <div className="flex items-center justify-between px-4 pb-2">
        <h2 className="text-ig-text text-base font-bold">{t("title")}</h2>
        <Link href={ROUTES.chatRequests} className="text-ig-primary text-sm font-semibold">
          {t("requestsTab")}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isPending ? (
          <RowSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : chats.length === 0 ? (
          <p className="text-ig-text-secondary px-4 py-10 text-center text-sm">{t("noChats")}</p>
        ) : (
          <ul>
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                myUserId={user?.id ?? ""}
                active={pathname === `/chat/${chat.id}`}
              />
            ))}
          </ul>
        )}
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
    </div>
  );
}
