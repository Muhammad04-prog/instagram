"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useAnswerTag, usePendingTags } from "@/hooks/usePosts";
import { getImageUrl } from "@/lib/utils";
import { gridCoverUrl } from "@/types/post.types";
import { flattenPages } from "@/lib/cursor";
import type { PostDto } from "@/types/api.types";

/**
 * Settings → Tags and mentions → Review tags — `GET /posts/tags/pending` +
 * `POST /posts/{id}/tag/accept|decline`. Accepting puts the post in "Photos
 * of You"; declining hides the tag there for good.
 */
export function TagReviewList() {
  const t = useTranslations("settings");
  const tPost = useTranslations("post");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePendingTags();

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const posts = flattenPages(data);

  return (
    <div className="max-w-[640px] space-y-4">
      <h2 className="text-ig-text text-lg font-bold">{tPost("tagReviewTitle")}</h2>

      {posts.length === 0 ? (
        <p className="text-ig-text-secondary py-10 text-center text-sm">
          {tPost("tagReviewEmpty")}
        </p>
      ) : (
        <>
          <ul className="space-y-1">
            {posts.map((post) => (
              <TagReviewRow key={post.id} post={post} />
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

function TagReviewRow({ post }: { post: PostDto }) {
  const t = useTranslations("post");
  const answer = useAnswerTag();
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
        <p className="text-ig-text truncate text-sm font-semibold">{post.author.userName}</p>
        {post.caption ? (
          <p className="text-ig-text-secondary truncate text-sm">{post.caption}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => answer.mutate({ postId: post.id, accept: true })}
          disabled={answer.isPending}
          className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("acceptTag")}
        </button>
        <button
          type="button"
          onClick={() => answer.mutate({ postId: post.id, accept: false })}
          disabled={answer.isPending}
          className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
        >
          {t("declineTag")}
        </button>
      </div>
    </li>
  );
}
