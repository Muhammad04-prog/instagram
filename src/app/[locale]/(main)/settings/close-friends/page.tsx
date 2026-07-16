import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CloseFriendsManager } from "@/components/settings/CloseFriendsManager";

export const metadata: Metadata = { title: "Close friends" };

export default async function CloseFriendsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("story");

  return (
    <div className="max-w-[640px] space-y-4">
      <h2 className="text-ig-text text-lg font-bold">{t("closeFriends")}</h2>
      <p className="text-ig-text-secondary text-sm">{t("closeFriendsHint")}</p>
      <CloseFriendsManager />
    </div>
  );
}
