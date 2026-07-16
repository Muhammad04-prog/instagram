"use client";

import { useTranslations } from "next-intl";
import { useCreateChat } from "@/hooks/useChat";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * "Send message" on someone else's profile. `create-chat` is idempotent, so
 * pressing it again just reopens the existing conversation.
 */
export function MessageUserButton({ userId }: { userId: string }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const createChat = useCreateChat();

  return (
    <button
      type="button"
      disabled={createChat.isPending}
      onClick={() =>
        createChat.mutate(
          { receiverUserId: userId },
          { onSuccess: (chat) => router.push(ROUTES.chatById(chat.id)) },
        )
      }
      className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover flex-1 rounded-lg py-1.5 text-sm font-semibold disabled:opacity-50"
    >
      {t("message")}
    </button>
  );
}
