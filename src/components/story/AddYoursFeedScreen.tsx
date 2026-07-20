"use client";

import { ChevronLeft, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAddYoursFeed } from "@/hooks/useStories";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import type { StoryDto } from "@/types/api.types";

/**
 * "Add Yours" chain: the prompt + every story that answered it.
 *
 * `GET /stories/add-yours/{promptId}` — new in the 19.07.2026 swagger refresh.
 * No screenshot exists for this; the layout follows `StoryArchiveScreen`'s
 * grid-of-tiles pattern since both answer the same shape of question ("here
 * are some stories, open one").
 */
export function AddYoursFeedScreen({ promptId }: { promptId: string }) {
  const t = useTranslations("story");
  const sentinel = useRef<HTMLDivElement>(null);
  const [openStory, setOpenStory] = useState<StoryDto | null>(null);

  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAddYoursFeed(promptId);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const prompt = data?.pages[0]?.prompt;
  const stories = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="mx-auto max-w-[935px] px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <Link href={ROUTES.home} aria-label={t("back")}>
          <ChevronLeft className="text-ig-text size-6" />
        </Link>
        <h1 className="text-ig-text text-xl font-semibold">{t("addYoursFeedTitle")}</h1>
      </header>

      {isPending ? (
        <Loader className="py-10" />
      ) : isError || !prompt ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <span className="bg-ig-button-secondary flex size-14 shrink-0 items-center justify-center rounded-full text-2xl">
              {prompt.emoji ?? "✨"}
            </span>
            <div className="min-w-0">
              <p className="text-ig-text font-semibold break-words">{prompt.text}</p>
              <p className="text-ig-text-secondary text-sm">
                {t("addYoursResponses", { count: prompt.responsesCount })}
              </p>
            </div>
          </div>

          {stories.length === 0 ? (
            <EmptyState title={t("addYoursEmpty")} />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stories.map((story) => (
                  <li key={story.id}>
                    <button
                      type="button"
                      onClick={() => setOpenStory(story)}
                      className="bg-ig-bg-secondary relative block aspect-[9/16] w-full overflow-hidden rounded-md"
                    >
                      <Image
                        src={getImageUrl(story.thumbUrl ?? story.mediaUrl) ?? ""}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 220px"
                        className="object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>

              <div ref={sentinel} className="h-10" />
              {isFetchingNextPage ? <Loader /> : null}
            </>
          )}
        </>
      )}

      {openStory ? (
        <ResponseStoryDialog story={openStory} onClose={() => setOpenStory(null)} />
      ) : null}
    </div>
  );
}

/**
 * View-only — unlike the archive grid, these stories mostly belong to other
 * people. `StoryDto` carries no author field (the rail/viewer group by userId
 * instead), so the title is the date, same as `ArchivedStoryDialog`.
 */
function ResponseStoryDialog({ story, onClose }: { story: StoryDto; onClose: () => void }) {
  const tCommon = useTranslations("common");
  const format = useFormatter();

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[420px] max-w-[95vw] gap-0 overflow-hidden rounded-lg border-0 bg-black p-0"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DialogTitle className="text-sm font-semibold text-white">
            {format.dateTime(new Date(story.createdAt), { dateStyle: "long" })}
          </DialogTitle>
          <button
            type="button"
            aria-label={tCommon("close")}
            onClick={onClose}
            className="text-white/90 hover:text-white"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="relative h-[70vh]">
          {story.mediaType === "VIDEO" ? (
            <video
              src={getImageUrl(story.mediaUrl) ?? ""}
              poster={story.thumbUrl ?? undefined}
              controls
              playsInline
              className="size-full object-contain"
            />
          ) : (
            <Image
              src={getImageUrl(story.mediaUrl) ?? ""}
              alt=""
              fill
              sizes="420px"
              className="object-contain"
              priority
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
