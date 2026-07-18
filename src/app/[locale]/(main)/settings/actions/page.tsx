import { ClipboardList } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { SettingsRow, SettingsRowGroup } from "@/components/settings/SettingsRow";
import { ROUTES } from "@/lib/constants";
import { Link } from "@/i18n/navigation";

export default async function AccountActionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-8">
      <div className="border-ig-border rounded-2xl border">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="text-ig-text text-base font-semibold">{t("accountActions")}</h2>
          <span className="text-ig-link text-sm font-semibold">{t("seeAll")}</span>
        </div>
        <EmptyState
          icon={<ClipboardList className="text-ig-text size-8" />}
          title={t("noActions")}
          description={t("noActionsHint")}
        />
      </div>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("settingsSection")}</h3>
        <SettingsRowGroup>
          <Link href={ROUTES.help}>
            <SettingsRow title={t("helpAndSupport")} />
          </Link>
        </SettingsRowGroup>
      </section>
    </div>
  );
}
