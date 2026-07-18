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

/**
 * A grid tile can arrive in one of two real shapes:
 *  - a full `PostDto` with `media: [...]` (feed, explore, search)
 *  - a lighter summary with `coverUrl` and no `media[]` (profile posts/reels/
 *    tagged, favorites, reposts). Swagger types every list as `PostDto`, but the
 *    live API answers the profile grids with the summary — the mismatch used to
 *    crash `coverMedia` (`post.media[0]` on `undefined`) the moment a profile had
 *    a post. So the helpers below read whichever shape is present.
 */
export interface PostGridSummary {
  id: number;
  caption?: string | null;
  isReel?: boolean;
  coverUrl?: string | null;
  likesCount: number;
  commentsCount: number;
}

export type GridPost = PostDto | PostGridSummary;

function gridMedia(post: GridPost): PostMediaDto[] | undefined {
  return (post as PostDto).media;
}

/** The tile a grid shows for a post: its first slide (full DTO) if present. */
export function coverMedia(post: GridPost): PostMediaDto | undefined {
  return gridMedia(post)?.[0];
}

/** Resolved cover image/video URL for a grid tile, from either shape. */
export function gridCoverUrl(post: GridPost): string | null {
  const cover = coverMedia(post);
  if (cover) return mediaPoster(cover);
  return (post as PostGridSummary).coverUrl ?? null;
}

/** `true` when the tile should render a `<video>` element (real video media). */
export function gridHasVideo(post: GridPost): boolean {
  const cover = coverMedia(post);
  return Boolean(cover && isVideo(cover));
}

/** `true` when the clip badge belongs on the tile (video media or a reel). */
export function gridIsClip(post: GridPost): boolean {
  return gridHasVideo(post) || Boolean((post as PostGridSummary).isReel);
}

/** `true` when the post is a carousel — drives the stacked-squares badge. */
export function isCarousel(post: GridPost): boolean {
  return (gridMedia(post)?.length ?? 0) > 1;
}
