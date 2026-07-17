"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useIsFollowing, useToggleFollow } from "@/hooks/useFollow";
import { cn } from "@/lib/utils";

/**
 * Optimistic follow toggle (see useToggleFollow). Unfollowing asks first, as IG
 * does; following is immediate.
 *
 * Where the follow state comes from depends on who already knows it:
 *
 * - the profile header has fetched the whole `OtherProfileDto`, so it passes
 *   `following` / `requested` down and this costs nothing;
 * - a list row (search, suggestions) only has a `UserBriefDto`, so the button
 *   asks `/profile/{id}/is-following` — two booleans, not a whole profile per row.
 */
export function FollowButton({
  userId,
  userName,
  variant = "solid",
  following: followingProp,
  requested: requestedProp,
  className,
}: {
  userId: string;
  userName: string;
  /** "solid" = profile header button, "link" = the compact blue text in lists. */
  variant?: "solid" | "link";
  /** Pass when the caller already knows the relationship — skips the request. */
  following?: boolean;
  requested?: boolean;
  className?: string;
}) {
  const t = useTranslations("profile");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const known = followingProp !== undefined;
  const { data, isPending } = useIsFollowing(userId, !known);
  const toggle = useToggleFollow(userId);

  const following = known ? Boolean(followingProp) : (data?.isFollowing ?? false);
  // Following a private account raises a request instead — the button has to
  // say "Requested" rather than pretend the follow went through.
  const requested = known ? Boolean(requestedProp) : (data?.hasRequestPending ?? false);

  const onClick = () => {
    // Both "unfollow" and "cancel request" are destructive enough to confirm.
    if (following || requested) {
      setConfirmOpen(true);
      return;
    }
    toggle.mutate(true);
  };

  const label = following ? t("followingButton") : requested ? t("requested") : t("follow");

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={!known && isPending}
        className={cn(
          variant === "solid"
            ? [
                "rounded-lg px-6 py-1.5 text-sm font-semibold disabled:opacity-50",
                following || requested
                  ? "bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover"
                  : "bg-ig-primary hover:bg-ig-primary-hover text-white",
              ]
            : [
                "text-xs font-semibold disabled:opacity-50",
                following || requested ? "text-ig-text-secondary" : "text-ig-primary",
              ],
          className,
        )}
      >
        {label}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          requested ? t("cancelRequestConfirm", { userName }) : t("unfollowConfirm", { userName })
        }
        confirmLabel={requested ? t("cancelRequest") : t("unfollow")}
        onConfirm={() => toggle.mutate(false)}
      />
    </>
  );
}
