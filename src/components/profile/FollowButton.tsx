"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToggleFollow } from "@/hooks/useFollow";
import { useUserProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

/**
 * Optimistic follow toggle (see useToggleFollow). Unfollowing asks first, as IG
 * does; following is immediate.
 *
 * The follow state comes from `get-is-follow-user-profile-by-id` via
 * useUserProfile — the same cache entry the profile header reads, so the button
 * and the follower counter can never disagree.
 */
export function FollowButton({
  userId,
  userName,
  variant = "solid",
  className,
}: {
  userId: string;
  userName: string;
  /** "solid" = profile header button, "link" = the compact blue text in lists. */
  variant?: "solid" | "link";
  className?: string;
}) {
  const t = useTranslations("profile");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: profile, isPending } = useUserProfile(userId);
  const toggle = useToggleFollow(userId);

  const following = profile?.isSubscriber ?? false;

  const onClick = () => {
    if (following) {
      setConfirmOpen(true);
      return;
    }
    toggle.mutate(true);
  };

  const label = following ? t("followingButton") : t("follow");

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className={cn(
          variant === "solid"
            ? [
                "rounded-lg px-6 py-1.5 text-sm font-semibold disabled:opacity-50",
                following
                  ? "bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover"
                  : "bg-ig-primary hover:bg-ig-primary-hover text-white",
              ]
            : [
                "text-xs font-semibold disabled:opacity-50",
                following ? "text-ig-text-secondary" : "text-ig-primary",
              ],
          className,
        )}
      >
        {label}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("unfollowConfirm", { userName })}
        confirmLabel={t("unfollow")}
        onConfirm={() => toggle.mutate(false)}
      />
    </>
  );
}
