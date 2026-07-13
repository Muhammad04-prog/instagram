import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ locale: string; chatId: string }>;
}) {
  const { locale, chatId } = await params;
  setRequestLocale(locale);

  const id = Number(chatId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  return <ChatWindow chatId={id} />;
}
