"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageIcon } from "@/components/icons";

/** Right pane of /chat with nothing open (img18): paper plane + blue CTA. */
export function ChatEmptyState() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={<MessageIcon className="size-12" />}
        title={t("empty")}
        description={t("emptyDescription")}
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-ig-primary rounded-lg px-4 py-1.5 text-sm font-semibold text-white"
          >
            {t("sendMessage")}
          </button>
        }
      />
      <NewChatDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
