"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useUsers } from "@/hooks/useUserSearch";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Turns a userName into a profile route.
 *
 * `/users?q=` is a *substring* search across userName AND fullName ("er" also
 * matches "america"), so the exact, case-insensitive userName has to be picked
 * out of the results — taking the first row would open the wrong person.
 *
 * Replaces rather than pushes: the resolver must not sit in history, or Back
 * from the profile would bounce through it straight back to the profile.
 */
export function UserNameResolver({ userName }: { userName: string }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const { data, isPending, isError, refetch } = useUsers(userName);

  const match = data?.find((user) => user.userName.toLowerCase() === userName.toLowerCase());

  useEffect(() => {
    if (match) router.replace(ROUTES.profile(match.id));
  }, [match, router]);

  if (isPending || match) return <Loader className="py-20" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} className="py-20" />;

  return <EmptyState title={t("userNotFound", { userName })} className="py-20" />;
}
