import { setRequestLocale } from "next-intl/server";
import { AccountStatusScreen } from "@/components/settings/AccountStatusScreen";

export default async function AccountStatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AccountStatusScreen />;
}
