"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { useAnswerFollowRequest, useFollowRequests } from "@/hooks/useFollow";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { FollowRequestDto } from "@/types/api.types";
import { flattenPages } from "@/lib/cursor";

/**
 * Incoming follow requests — only a private account ever has any.
 *
 * A screen we could not build before: softclub had no private accounts, so no
 * requests existed to approve.
 */
export function FollowRequestsList() {
  const t = useTranslations("profile");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFollowRequests();

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const requests = flattenPages(data);
  if (requests.length === 0)
    return <EmptyState title={t("followRequestsEmpty")} className="py-10" />;

  return (
    <div>
      <ul className="space-y-1">
        {requests.map((request) => (
          <RequestRow key={request.id} request={request} />
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

function RequestRow({ request }: { request: FollowRequestDto }) {
  const t = useTranslations("profile");
  const answer = useAnswerFollowRequest();
  const { user } = request;

  return (
    <li className="flex items-center gap-3 py-2">
      <Link href={ROUTES.profile(user.id)}>
        <UserAvatar src={user.avatarUrl ?? null} alt={user.userName} size={44} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={ROUTES.profile(user.id)} className="text-ig-text text-sm font-semibold">
          <UserNameWithBadge userName={user.userName} isVerified={user.isVerified} />
        </Link>
        <p className="text-ig-text-secondary truncate text-sm">{user.fullName}</p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => answer.mutate({ id: request.id, accept: true })}
          disabled={answer.isPending}
          className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("confirmRequest")}
        </button>
        <button
          type="button"
          onClick={() => answer.mutate({ id: request.id, accept: false })}
          disabled={answer.isPending}
          className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
        >
          {t("deleteRequest")}
        </button>
      </div>
    </li>
  );
}
