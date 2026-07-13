import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocationManager } from "@/components/settings/LocationManager";

export const metadata: Metadata = { title: "Locations" };

export default async function LocationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("locations");

  return (
    <div className="max-w-[640px] space-y-6">
      <div className="space-y-1">
        <h2 className="text-ig-text text-lg font-bold">{t("title")}</h2>
        <p className="text-ig-text-secondary text-sm">{t("description")}</p>
      </div>
      <LocationManager />
    </div>
  );
}
