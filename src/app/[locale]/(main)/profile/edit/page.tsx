import { setRequestLocale } from "next-intl/server";
import { EditProfileScreen } from "@/components/profile/EditProfileScreen";

export default async function EditProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <EditProfileScreen />;
}
