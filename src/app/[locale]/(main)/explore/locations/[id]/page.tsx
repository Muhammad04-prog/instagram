import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LocationScreen } from "@/components/explore/LocationScreen";

export const metadata: Metadata = { title: "Location" };

/** Posts from one place — where a location in search results leads. */
export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <LocationScreen locationId={Number(id)} />;
}
