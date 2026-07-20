import { getTranslations, setRequestLocale } from "next-intl/server";
import { RestrictedAccountsList } from "@/components/settings/RestrictedAccountsList";

export default async function RestrictedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("restrictedAccounts")}</h2>
      <p className="text-ig-text-secondary text-sm">{t("restrictedHint")}</p>
      <RestrictedAccountsList />
    </div>
  );
}
