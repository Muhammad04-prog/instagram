import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminGate } from "@/components/settings/AdminGate";

export const metadata: Metadata = { title: "Admin" };

/** ADMIN-only. The server guards the endpoints; this only hides the screen. */
export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <div className="max-w-[720px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("title")}</h2>
      <AdminGate />
    </div>
  );
}
