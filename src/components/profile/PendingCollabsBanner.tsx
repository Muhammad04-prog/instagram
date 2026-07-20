"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAnswerCollab, usePendingCollabs } from "@/hooks/usePosts";
import { getImageUrl } from "@/lib/utils";
import { gridCoverUrl } from "@/types/post.types";
import { flattenPages } from "@/lib/cursor";

/**
 * "You've been invited to collaborate" — `GET /posts/collabs/pending`, new in
 * the 19.07.2026 swagger refresh. Real IG surfaces this as a notification;
 * this build's 23 notification types don't include one for it (`NotificationDto`
 * carries no collab-invite variant), so it sits here instead — above your own
 * Posts tab, the one place an invited post would otherwise silently wait.
 */
export function PendingCollabsBanner() {
  const t = useTranslations("post");
  const { data } = usePendingCollabs();
  const answer = useAnswerCollab();

  const invites = flattenPages(data);
  if (invites.length === 0) return null;

  return (
    <div className="border-ig-border mb-4 space-y-2 rounded-2xl border p-3">
      <h2 className="text-ig-text px-1 text-sm font-semibold">{t("pendingCollabsTitle")}</h2>
      <ul className="space-y-2">
        {invites.map((post) => {
          const rawUrl = gridCoverUrl(post);
          const url = rawUrl ? getImageUrl(rawUrl) : null;
          return (
            <li key={post.id} className="flex items-center gap-3">
              <span className="bg-ig-button-secondary relative size-11 shrink-0 overflow-hidden rounded-lg">
                {url ? (
                  <Image
                    src={url}
                    alt={post.caption ?? ""}
                    fill
                    sizes="44px"
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-ig-text truncate text-sm">
                  <span className="font-semibold">{post.author.userName}</span>
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    answer.mutate(
                      { postId: post.id, accept: true },
                      { onSuccess: () => toast.success(t("collabAccepted")) },
                    )
                  }
                  disabled={answer.isPending}
                  className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {t("acceptCollab")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    answer.mutate(
                      { postId: post.id, accept: false },
                      { onSuccess: () => toast.success(t("collabDeclined")) },
                    )
                  }
                  disabled={answer.isPending}
                  className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover rounded-lg px-3 py-1 text-xs font-semibold disabled:opacity-50"
                >
                  {t("declineCollab")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
