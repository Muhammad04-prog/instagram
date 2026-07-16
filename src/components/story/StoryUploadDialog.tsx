"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAddStory } from "@/hooks/useStories";

/**
 * «Добавить в историю» — AddStories takes one image (multipart `Image`) plus an
 * optional `PostId` query param, which is how IG's "share a post to your story"
 * is modelled. No reference screenshot exists (docs/screenshots/INDEX.md §6).
 */
export function StoryUploadDialog({
  open,
  onOpenChange,
  postId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: number;
}) {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [file, setFile] = useState<File | null>(null);
  const add = useAddStory();

  const preview = file ? URL.createObjectURL(file) : null;

  const onSubmit = () => {
    if (!file) return;
    add.mutate(
      // Multi-upload is supported (up to 10 → 10 separate stories); the dialog
      // still takes one file, so this sends a one-item list.
      { media: [file], fromPostId: postId },
      {
        onSuccess: () => {
          toast.success(t("storyAdded"));
          setFile(null);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setFile(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="bg-ig-elevated w-[420px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogTitle className="border-ig-separator text-ig-text border-b py-3 text-center text-base font-semibold">
          {t("addStory")}
        </DialogTitle>

        <div className="p-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob: preview, never optimised
            <img src={preview} alt="" className="max-h-[420px] w-full rounded-lg object-contain" />
          ) : (
            <label className="border-ig-border flex h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
              <p className="text-ig-text text-sm">{t("pickStoryImage")}</p>
              <span className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white">
                {t("selectFile")}
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const picked = event.target.files?.[0];
                  if (!picked) return;
                  if (!picked.type.startsWith("image/")) {
                    toast.error(tErrors("imageOnly"));
                    return;
                  }
                  setFile(picked);
                }}
              />
            </label>
          )}
        </div>

        <div className="border-ig-separator flex border-t">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-ig-text w-full py-3 text-sm"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!file || add.isPending}
            className="text-ig-primary border-ig-separator w-full border-l py-3 text-sm font-bold disabled:opacity-40"
          >
            {add.isPending ? tCommon("loading") : t("share")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
