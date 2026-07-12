"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { PostDetail } from "@/components/post/PostDetail";
import { Dialog, DialogContent, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";

/**
 * Modal shell of the intercepted post route. IG puts the close button in the
 * screen's corner rather than on the card — on the card it would land on top of
 * the «…» menu (docs/screenshots/img12). It has to live inside DialogPortal to
 * be positioned against the viewport.
 */
export function PostModal({ postId }: { postId: number }) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogPortal>
        <button
          type="button"
          aria-label={tCommon("close")}
          onClick={() => router.back()}
          className="fixed top-4 right-5 z-[60] text-white/90 hover:text-white"
        >
          <X className="size-7" />
        </button>
      </DialogPortal>

      <DialogContent
        showCloseButton={false}
        className="bg-ig-bg w-[95vw] max-w-[1100px] gap-0 overflow-hidden rounded-sm p-0 sm:max-w-[1100px]"
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <PostDetail postId={postId} onClose={() => router.back()} />
      </DialogContent>
    </Dialog>
  );
}
