"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUpdatePost } from "@/hooks/usePosts";
import type { PostDto } from "@/types/post.types";

const CAPTION_MAX = 2200;

/**
 * "Edit caption" — `PUT /posts/{id}`.
 *
 * Caption is the only editable field, and the server re-parses hashtags out of
 * the new text, so removing "#travel" really does drop the post off that tag's
 * page. Softclub had no update at all: a typo meant delete and re-upload.
 */
export function EditCaptionDialog({
  post,
  open,
  onOpenChange,
}: {
  post: PostDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const [caption, setCaption] = useState(post.caption ?? "");
  const update = useUpdatePost();

  const dirty = caption !== (post.caption ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* No default ✕: this header has its own Cancel / Done, and the ✕ sits in
          the same top-right corner — it swallowed the clicks meant for Done. */}
      <DialogContent
        showCloseButton={false}
        className="bg-ig-elevated w-[500px] gap-0 overflow-hidden rounded-xl p-0"
      >
        <div className="border-ig-separator flex items-center justify-between border-b px-4 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-ig-text text-sm"
          >
            {tCommon("cancel")}
          </button>
          <DialogTitle className="text-ig-text text-base font-semibold">
            {t("editCaption")}
          </DialogTitle>
          <button
            type="button"
            disabled={!dirty || update.isPending}
            onClick={() =>
              update.mutate(
                { postId: post.id, caption },
                {
                  onSuccess: () => {
                    toast.success(t("captionUpdated"));
                    onOpenChange(false);
                  },
                },
              )
            }
            className="text-ig-primary text-sm font-semibold disabled:opacity-40"
          >
            {tCommon("done")}
          </button>
        </div>

        <div className="p-4">
          <Textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value.slice(0, CAPTION_MAX))}
            rows={6}
            autoFocus
            placeholder={t("captionPlaceholder")}
            className="text-ig-text resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <p className="text-ig-text-secondary text-right text-xs">
            {caption.length}/{CAPTION_MAX}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
