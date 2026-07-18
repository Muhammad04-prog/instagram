"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { FollowRequestsList } from "@/components/profile/FollowRequestsList";
import { Switch } from "@/components/ui/switch";
import { useMyProfile, useUpdatePrivacy } from "@/hooks/useProfile";

/**
 * Settings → privacy (img4): just the private-account switch and the two
 * explanatory paragraphs below it — pixel-matched to the real screen, which
 * doesn't carry follow requests or the blocked list inline (those moved to
 * their own screens: /settings/blocked, and requests stay reachable from the
 * profile itself). `isPrivate` is the switch's truth, straight off my profile.
 */
export function PrivacySettings() {
  const t = useTranslations("profile");
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const privacy = useUpdatePrivacy();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !profile) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <label className="border-ig-border flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4">
        <span className="text-ig-text flex-1 text-sm">{t("privateAccount")}</span>
        <Switch
          checked={profile.isPrivate}
          disabled={privacy.isPending}
          onCheckedChange={(isPrivate) => privacy.mutate({ isPrivate })}
        />
      </label>

      <p className="text-ig-text-secondary text-sm">{t("privateAccountHint")}</p>

      {/* Only a private account can have requests — hide the section otherwise
          rather than show a permanently empty list. */}
      {profile.isPrivate ? (
        <section className="space-y-3 pt-4">
          <h2 className="text-ig-text text-base font-semibold">{t("followRequests")}</h2>
          <FollowRequestsList />
        </section>
      ) : null}
    </div>
  );
}
