import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileViewsScreen } from "@/components/profile/ProfileViewsScreen";

export const metadata: Metadata = { title: "Profile views" };

/** "Who viewed your profile" — `GET /notifications/profile-views`. */
export default async function ProfileViewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("notifications");

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6">
      <h1 className="text-ig-text mb-6 text-xl font-bold">{t("profileViews")}</h1>
      <ProfileViewsScreen />
    </div>
  );
}
