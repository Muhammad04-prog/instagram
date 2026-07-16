"use client";

import { ImagePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef } from "react";
import { Loader } from "@/components/shared/Loader";
import { useRemoveUpload, useUploadMedia } from "@/hooks/useUpload";
import { getImageUrl } from "@/lib/utils";
import type { UploadedMediaDto } from "@/types/api.types";

/**
 * The picture shown while the host's camera is off.
 *
 * It has to exist *before* the broadcast does — `/live/start` takes a `coverUrl`
 * — so it goes through the standalone upload pipe, which is exactly what that
 * pipe is for.
 *
 * Removing it deletes the file by its key. Without that, changing your mind
 * would leave an orphan in storage that nothing ever points at.
 */
export function LiveCoverPicker({
  cover,
  onChange,
}: {
  cover: UploadedMediaDto | null;
  onChange: (cover: UploadedMediaDto | null) => void;
}) {
  const t = useTranslations("live");
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();
  const remove = useRemoveUpload();

  const url = cover ? getImageUrl(cover.url) : null;

  const clear = () => {
    if (cover) remove.mutate(cover.key);
    onChange(null);
    // Without this the same file cannot be picked again — change never fires.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          // Replacing a cover drops the old file first.
          if (cover) remove.mutate(cover.key);
          upload.mutate(file, {
            onSuccess: (uploaded) => {
              const first = uploaded[0];
              if (first) onChange(first);
            },
          });
        }}
      />

      {upload.isPending ? (
        <div className="border-ig-border flex h-32 items-center justify-center rounded-lg border border-dashed">
          <Loader />
        </div>
      ) : url ? (
        <div className="relative h-32 overflow-hidden rounded-lg">
          <Image src={url} alt="" fill sizes="400px" className="object-cover" />
          <button
            type="button"
            onClick={clear}
            aria-label={t("removeCover")}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-ig-border text-ig-text-secondary hover:bg-ig-elevated flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm"
        >
          <ImagePlus className="size-6" />
          {t("addCover")}
        </button>
      )}

      <p className="text-ig-text-secondary text-xs">{t("coverHint")}</p>
    </div>
  );
}
