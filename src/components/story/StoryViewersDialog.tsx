"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStoryViewers } from "@/hooks/useStories";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Who watched this story — author-only.
 *
 * A real list of people now, with each viewer's like and emoji reaction.
 * Softclub had no such endpoint: `viewerDto` was a pair of counters for the
 * whole story, so Phase 6 could only show two numbers and say so out loud.
 *
 * Centred dialog rather than a bottom sheet: the story stage is already a
 * full-screen overlay, and IG puts this list in the middle of it on web — a
 * sheet sliding up from the bottom edge is the mobile-app treatment.
 */
export function StoryViewersDialog({
  storyId,
  open,
  onOpenChange,
}: {
  storyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("story");
  const { data, isPending, isError, refetch } = useStoryViewers(storyId, open);

  const viewers = data ?? [];
  const likes = viewers.filter((viewer) => viewer.liked).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex max-h-[70vh] w-[400px] max-w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[400px]">
        <DialogHeader className="border-ig-separator shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-ig-text text-center text-base font-semibold">
            {t("viewers")}
          </DialogTitle>
        </DialogHeader>

        {isPending ? (
          <Loader className="py-10" />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} className="py-10" />
        ) : viewers.length === 0 ? (
          <EmptyState title={t("noViewers")} className="py-10" />
        ) : (
          <>
            <div className="text-ig-text-secondary border-ig-separator flex shrink-0 items-center gap-5 border-b px-4 py-2.5 text-sm">
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" />
                {viewers.length}
              </span>
              <span className="flex items-center gap-1.5">
                <HeartIcon filled className="text-ig-danger size-4" />
                {likes}
              </span>
            </div>

            <ul className="min-h-0 flex-1 scrollbar-none space-y-0.5 overflow-y-auto px-2 py-2">
              {viewers.map((viewer) => (
                <li key={viewer.user.id}>
                  <Link
                    href={ROUTES.profile(viewer.user.id)}
                    onClick={() => onOpenChange(false)}
                    className="hover:bg-ig-bg-secondary flex items-center gap-3 rounded-lg px-2 py-2"
                  >
                    <UserAvatar
                      src={viewer.user.avatarUrl ?? null}
                      alt={viewer.user.userName}
                      size={44}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-ig-text truncate text-sm font-semibold">
                        {viewer.user.userName}
                      </p>
                      <p className="text-ig-text-secondary truncate text-sm">
                        {viewer.user.fullName}
                      </p>
                    </div>

                    {viewer.reaction ? (
                      <span className="text-lg" aria-label={t("reaction")}>
                        {viewer.reaction}
                      </span>
                    ) : null}

                    {viewer.liked ? <HeartIcon filled className="text-ig-danger size-4" /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
