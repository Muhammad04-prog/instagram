import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { UserNameResolver } from "@/components/profile/UserNameResolver";

export const metadata: Metadata = { title: "Profile" };

/**
 * `/u/{userName}` — where an @mention points.
 *
 * Profile routes are keyed by uuid, and the API has no username→id lookup, so a
 * mention cannot link straight to /profile/{id}. This resolves the name through
 * `/users?q=` and forwards. IG's own URLs are /username, so the extra hop is
 * invisible and the address stays shareable.
 */
export default async function UserByNamePage({
  params,
}: {
  params: Promise<{ locale: string; userName: string }>;
}) {
  const { locale, userName } = await params;
  setRequestLocale(locale);

  return <UserNameResolver userName={decodeURIComponent(userName)} />;
}
