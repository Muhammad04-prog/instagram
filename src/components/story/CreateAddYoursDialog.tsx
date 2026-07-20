"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCreateAddYours } from "@/hooks/useStories";

/** Turns my own story into the first link of an "Add Yours" chain. */
export function CreateAddYoursDialog({
  storyId,
  open,
  onOpenChange,
}: {
  storyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("story");
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("");
  const create = useCreateAddYours();

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    create.mutate(
      { storyId, dto: { text: trimmed, emoji: emoji.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(t("addYoursCreated"));
          setText("");
          setEmoji("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated w-[360px] gap-4 rounded-xl">
        <DialogTitle className="text-ig-text text-base font-bold">{t("startAddYours")}</DialogTitle>

        <input
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, 80))}
          placeholder={t("addYoursPromptPlaceholder")}
          aria-label={t("addYoursPromptPlaceholder")}
          autoFocus
          className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
        />

        <input
          value={emoji}
          onChange={(event) => setEmoji(event.target.value.slice(0, 8))}
          placeholder={t("addYoursEmojiPlaceholder")}
          aria-label={t("addYoursEmojiPlaceholder")}
          className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || create.isPending}
          className="bg-ig-primary hover:bg-ig-primary-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("addYoursStart")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
