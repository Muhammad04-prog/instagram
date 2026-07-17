"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MessageIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { useAnswerChatRequest, useChatRequests } from "@/hooks/useChat";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";

/**
 * «Запросы на переписку» — img22.
 *
 * Messages from people you do not follow. A screen Phase 9 could not build:
 * softclub had no request queue, every message just landed in the inbox.
 *
 * img22 also shows a «Скрытые запросы» row — there is no endpoint behind it, so
 * it is not drawn rather than faked.
 */
export function ChatRequestsList() {
  const t = useTranslations("chat");
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatRequests();
  const answer = useAnswerChatRequest();

  const requests = flattenPages(data);

  return (
    <div className="border-ig-border flex h-full w-full flex-col border-r md:w-[414px]">
      <div className="flex items-center gap-4 px-6 pt-8 pb-4">
        <button type="button" onClick={() => router.push(ROUTES.chat)} aria-label={t("back")}>
          <ChevronLeft className="text-ig-text size-6" />
        </button>
        <h1 className="text-ig-text text-xl font-bold">{t("requestsTitle")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isPending ? (
          <Loader className="py-10" />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : requests.length === 0 ? (
          <p className="text-ig-text-secondary px-6 py-4 text-sm">{t("requestsHint")}</p>
        ) : (
          <>
            <ul>
              {requests.map((request) => (
                <li key={request.id} className="flex items-center gap-3 px-6 py-2">
                  <Link href={ROUTES.profile(request.fromUser.id)}>
                    <UserAvatar
                      src={request.fromUser.avatarUrl ?? null}
                      alt={request.fromUser.userName}
                      size={56}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={ROUTES.profile(request.fromUser.id)}
                      className="text-ig-text block text-sm font-semibold"
                    >
                      <UserNameWithBadge
                        userName={request.fromUser.userName}
                        isVerified={request.fromUser.isVerified}
                      />
                    </Link>
                    <p className="text-ig-text-secondary truncate text-xs">
                      {request.lastMessage?.text ?? request.fromUser.fullName}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        answer.mutate(
                          { id: request.id, accept: true },
                          // Accepting turns it into a normal chat — go straight there.
                          { onSuccess: () => router.push(ROUTES.chatById(request.chatId)) },
                        )
                      }
                      disabled={answer.isPending}
                      className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {t("acceptRequest")}
                    </button>
                    <button
                      type="button"
                      onClick={() => answer.mutate({ id: request.id, accept: false })}
                      disabled={answer.isPending}
                      className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
                    >
                      {t("declineRequest")}
                    </button>
                  </div>
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

      {/* img22's red "Delete all N". There is no bulk endpoint, so it declines
          each one — N calls, but the button does exactly what it says. */}
      <div className="border-ig-separator border-t py-3 text-center">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={requests.length === 0 || answer.isPending}
          className="text-ig-danger text-sm font-semibold disabled:opacity-40"
        >
          {t("deleteAllRequests", { count: requests.length })}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteAllRequests", { count: requests.length })}
        description={t("deleteAllRequestsConfirm")}
        confirmLabel={t("declineRequest")}
        onConfirm={() => {
          for (const request of requests) answer.mutate({ id: request.id, accept: false });
        }}
      />
    </div>
  );
}

/** The right-hand pane of img22: what a request even is. */
export function ChatRequestsEmptyState() {
  const t = useTranslations("chat");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="border-ig-text flex size-24 items-center justify-center rounded-full border-2">
        <MessageIcon className="text-ig-text size-10" />
      </span>
      <h2 className="text-ig-text mt-6 text-xl">{t("requestsTitle")}</h2>
      <p className="text-ig-text-secondary mt-2 max-w-md text-sm">{t("requestsDescription")}</p>
    </div>
  );
}
