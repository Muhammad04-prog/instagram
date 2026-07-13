import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };

// The full settings shell (theme, language, sidebar nav — img39–img42) lands in Phase 10.
export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-10">
      <h1 className="text-ig-text mb-8 text-xl font-semibold">{t("title")}</h1>

      <Link
        href={ROUTES.changePassword}
        className="text-ig-text hover:bg-ig-elevated -mx-3 flex rounded-lg px-3 py-3 text-sm"
      >
        {t("changePassword")}
      </Link>

      <Separator className="bg-ig-separator my-6" />

      <section className="space-y-2">
        <h2 className="text-ig-text text-base font-semibold">{t("accountControl")}</h2>
        <p className="text-ig-text-secondary text-sm">{t("deleteAccountConfirm")}</p>
        <DeleteAccountDialog />
      </section>
    </main>
  );
}
