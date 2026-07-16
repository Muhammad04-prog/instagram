"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStoryViewers } from "@/hooks/useStories";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Who watched this story — author-only.
 *
 * A real list of people now, with each viewer's like and emoji reaction.
 * Softclub had no such endpoint: `viewerDto` was a pair of counters for the
 * whole story, so Phase 6 could only show two numbers and say so out loud.
 */
export function StoryViewersSheet({
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-ig-elevated max-h-[70vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle className="text-ig-text">{t("viewers")}</SheetTitle>
        </SheetHeader>

        {isPending ? (
          <Loader className="py-8" />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} className="py-8" />
        ) : viewers.length === 0 ? (
          <EmptyState title={t("noViewers")} className="py-8" />
        ) : (
          <>
            <div className="text-ig-text-secondary flex items-center gap-5 px-4 pb-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" />
                {viewers.length}
              </span>
              <span className="flex items-center gap-1.5">
                <HeartIcon filled className="text-ig-danger size-4" />
                {likes}
              </span>
            </div>

            <ul className="scrollbar-none space-y-1 overflow-y-auto px-2 pb-6">
              {viewers.map((viewer) => (
                <li key={viewer.user.id}>
                  <Link
                    href={ROUTES.profile(viewer.user.id)}
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
      </SheetContent>
    </Sheet>
  );
}
