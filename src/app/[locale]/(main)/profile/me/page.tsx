import { setRequestLocale } from "next-intl/server";
import { MyProfileView } from "@/components/profile/MyProfileView";

export default async function MyProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MyProfileView />;
}
