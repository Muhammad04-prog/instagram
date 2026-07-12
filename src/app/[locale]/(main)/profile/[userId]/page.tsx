import { setRequestLocale } from "next-intl/server";
import { OtherProfileView } from "@/components/profile/OtherProfileView";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return <OtherProfileView userId={userId} />;
}
