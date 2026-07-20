"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCreateChat, useCreateGroupChat } from "@/hooks/useChat";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUserSearch";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserBriefDto } from "@/types/api.types";

/**
 * Picking 2+ people used to be impossible — the API was 1-to-1 only, so img15's
 * picker is a single radio button. `POST /chats/group` (19.07.2026) changed
 * that, and this now checks off multiple people the way real IG's own "New
 * message" does: 1 person starts an ordinary chat, 2+ asks for a group name
 * first. There is no screenshot of the group-name step — same "no reference"
 * situation as `StoryViewer`.
 */
export function NewChatDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("chat");
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<UserBriefDto[]>([]);
  const [groupTitle, setGroupTitle] = useState("");
  const debounced = useDebounce(term.trim());

  const { data: users, isFetching } = useUsers(debounced, debounced.length > 0);
  const createChat = useCreateChat();
  const createGroup = useCreateGroupChat();

  const reset = () => {
    setTerm("");
    setSelected([]);
    setGroupTitle("");
  };

  const toggle = (user: UserBriefDto) => {
    setSelected((current) =>
      current.some((picked) => picked.id === user.id)
        ? current.filter((picked) => picked.id !== user.id)
        : [...current, user],
    );
  };

  const start = () => {
    if (selected.length === 0) return;

    if (selected.length === 1) {
      // Idempotent: an existing chat with this peer comes back as `existed`.
      createChat.mutate(
        { receiverUserId: selected[0]!.id },
        {
          onSuccess: (chat) => {
            onOpenChange(false);
            reset();
            router.push(ROUTES.chatById(chat.id));
          },
        },
      );
      return;
    }

    // NOT idempotent — the server treats two groups with the same people as different groups.
    createGroup.mutate(
      { userIds: selected.map((user) => user.id), title: groupTitle.trim() || undefined },
      {
        onSuccess: (group) => {
          onOpenChange(false);
          reset();
          router.push(ROUTES.chatById(group.id));
        },
      },
    );
  };

  const pending = createChat.isPending || createGroup.isPending;
  const chosen = new Set(selected.map((user) => user.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex h-[520px] w-[400px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">{t("newMessage")}</DialogTitle>
        </div>

        <div className="border-ig-separator flex flex-wrap items-center gap-2 border-b px-4 py-2">
          <span className="text-ig-text text-sm font-bold">{t("to")}</span>
          {selected.map((user) => (
            <span
              key={user.id}
              className="bg-ig-button-secondary text-ig-text flex items-center gap-1 rounded-full py-1 pr-1 pl-2 text-xs font-semibold"
            >
              {user.userName}
              <button type="button" onClick={() => toggle(user)} className="text-ig-text-secondary">
                ×
              </button>
            </span>
          ))}
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={selected.length === 0 ? t("searchPlaceholder") : ""}
            aria-label={t("to")}
            className="text-ig-text placeholder:text-ig-text-secondary min-w-[80px] flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {selected.length > 1 ? (
          <div className="border-ig-separator border-b px-4 py-2">
            <input
              value={groupTitle}
              onChange={(event) => setGroupTitle(event.target.value.slice(0, 50))}
              placeholder={t("groupNamePlaceholder")}
              aria-label={t("groupNamePlaceholder")}
              className="text-ig-text placeholder:text-ig-text-secondary w-full bg-transparent text-sm outline-none"
            />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          {debounced.length === 0 ? (
            <p className="text-ig-text-secondary px-4 py-6 text-sm">{t("noAccountsFound")}</p>
          ) : isFetching ? (
            <Loader className="py-10" />
          ) : users && users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => toggle(user)}
                    className="hover:bg-ig-bg-secondary flex w-full items-center gap-3 px-4 py-2 text-left"
                  >
                    <UserAvatar src={user.avatarUrl ?? null} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="text-ig-text block truncate text-sm font-semibold">
                        {user.userName}
                      </span>
                      <span className="text-ig-text-secondary block truncate text-sm">
                        {user.fullName}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                        chosen.has(user.id)
                          ? "border-ig-primary bg-ig-primary"
                          : "border-ig-text-secondary",
                      )}
                    >
                      {chosen.has(user.id) ? <Check className="size-3 text-white" /> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ig-text-secondary px-4 py-6 text-sm">{t("noAccountsFound")}</p>
          )}
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={start}
            disabled={selected.length === 0 || pending}
            className="bg-ig-primary w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {selected.length > 1 ? t("createGroup") : t("chatButton")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
