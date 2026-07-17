import { setRequestLocale } from "next-intl/server";
import { ChatRequestsEmptyState } from "@/components/chat/ChatRequestsList";

/**
 * docs/screenshots/img22 — the list itself replaces ChatShell's left column
 * (see chat/layout.tsx); this pane is the explanation on the right.
 */
export default async function ChatRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="hidden flex-1 md:flex">
      <ChatRequestsEmptyState />
    </div>
  );
}
