import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HashtagScreen } from "@/components/explore/HashtagScreen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  return { title: `#${decodeURIComponent(name)}` };
}

/** Every post carrying a hashtag — where a #tag in a caption points. */
export default async function HashtagPage({
  params,
}: {
  params: Promise<{ locale: string; name: string }>;
}) {
  const { locale, name } = await params;
  setRequestLocale(locale);

  return <HashtagScreen name={decodeURIComponent(name)} />;
}
