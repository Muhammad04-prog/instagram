import { setRequestLocale } from "next-intl/server";

// Chat list + window land in Phase 9. Present now so the sidebar's
// auto-collapse on /chat is exercisable.
export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <main className="min-h-dvh" />;
}
