"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAddStory } from "@/hooks/useStories";
import { isVideo } from "@/types/post.types";

/**
 * «Добавить в историю» — AddStories takes ONE file (multipart `Image`) plus an
 * optional `PostId` per call, so "add several stories at once" is several
 * sequential calls, not a bulk endpoint. No reference screenshot exists
 * (docs/screenshots/INDEX.md §6).
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
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const add = useAddStory();

  const reset = () => {
    setFiles([]);
    setUploading(false);
  };

  const addFiles = (picked: FileList) => {
    const accepted: File[] = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error(tErrors("mediaOnly"));
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length > 0) setFiles((current) => [...current, ...accepted]);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, position) => position !== index));
  };

  const onSubmit = async () => {
    if (files.length === 0) return;
    setUploading(true);

    let successCount = 0;
    for (const file of files) {
      try {
        await add.mutateAsync({ image: file, postId });
        successCount += 1;
      } catch {
        // useAddStory's onError already toasts the failure — keep uploading the rest.
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(t("storyAdded"));
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="bg-ig-elevated w-[420px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogTitle className="border-ig-separator text-ig-text border-b py-3 text-center text-base font-semibold">
          {t("addStory")}
        </DialogTitle>

        <div className="p-4">
          {files.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {files.map((file, index) => (
                <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
              ))}
              <label className="border-ig-border text-ig-text-secondary flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed text-2xl">
                +
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  hidden
                  onChange={(event) => {
                    if (event.target.files) addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          ) : (
            <label className="border-ig-border flex h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
              <p className="text-ig-text text-sm">{t("pickStoryMedia")}</p>
              <span className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white">
                {t("selectFile")}
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          )}
          {files.length > 0 ? (
            <p className="text-ig-text-secondary mt-2 text-xs">
              {t("selectedCount", { count: files.length })}
            </p>
          ) : null}
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
            onClick={() => void onSubmit()}
            disabled={files.length === 0 || uploading}
            className="text-ig-primary border-ig-separator w-full border-l py-3 text-sm font-bold disabled:opacity-40"
          >
            {uploading ? tCommon("loading") : t("share")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const t = useTranslations("story");
  const src = URL.createObjectURL(file);

  return (
    <div className="bg-ig-bg-secondary relative aspect-square overflow-hidden rounded-lg">
      {isVideo(file.name) || file.type.startsWith("video/") ? (
        <video src={src} muted className="size-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- blob: preview, never optimised
        <img src={src} alt="" className="size-full object-cover" />
      )}
      <button
        type="button"
        aria-label={t("removeFile")}
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
