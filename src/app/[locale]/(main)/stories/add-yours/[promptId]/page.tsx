import { setRequestLocale } from "next-intl/server";
import { AddYoursFeedScreen } from "@/components/story/AddYoursFeedScreen";

export default async function AddYoursPage({
  params,
}: {
  params: Promise<{ locale: string; promptId: string }>;
}) {
  const { locale, promptId } = await params;
  setRequestLocale(locale);

  return <AddYoursFeedScreen promptId={promptId} />;
}
