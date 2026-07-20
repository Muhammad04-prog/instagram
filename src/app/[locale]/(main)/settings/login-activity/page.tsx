import { setRequestLocale } from "next-intl/server";
import { SessionsList } from "@/components/settings/SessionsList";

export default async function LoginActivityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SessionsList />;
}
