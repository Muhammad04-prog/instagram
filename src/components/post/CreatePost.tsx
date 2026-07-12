"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";
import { useAddPost } from "@/hooks/usePosts";
import { useMyProfile } from "@/hooks/useProfile";
import { useRouter } from "@/i18n/navigation";
import { cropImageToFile, type CropArea } from "@/lib/crop";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isVideo } from "@/types/post.types";

const CAPTION_MAX = 2200;
const ASPECTS = { square: 1, portrait: 4 / 5 } as const;
type AspectKey = keyof typeof ASPECTS;

type Step = "pick" | "crop" | "caption";

/**
 * «Создание публикации» (docs/screenshots/img29 → img30 → img33): pick files →
 * crop (1:1 / 4:5) → caption → add-post (multipart Images[]).
 *
 * The filter/adjust steps of img31–img32 are not built: the backend stores the
 * raw file and has no filter field. «Добавить место» / «Добавить соавторов» from
 * img33 are absent from add-post too, so they are not faked either.
 */
export function CreatePost() {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const addPost = useAddPost();

  const [step, setStep] = useState<Step>("pick");
  const [files, setFiles] = useState<File[]>([]);
  const [index, setIndex] = useState(0);
  const [aspect, setAspect] = useState<AspectKey>("square");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areas, setAreas] = useState<Record<number, CropArea>>({});
  const [caption, setCaption] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  const current = files[index];
  const currentPreview = previews[index];

  const onPick = (picked: FileList | null) => {
    const list = Array.from(picked ?? []);
    if (list.length === 0) return;
    setFiles(list);
    setIndex(0);
    setStep("crop");
  };

  const onShare = async () => {
    // Only images are cropped; videos go up as-is.
    const prepared = await Promise.all(
      files.map(async (file, position) => {
        const area = areas[position];
        if (!area || isVideo(file.name)) return file;
        return cropImageToFile(file, area);
      }),
    );

    addPost.mutate(
      { title: "", content: caption, images: prepared },
      {
        onSuccess: () => {
          toast.success(t("published"));
          router.push(ROUTES.myProfile);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <div className="border-ig-border bg-ig-bg overflow-hidden rounded-xl border">
        <div className="border-ig-separator flex items-center justify-between border-b px-4 py-3">
          <button
            type="button"
            onClick={() => (step === "pick" ? router.back() : setCancelOpen(true))}
            className="text-ig-text text-sm"
          >
            {tCommon("cancel")}
          </button>
          <h1 className="text-ig-text text-base font-semibold">{t("createPost")}</h1>
          {step === "crop" ? (
            <button
              type="button"
              onClick={() => setStep("caption")}
              className="text-ig-primary text-sm font-semibold"
            >
              {t("next")}
            </button>
          ) : step === "caption" ? (
            <button
              type="button"
              onClick={() => void onShare()}
              disabled={addPost.isPending}
              className="text-ig-primary text-sm font-semibold disabled:opacity-50"
            >
              {addPost.isPending ? tCommon("loading") : t("share")}
            </button>
          ) : (
            <span className="w-12" />
          )}
        </div>

        {step === "pick" ? (
          <label className="flex h-[420px] cursor-pointer flex-col items-center justify-center gap-4">
            <svg
              viewBox="0 0 24 24"
              className="text-ig-text size-20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            >
              <rect x="2" y="4" width="13" height="13" rx="2" />
              <path d="M9 9.5 22 7v10l-6-2" />
            </svg>
            <p className="text-ig-text text-xl font-light">{t("dropMedia")}</p>
            <span className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white">
              {t("selectFromComputer")}
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(event) => onPick(event.target.files)}
            />
          </label>
        ) : null}

        {step === "crop" && current && currentPreview ? (
          <div>
            <div className="relative h-[420px] bg-black">
              {isVideo(current.name) ? (
                <video src={currentPreview} controls className="size-full object-contain" />
              ) : (
                <Cropper
                  image={currentPreview}
                  crop={crop}
                  zoom={zoom}
                  aspect={ASPECTS[aspect]}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_area, pixels) =>
                    setAreas((previous) => ({ ...previous, [index]: pixels }))
                  }
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex gap-2">
                {(Object.keys(ASPECTS) as AspectKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAspect(key)}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-semibold",
                      aspect === key
                        ? "bg-ig-text text-ig-bg"
                        : "bg-ig-button-secondary text-ig-text",
                    )}
                  >
                    {t(key === "square" ? "aspectSquare" : "aspectPortrait")}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                aria-label={t("zoom")}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-40"
              />

              {files.length > 1 ? (
                <div className="text-ig-text-secondary flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => setIndex((i) => i - 1)}
                    className="disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span>
                    {index + 1} / {files.length}
                  </span>
                  <button
                    type="button"
                    disabled={index === files.length - 1}
                    onClick={() => setIndex((i) => i + 1)}
                    className="disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === "caption" && currentPreview ? (
          <div className="flex flex-col md:flex-row">
            <div className="bg-black md:w-[55%]">
              {current && isVideo(current.name) ? (
                <video src={currentPreview} controls className="size-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- blob: preview, never optimised
                <img src={currentPreview} alt="" className="h-[420px] w-full object-contain" />
              )}
            </div>

            <div className="flex-1 p-4">
              <div className="mb-3 flex items-center gap-3">
                <UserAvatar src={profile?.image} size={28} />
                <span className="text-ig-text text-sm font-semibold">{profile?.userName}</span>
              </div>

              <Textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value.slice(0, CAPTION_MAX))}
                placeholder={t("captionPlaceholder")}
                rows={8}
                className="text-ig-text resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
              <p className="text-ig-text-secondary text-right text-xs">
                {caption.length}/{CAPTION_MAX}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t("discardTitle")}
        description={t("discardDescription")}
        confirmLabel={tCommon("delete")}
        onConfirm={() => router.back()}
      />
    </div>
  );
}
