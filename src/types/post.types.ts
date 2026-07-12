/**
 * Shapes confirmed against the live API (GET /Post/get-posts, /Post/get-reels,
 * /UserProfile/get-post-favorites) — see docs/API_REAL_DTO.md.
 *
 * ⚠️ `images` is a flat array of file names, not objects, and an entry may be a
 * video (".mp4"). ТЗ's `PostImage[]` / `postViewCount` / `postFavoriteCount` do
 * not exist; the real counter is `postView`.
 */
export interface Comment {
  postCommentId: number;
  userId: string;
  userName: string;
  userImage: string | null;
  comment: string;
  dateCommented: string;
}

export interface Post {
  postId: number;
  userId: string;
  userName: string | null;
  userImage: string | null;
  title: string | null;
  content: string | null;
  images: string[];
  datePublished: string;
  postLike: boolean;
  postLikeCount: number;
  postFavorite: boolean;
  postView: number;
  commentCount: number;
  comments?: Comment[];
}

/** get-reels returns a single file name in `images`, plus the author's follow state. */
export interface Reel extends Omit<Post, "images"> {
  images: string;
  isSubscriber: boolean;
}

export interface GetPostsParams {
  userId?: string;
  title?: string;
  content?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetFollowingPostsParams {
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetPagedParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface AddPostDto {
  title: string;
  content: string;
  images: File[];
}

export interface AddCommentDto {
  postId: number;
  comment: string;
}

export interface AddPostFavoriteDto {
  postId: number;
}

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];

/** The API mixes photos and videos in the same `images` array. */
export function isVideo(fileName: string): boolean {
  return VIDEO_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));
}
