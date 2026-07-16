"use client";

import { Link2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useSharePost } from "@/hooks/usePosts";
import { useUsers } from "@/hooks/useUserSearch";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";

/**
 * IG's share sheet: send to someone's chat, add to my story, or copy the link.
 *
 * All three are one endpoint (`POST /posts/{id}/share`) — the body decides.
 * Softclub had no share at all: "share to story" meant re-uploading the post's
 * image as a brand new story, and there was no link to copy.
 */
export function ShareSheet({
  postId,
  open,
  onOpenChange,
}: {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("post");
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), SEARCH_DEBOUNCE_MS);
  const { data: users } = useUsers(debounced, debounced.length > 0);
  const share = useSharePost(postId);

  const close = () => {
    setTerm("");
    onOpenChange(false);
  };

  const shareToChat = (toUserId: string, userName: string) =>
    share.mutate(
      { toUserId },
      {
        onSuccess: () => {
          toast.success(t("sharedToChat", { userName }));
          close();
        },
      },
    );

  const shareToStory = () =>
    share.mutate(
      { toStory: true },
      {
        onSuccess: () => {
          toast.success(t("sharedToStory"));
          close();
        },
      },
    );

  const copyLink = () =>
    share.mutate(
      {},
      {
        onSuccess: async (result) => {
          // The server mints the canonical link — don't rebuild it from location.
          if (!result.link) return;
          try {
            await navigator.clipboard.writeText(result.link);
            toast.success(t("linkCopied"));
          } catch {
            // Clipboard is blocked without a user gesture / on http — show it
            // instead of silently doing nothing.
            toast.message(result.link);
          }
          close();
        },
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex h-[540px] w-[400px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">{t("share")}</DialogTitle>
        </div>

        <div className="border-ig-separator flex items-center gap-2 border-b px-4 py-2">
          <span className="text-ig-text text-sm font-semibold">{t("shareTo")}</span>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex-1 scrollbar-none overflow-y-auto">
          {users?.length ? (
            <ul className="py-2">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => shareToChat(user.id, user.userName)}
                    disabled={share.isPending}
                    className="hover:bg-ig-bg-secondary flex w-full items-center gap-3 px-4 py-2 text-left disabled:opacity-50"
                  >
                    <UserAvatar src={user.avatarUrl ?? null} alt={user.userName} size={44} />
                    <span className="min-w-0 flex-1">
                      <UserNameWithBadge
                        userName={user.userName}
                        isVerified={user.isVerified}
                        className="text-ig-text block text-sm font-semibold"
                      />
                      <span className="text-ig-text-secondary block truncate text-sm">
                        {user.fullName}
                      </span>
                    </span>
                    <Send className="text-ig-text-secondary size-4 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ig-text-secondary px-6 py-10 text-center text-sm">
              {debounced ? t("noResults") : t("shareSearchHint")}
            </p>
          )}
        </div>

        <div className="border-ig-separator space-y-1 border-t p-2">
          <button
            type="button"
            onClick={shareToStory}
            disabled={share.isPending}
            className="hover:bg-ig-bg-secondary text-ig-text flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            <Send className="size-5" />
            {t("shareToStory")}
          </button>

          <button
            type="button"
            onClick={copyLink}
            disabled={share.isPending}
            className="hover:bg-ig-bg-secondary text-ig-text flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            <Link2 className="size-5" />
            {t("copyLink")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
