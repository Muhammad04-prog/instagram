"use client";

import { useFormatter, useTranslations } from "next-intl";
import { CommentIcon, HeartIcon, SearchIcon } from "@/components/icons";
import { ActivityIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useMyActivity } from "@/hooks/useProfile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { ActivityItemDto } from "@/types/api.types";
import { flattenPages } from "@/lib/cursor";

/**
 * "Your activity" — what I liked, commented, viewed and searched for.
 *
 * A new screen: softclub kept no such history at all.
 *
 * `postId` is only present for LIKE / COMMENT / POST_VIEW, and `text` only for
 * COMMENT / SEARCH — so a row links to a post only when there is one to link to.
 */
export function ActivityScreen() {
  const t = useTranslations("profile");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMyActivity();

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const items = flattenPages(data);
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ActivityIcon className="size-8" />}
        title={t("activityEmpty")}
        className="py-10"
      />
    );
  }

  return (
    <div>
      <ul className="divide-ig-separator divide-y">
        {items.map((item, index) => (
          <ActivityRow key={`${item.type}-${item.at}-${index}`} item={item} />
        ))}
      </ul>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-ig-primary mt-4 text-sm font-semibold disabled:opacity-50"
        >
          {t("loadMore")}
        </button>
      ) : null}
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItemDto }) {
  const t = useTranslations("profile");
  const format = useFormatter();

  const icon =
    item.type === "LIKE" ? (
      <HeartIcon filled className="text-ig-danger size-5" />
    ) : item.type === "COMMENT" ? (
      <CommentIcon className="text-ig-text size-5" />
    ) : item.type === "SEARCH" ? (
      <SearchIcon className="text-ig-text size-5" />
    ) : (
      <ActivityIcon className="text-ig-text size-5" />
    );

  const label = t(`activity_${item.type}`);

  const body = (
    <div className="flex items-center gap-3 py-3">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-ig-text text-sm">{label}</p>
        {item.text ? <p className="text-ig-text-secondary truncate text-sm">{item.text}</p> : null}
      </div>
      <time
        dateTime={item.at}
        className="text-ig-text-secondary shrink-0 text-xs"
        suppressHydrationWarning
      >
        {format.relativeTime(new Date(item.at))}
      </time>
    </div>
  );

  return <li>{item.postId ? <Link href={ROUTES.post(item.postId)}>{body}</Link> : body}</li>;
}
