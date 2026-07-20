"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAnswerLiveJoinRequest, useLiveJoinRequests } from "@/hooks/useLive";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Host-only: who's asking to come on screen — `GET /live/{id}/requests`, new
 * in the 19.07.2026 swagger refresh. Closes the gap `request-join` used to
 * leave open: the ask could go out, but the host had no list to answer it from.
 */
export function LiveJoinRequestsSheet({
  liveId,
  open,
  onOpenChange,
}: {
  liveId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("live");
  const { data, isPending } = useLiveJoinRequests(liveId, open);
  const answer = useAnswerLiveJoinRequest(liveId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("joinRequests")}</SheetTitle>
        </SheetHeader>

        {isPending ? (
          <Loader className="py-10" />
        ) : !data || data.length === 0 ? (
          <EmptyState title={t("noJoinRequests")} className="py-10" />
        ) : (
          <ul className="divide-ig-separator divide-y px-4 pb-4">
            {data.map((request) => (
              <li key={request.id} className="flex items-center gap-3 py-3">
                <Link
                  href={ROUTES.profile(request.user.id)}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <UserAvatar src={request.user.avatarUrl} size={40} />
                  <span className="min-w-0">
                    <span className="text-ig-text flex items-center gap-1 text-sm font-semibold">
                      <span className="truncate">{request.user.userName}</span>
                      {request.user.isVerified ? <VerifiedBadge /> : null}
                    </span>
                  </span>
                </Link>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => answer.mutate({ requestId: request.id, accept: true })}
                    disabled={answer.isPending}
                    className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {t("acceptJoinRequest")}
                  </button>
                  <button
                    type="button"
                    onClick={() => answer.mutate({ requestId: request.id, accept: false })}
                    disabled={answer.isPending}
                    className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover rounded-lg px-3 py-1 text-xs font-semibold disabled:opacity-50"
                  >
                    {t("declineJoinRequest")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
