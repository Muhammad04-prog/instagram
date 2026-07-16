import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VerificationScreen } from "@/components/settings/VerificationScreen";

export const metadata: Metadata = { title: "Meta Verified" };

export default async function VerifiedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("verification");

  return (
    <div className="max-w-[560px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("navTitle")}</h2>
      <VerificationScreen />
    </div>
  );
}
