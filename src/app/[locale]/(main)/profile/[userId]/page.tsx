import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { OtherProfileView } from "@/components/profile/OtherProfileView";
import { serverGet } from "@/lib/server-api";
import type { ProfileDto } from "@/types/profile.types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const profile = await serverGet<ProfileDto>("/ProfileDto/get-user-profile-by-id", {
    id: userId,
  });

  if (!profile) return { title: "Profile" };

  const name = profile.fullName;
  return {
    title: `${name ? `${name} (@${profile.userName})` : profile.userName}`,
    description: profile.about || undefined,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return <OtherProfileView userId={userId} />;
}
