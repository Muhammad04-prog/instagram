import { setRequestLocale } from "next-intl/server";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NotificationsSettings />;
}
