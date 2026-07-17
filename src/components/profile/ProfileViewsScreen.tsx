"use client";

import { useFormatter, useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { FollowButton } from "@/components/profile/FollowButton";
import { useAuth } from "@/hooks/useAuth";
import { useProfileViews } from "@/hooks/useNotifications";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";

/**
 * Who looked at my profile, newest first.
 *
 * New: softclub tracked nothing of the sort. Not paginated — `ProfileViewDto`
 * has no id and the cursor is the last row's id, so there is nothing to page
 * with (see `useProfileViews`).
 */
export function ProfileViewsScreen() {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useProfileViews();

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const views = flattenPages(data);
  if (views.length === 0) return <EmptyState title={t("noProfileViews")} className="py-10" />;

  return (
    <ul className="space-y-1">
      {views.map((view) => (
        <li key={`${view.viewer.id}-${view.viewedAt}`} className="flex items-center gap-3 py-2">
          <Link href={ROUTES.profile(view.viewer.id)}>
            <UserAvatar src={view.viewer.avatarUrl ?? null} alt={view.viewer.userName} size={44} />
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={ROUTES.profile(view.viewer.id)}
              className="text-ig-text text-sm font-semibold"
            >
              <UserNameWithBadge
                userName={view.viewer.userName}
                isVerified={view.viewer.isVerified}
              />
            </Link>
            <time
              dateTime={view.viewedAt}
              className="text-ig-text-secondary block text-xs"
              suppressHydrationWarning
            >
              {format.relativeTime(new Date(view.viewedAt))}
            </time>
          </div>

          {view.viewer.id === user?.id ? null : (
            <FollowButton userId={view.viewer.id} userName={view.viewer.userName} variant="link" />
          )}
        </li>
      ))}
    </ul>
  );
}
