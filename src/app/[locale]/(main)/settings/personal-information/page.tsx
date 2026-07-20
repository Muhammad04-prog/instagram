import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonalInformationForm } from "@/components/settings/PersonalInformationForm";

export const metadata: Metadata = { title: "Personal information" };

export default async function PersonalInformationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("personalInformation")}</h2>
      <PersonalInformationForm />
    </div>
  );
}
