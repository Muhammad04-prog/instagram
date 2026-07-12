"use client";

import { useTranslations } from "next-intl";
import { StoryViewer } from "@/components/story/StoryViewer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";

/** Story played over the feed (intercepted route), like IG's full-screen overlay. */
export function StoryModal({ userId }: { userId: string }) {
  const t = useTranslations("story");
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        showCloseButton={false}
        className="w-[420px] max-w-[95vw] border-0 bg-transparent p-0 shadow-none sm:max-w-[420px]"
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <StoryViewer userId={userId} onClose={() => router.back()} />
      </DialogContent>
    </Dialog>
  );
}
