"use client";

import { useTranslations } from "next-intl";
import { StoryDeck } from "@/components/story/StoryDeck";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";

/**
 * Story played over the feed (intercepted route), like IG's full-screen overlay.
 *
 * The dialog is the whole viewport, not a 420px box: the deck parks neighbouring
 * authors beside the open story, so the stage needs the full width to lay them
 * out (docs/screenshots/img10, img11).
 */
export function StoryModal({ userId }: { userId: string }) {
  const t = useTranslations("story");
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <StoryDeck userId={userId} onClose={() => router.back()} />
      </DialogContent>
    </Dialog>
  );
}
