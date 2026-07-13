import { setRequestLocale } from "next-intl/server";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";

/** Nothing open: mobile shows only the list (ChatShell), desktop the empty pane. */
export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="hidden flex-1 md:flex">
      <ChatEmptyState />
    </div>
  );
}
