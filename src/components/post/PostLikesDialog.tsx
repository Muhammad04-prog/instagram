"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { FollowButton } from "@/components/profile/FollowButton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { usePostLikes } from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";

/** "Liked by" — a real list now; softclub only ever gave a count. */
export function PostLikesDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("post");
  const { user } = useAuth();
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePostLikes(postId, open);

  const likes = flattenPages(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex h-[400px] w-[400px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">{t("likesTitle")}</DialogTitle>
        </div>

        <div className="flex-1 scrollbar-none overflow-y-auto px-2 py-2">
          {isPending ? (
            <Loader className="py-10" />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} className="py-10" />
          ) : likes.length === 0 ? (
            <EmptyState title={t("noLikes")} className="py-10" />
          ) : (
            <>
              <ul>
                {likes.map((person) => (
                  <li key={person.id} className="flex items-center gap-3 px-2 py-2">
                    <Link href={ROUTES.profile(person.id)} onClick={() => onOpenChange(false)}>
                      <UserAvatar src={person.avatarUrl ?? null} alt={person.userName} size={44} />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={ROUTES.profile(person.id)}
                        onClick={() => onOpenChange(false)}
                        className="text-ig-text block text-sm font-semibold"
                      >
                        <UserNameWithBadge
                          userName={person.userName}
                          isVerified={person.isVerified}
                        />
                      </Link>
                      <p className="text-ig-text-secondary truncate text-sm">{person.fullName}</p>
                    </div>

                    {person.id === user?.id ? null : (
                      <FollowButton userId={person.id} userName={person.userName} variant="link" />
                    )}
                  </li>
                ))}
              </ul>

              {hasNextPage ? (
                <button
                  type="button"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-ig-primary w-full py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {t("loadMore")}
                </button>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
