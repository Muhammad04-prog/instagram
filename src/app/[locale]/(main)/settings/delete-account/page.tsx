import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";

export const metadata: Metadata = { title: "Delete account" };

export default async function DeleteAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-3">
      <h2 className="text-ig-text text-lg font-bold">{t("accountControl")}</h2>
      <p className="text-ig-text-secondary text-sm">{t("deleteAccountConfirm")}</p>
      <DeleteAccountDialog />
    </div>
  );
}
