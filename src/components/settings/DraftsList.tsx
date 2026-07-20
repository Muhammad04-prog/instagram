"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useDrafts, usePublishPost } from "@/hooks/usePosts";
import { getImageUrl } from "@/lib/utils";
import { gridCoverUrl } from "@/types/post.types";
import { flattenPages } from "@/lib/cursor";
import type { PostDto } from "@/types/api.types";

/**
 * Settings → Drafts — `GET /posts/drafts` + `PUT /posts/{id}/publish`.
 *
 * ⚠️ Always empty today, and honestly so: `POST /posts` (create) has no
 * `status`/`scheduledAt` field in its request body, so nothing in the
 * documented API can ever put a post into DRAFT or SCHEDULED in the first
 * place. This screen is the read/publish half of a feature the backend
 * hasn't finished the write half of — see `docs/BACKEND_REQUEST.md`.
 */
export function DraftsList() {
  const t = useTranslations("post");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useDrafts();

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const drafts = flattenPages(data);

  return (
    <div className="max-w-[640px] space-y-4">
      <h2 className="text-ig-text text-lg font-bold">{t("draftsTitle")}</h2>

      {drafts.length === 0 ? (
        <p className="text-ig-text-secondary py-10 text-center text-sm">{t("draftsEmpty")}</p>
      ) : (
        <>
          <ul className="space-y-1">
            {drafts.map((post) => (
              <DraftRow key={post.id} post={post} />
            ))}
          </ul>

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-ig-primary text-sm font-semibold disabled:opacity-50"
            >
              {t("loadMore")}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

function DraftRow({ post }: { post: PostDto }) {
  const t = useTranslations("post");
  const publish = usePublishPost();
  const rawUrl = gridCoverUrl(post);
  const url = rawUrl ? getImageUrl(rawUrl) : null;

  return (
    <li className="flex items-center gap-3 py-2">
      <span className="bg-ig-button-secondary relative size-11 shrink-0 overflow-hidden rounded-lg">
        {url ? (
          <Image
            src={url}
            alt={post.caption ?? ""}
            fill
            sizes="44px"
            style={{ objectFit: "cover" }}
          />
        ) : null}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-ig-text truncate text-sm">{post.caption || "—"}</p>
        <p className="text-ig-text-secondary text-xs">
          {post.status === "SCHEDULED" ? t("draftStatusScheduled") : t("draftStatusDraft")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => publish.mutate(post.id, { onSuccess: () => toast.success(t("published")) })}
        disabled={publish.isPending}
        className="bg-ig-primary hover:bg-ig-primary-hover shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {t("publishNow")}
      </button>
    </li>
  );
}
