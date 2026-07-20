"use client";

import { useTranslations } from "next-intl";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProfile } from "@/hooks/useProfile";

/** docs/screenshots/img43 — a 640px column headed "Редактировать профиль". */
export function EditProfileScreen() {
  const t = useTranslations("profile");
  const { data: profile, isPending, isError, refetch } = useMyProfile();

  return (
    <div className="w-full">
      <h1 className="text-ig-text mb-8 text-2xl font-bold">{t("editProfile")}</h1>

      {isPending ? (
        <div className="space-y-8">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      ) : isError || !profile ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <EditProfileForm profile={profile} />
      )}
    </div>
  );
}
