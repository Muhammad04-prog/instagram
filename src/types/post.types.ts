import type { PostDto, PostMediaDto } from "@/types/api.types";

/**
 * Post helpers.
 *
 * The DTO itself is generated (`api.types.ts`) — this file only holds the small
 * bits of derived knowledge the UI keeps asking for.
 *
 * Media is typed data now: `media: [{ url, type: IMAGE | VIDEO, width, height,
 * duration, thumbUrl, filter }]`. Softclub sent `images: string[]` and we had to
 * guess "is this a video?" from the file extension — hence the old `isVideo()`.
 */

export type { PostDto, PostMediaDto };

export function isVideo(media: PostMediaDto): boolean {
  return media.type === "VIDEO";
}

/**
 * The same question for a file that has not been uploaded yet (the create-post
 * stepper), where the browser's own MIME type is the authority — no extension
 * sniffing needed.
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * A poster frame for a video tile.
 *
 * The backend generates `thumbUrl`; when it hasn't (older rows), fall back to
 * the `#t=0.1` fragment trick so the browser paints the first frame instead of
 * a black rectangle — the same fix Phase 7 needed for the reels grid.
 */
export function mediaPoster(media: PostMediaDto): string {
  if (media.type !== "VIDEO") return media.url;
  return media.thumbUrl ?? `${media.url}#t=0.1`;
}

/** The tile a grid shows for a post: its first slide. */
export function coverMedia(post: PostDto): PostMediaDto | undefined {
  return post.media[0];
}

/** `true` when the post is a carousel — drives the stacked-squares badge. */
export function isCarousel(post: PostDto): boolean {
  return post.media.length > 1;
}
