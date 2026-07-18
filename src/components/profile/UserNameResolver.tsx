"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useUserByUserName } from "@/hooks/useUserSearch";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/axios";
import { ROUTES } from "@/lib/constants";

/**
 * Turns a userName into a profile route via `GET /users/by-username/{userName}`
 * — an exact, case-insensitive lookup added specifically to replace the old
 * workaround of picking a name out of the substring `/users?q=` search (which
 * also matches fullName, so "er" would surface "america" too).
 *
 * A missing user and a blocked one both 404 here, same as in search — either
 * way there is nothing to route to, so both just render "not found".
 *
 * Replaces rather than pushes: the resolver must not sit in history, or Back
 * from the profile would bounce through it straight back to the profile.
 */
export function UserNameResolver({ userName }: { userName: string }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const { data, isPending, isError, error, refetch } = useUserByUserName(userName);

  useEffect(() => {
    if (data) router.replace(ROUTES.profile(data.id));
  }, [data, router]);

  if (isPending || data) return <Loader className="py-20" />;

  if (isError) {
    // A 404 means the lookup answered "no such user" — anything else (network,
    // 500) is a real failure and deserves a retry, not a false "not found".
    if (error instanceof ApiError && error.statusCode === 404) {
      return <EmptyState title={t("userNotFound", { userName })} className="py-20" />;
    }
    return <ErrorState onRetry={() => void refetch()} className="py-20" />;
  }

  return null;
}
