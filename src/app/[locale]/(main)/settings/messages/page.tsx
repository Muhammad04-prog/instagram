import { setRequestLocale } from "next-intl/server";
import { MessagesSettings } from "@/components/settings/MessagesSettings";

export default async function MessagesSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MessagesSettings />;
}
