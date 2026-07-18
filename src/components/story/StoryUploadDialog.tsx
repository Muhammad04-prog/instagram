"use client";

import { Type, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { MusicPicker } from "@/components/post/MusicPicker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAddStory } from "@/hooks/useStories";
import { ORIGINAL_FILTER, PHOTO_FILTERS, filterCss } from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { MusicDto } from "@/types/api.types";

/**
 * «Добавить в историю» — full-bleed editor, not a small centered dialog.
 *
 * Only wires what `POST /stories` actually accepts: `media`, `filter`,
 * `musicId`/`musicStartSec`, `closeFriendsOnly`, `overlays` (one text overlay
 * here — a single centred caption, not a draggable multi-overlay canvas).
 * There is no privacy/audience field, no auto-archive flag and no location on
 * this endpoint, so — unlike a generic "story composer" mockup — none of
 * those are shown here; they would be controls that quietly do nothing.
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
  const [caption, setCaption] = useState("");
  const [captionOpen, setCaptionOpen] = useState(false);
  const [filterId, setFilterId] = useState(ORIGINAL_FILTER);
  const [music, setMusic] = useState<MusicDto | null>(null);
  const [closeFriendsOnly, setCloseFriendsOnly] = useState(false);
  const add = useAddStory();

  const preview = file ? URL.createObjectURL(file) : null;

  const reset = () => {
    setFile(null);
    setCaption("");
    setCaptionOpen(false);
    setFilterId(ORIGINAL_FILTER);
    setMusic(null);
    setCloseFriendsOnly(false);
  };

  const onSubmit = () => {
    if (!file) return;
    add.mutate(
      {
        media: [file],
        fromPostId: postId,
        closeFriendsOnly,
        filter: filterId === ORIGINAL_FILTER ? undefined : filterId,
        musicId: music?.id,
        overlays: caption.trim() ? [{ type: "text", value: caption.trim() }] : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("storyAdded"));
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      toast.error(tErrors("imageOnly"));
      return;
    }
    setFile(picked);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton
        className={cn(
          "gap-0 overflow-hidden rounded-xl border-none p-0",
          // The base DialogContent's `sm:max-w-sm` is a different variant
          // group than an unprefixed `max-w-*`, so it survives tailwind-merge
          // and wins at >=640px unless overridden with the same `sm:` prefix.
          file
            ? "flex h-[85vh] w-[860px] max-w-[95vw] bg-black sm:max-w-[95vw]"
            : "bg-ig-elevated w-[420px] sm:max-w-[420px]",
        )}
      >
        <DialogTitle className="sr-only">{t("addStory")}</DialogTitle>

        {!file ? (
          <div className="p-4">
            <p className="text-ig-text border-ig-separator border-b pb-3 text-center text-base font-semibold">
              {t("addStory")}
            </p>
            <label className="border-ig-border mt-4 flex h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
              <p className="text-ig-text text-sm">{t("pickStoryImage")}</p>
              <span className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white">
                {t("selectFile")}
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => pickFile(event.target.files?.[0])}
              />
            </label>
          </div>
        ) : (
          <>
            {/* Canvas + tool rail */}
            <div className="flex flex-1 items-center justify-center gap-4 p-6">
              <div className="flex flex-col gap-3">
                <ToolButton
                  label={t("addCaption")}
                  active={captionOpen}
                  onClick={() => setCaptionOpen((v) => !v)}
                >
                  <Type className="size-5" />
                </ToolButton>
                <ToolButton label={tCommon("cancel")} onClick={() => setFile(null)}>
                  <Undo2 className="size-5" />
                </ToolButton>
              </div>

              <div className="relative aspect-[9/16] h-full max-h-[640px] overflow-hidden rounded-xl bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview, never optimised */}
                <img
                  src={preview ?? ""}
                  alt=""
                  style={{ filter: filterCss(filterId) }}
                  className="size-full object-cover"
                />

                {caption ? (
                  <p className="absolute inset-x-4 top-10 text-center text-lg font-semibold break-words text-white drop-shadow-lg">
                    {caption}
                  </p>
                ) : null}

                {captionOpen ? (
                  <div className="absolute inset-x-4 top-10">
                    <input
                      autoFocus
                      value={caption}
                      onChange={(event) => setCaption(event.target.value.slice(0, 60))}
                      onBlur={() => setCaptionOpen(false)}
                      placeholder={t("captionPlaceholder")}
                      aria-label={t("captionPlaceholder")}
                      className="w-full rounded-md bg-black/40 px-2 py-1 text-center text-lg font-semibold text-white outline-none placeholder:text-white/70"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Settings panel */}
            <div className="border-ig-separator bg-ig-elevated flex w-[300px] shrink-0 flex-col overflow-y-auto border-l">
              <div className="flex-1 space-y-1 p-4">
                <p className="text-ig-text-secondary text-xs font-semibold tracking-wide uppercase">
                  {t("filtersTab")}
                </p>
                <ul className="flex scrollbar-none gap-2 overflow-x-auto pb-2">
                  {PHOTO_FILTERS.map((filter) => {
                    const active = filter.id === filterId;
                    return (
                      <li key={filter.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => setFilterId(filter.id)}
                          aria-pressed={active}
                          className="flex flex-col items-center gap-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview */}
                          <img
                            src={preview ?? ""}
                            alt=""
                            style={{ filter: filter.css || undefined }}
                            className={cn(
                              "size-12 rounded object-cover",
                              active && "ring-ig-primary ring-2 ring-offset-1",
                            )}
                          />
                          <span
                            className={cn(
                              "text-[11px]",
                              active ? "text-ig-primary font-semibold" : "text-ig-text-secondary",
                            )}
                          >
                            {filter.id === ORIGINAL_FILTER ? t("originalFilter") : filter.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <MusicPicker value={music} onChange={setMusic} />

                <label className="border-ig-separator flex cursor-pointer items-center gap-3 border-t py-3">
                  <span className="min-w-0 flex-1">
                    <span className="text-ig-text block text-sm font-semibold">
                      {t("closeFriendsOnly")}
                    </span>
                    <span className="text-ig-text-secondary block text-xs">
                      {t("closeFriendsOnlyHint")}
                    </span>
                  </span>
                  <Switch checked={closeFriendsOnly} onCheckedChange={setCloseFriendsOnly} />
                </label>
              </div>

              <div className="border-ig-separator border-t p-4">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={add.isPending}
                  className="story-ring w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {add.isPending ? tCommon("loading") : t("share")}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ToolButton({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-white transition-colors",
        active ? "bg-white text-black" : "bg-white/15 hover:bg-white/25",
      )}
    >
      {children}
    </button>
  );
}
