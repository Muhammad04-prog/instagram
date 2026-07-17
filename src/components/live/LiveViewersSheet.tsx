"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useKickFromLive, useLiveViewers } from "@/hooks/useLive";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/** Who is watching. The host — and only the host — can throw someone out. */
export function LiveViewersSheet({
  liveId,
  open,
  onOpenChange,
  isHost,
}: {
  liveId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHost: boolean;
}) {
  const t = useTranslations("live");
  const { data, isPending } = useLiveViewers(liveId, open);
  const kick = useKickFromLive(liveId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("viewers")}</SheetTitle>
        </SheetHeader>

        {isPending ? (
          <Loader className="py-10" />
        ) : !data || data.length === 0 ? (
          <EmptyState title={t("noViewers")} className="py-10" />
        ) : (
          <ul className="divide-ig-separator divide-y px-4 pb-4">
            {data.map((viewer) => (
              <li key={viewer.user.id} className="flex items-center gap-3 py-3">
                <Link
                  href={ROUTES.profile(viewer.user.id)}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <UserAvatar src={viewer.user.avatarUrl} size={40} />
                  <span className="min-w-0">
                    <span className="text-ig-text flex items-center gap-1 text-sm font-semibold">
                      <span className="truncate">{viewer.user.userName}</span>
                      {viewer.user.isVerified ? <VerifiedBadge /> : null}
                    </span>
                    <span className="text-ig-text-secondary block truncate text-xs">
                      {viewer.user.fullName}
                    </span>
                  </span>
                </Link>

                {isHost ? (
                  <button
                    type="button"
                    onClick={() => kick.mutate(viewer.user.id)}
                    disabled={kick.isPending}
                    className="text-ig-danger shrink-0 text-xs font-semibold disabled:opacity-50"
                  >
                    {t("kick")}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
