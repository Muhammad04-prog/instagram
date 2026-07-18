import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HiddenAccountsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("hiddenAccounts")}</h2>
      <p className="text-ig-text-secondary py-10 text-center text-sm">{t("hiddenAccountsEmpty")}</p>
    </div>
  );
}
