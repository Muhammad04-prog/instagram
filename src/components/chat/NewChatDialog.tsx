"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCreateChat } from "@/hooks/useChat";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUserSearch";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
  const [selected, setSelected] = useState<string | null>(null);
  const debounced = useDebounce(term.trim());

  const { data: users, isFetching } = useUsers(debounced, debounced.length > 0);
  const createChat = useCreateChat();

  const start = () => {
    if (!selected) return;
    // Idempotent: an existing chat with this peer comes back as `existed`.
    createChat.mutate(
      { receiverUserId: selected },
      {
        onSuccess: (chat) => {
          onOpenChange(false);
          setTerm("");
          setSelected(null);
          router.push(ROUTES.chatById(chat.id));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex h-[520px] w-[400px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">{t("newMessage")}</DialogTitle>
        </div>

        <div className="border-ig-separator flex items-center gap-2 border-b px-4 py-2">
          <span className="text-ig-text text-sm font-bold">{t("to")}</span>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("to")}
            className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
          />
        </div>

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
                    onClick={() => setSelected(user.id)}
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
                    {/* Radio, as in img15 — one recipient per chat (the API is 1-to-1). */}
                    <span
                      aria-hidden
                      className={cn(
                        "size-5 shrink-0 rounded-full border-2",
                        selected === user.id
                          ? "border-ig-primary bg-ig-primary"
                          : "border-ig-text-secondary",
                      )}
                    />
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
            disabled={!selected || createChat.isPending}
            className="bg-ig-primary w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {t("chatButton")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
