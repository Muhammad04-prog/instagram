import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type {
  ArchiveDto,
  CommentDto,
  CommentLikeToggleDto,
  CreateCommentDto,
  DeletedDto,
  FavoriteToggleDto,
  LikeToggleDto,
  PostDto,
  ReportPostDto,
  ShareDto,
  ShareResultDto,
  UpdatePostDto,
  UserBriefDto,
  ViewDto,
} from "@/types/api.types";

/** What `POST /posts` accepts — multipart, up to 10 photos AND videos mixed. */
export interface CreatePostInput {
  media: File[];
  caption?: string;
  locationId?: number;
  musicId?: number;
  /** Comma-joined uuids on the wire. */
  taggedUserIds?: string[];
  /** Comma-joined filter names. */
  filters?: string[];
  isReel?: boolean;
}

/**
 * Swagger tag: posts (22 endpoints).
 *
 * Toggles (`like`, `favorite`, comment `like`, `archive`) answer with the NEW
 * state *plus a fresh counter* — e.g. `{ liked, likesCount }` — so optimistic UI
 * reconciles against the server instead of guessing, as it had to on softclub.
 *
 * Every list is cursor-paginated and answers a bare array; see `lib/cursor.ts`.
 */
export const postService = {
  /** Explore — other people's posts (private accounts and blocks excluded server-side). */
  getPosts: (params: CursorParams) => http.get<PostDto[]>("/posts", params),

  getFeed: (params: CursorParams) => http.get<PostDto[]>("/posts/feed", params),

  getReels: (params: CursorParams) => http.get<PostDto[]>("/posts/reels", params),

  getMyPosts: (params: CursorParams) => http.get<PostDto[]>("/posts/my", params),

  getPostById: (id: number) => http.get<PostDto>(`/posts/${id}`),

  create: (input: CreatePostInput) => {
    const form = new FormData();
    input.media.forEach((file) => form.append("media", file));

    if (input.caption) form.append("caption", input.caption);
    if (input.locationId !== undefined) form.append("locationId", String(input.locationId));
    if (input.musicId !== undefined) form.append("musicId", String(input.musicId));
    if (input.taggedUserIds?.length) form.append("taggedUserIds", input.taggedUserIds.join(","));
    if (input.filters?.length) form.append("filters", input.filters.join(","));
    if (input.isReel !== undefined) form.append("isReel", String(input.isReel));

    return http.post<PostDto>("/posts", form);
  },

  /** Caption only — hashtags are re-parsed server-side from the new text. */
  update: (id: number, dto: UpdatePostDto) => http.put<PostDto>(`/posts/${id}`, dto),

  remove: (id: number) => http.delete<DeletedDto>(`/posts/${id}`),

  archive: (id: number) => http.post<ArchiveDto>(`/posts/${id}/archive`),

  unarchive: (id: number) => http.delete<ArchiveDto>(`/posts/${id}/archive`),

  /** Toggle → `{ liked, likesCount }`. */
  like: (id: number) => http.post<LikeToggleDto>(`/posts/${id}/like`),

  getLikes: (id: number, params: CursorParams) =>
    http.get<UserBriefDto[]>(`/posts/${id}/likes`, params),

  /** Counted once per user server-side — safe to fire on every impression. */
  view: (id: number) => http.post<ViewDto>(`/posts/${id}/view`),

  /** Toggle → new saved state. `collection` names a save-collection. */
  favorite: (id: number, collection?: string) =>
    http.post<FavoriteToggleDto>(`/posts/${id}/favorite`, collection ? { collection } : undefined),

  /** Share to a chat (`toUserId`), to a story (`toStory`), or as a link. */
  share: (id: number, dto: ShareDto) => http.post<ShareResultDto>(`/posts/${id}/share`, dto),

  report: (id: number, dto: ReportPostDto) => http.post(`/posts/${id}/report`, dto),

  getComments: (id: number, params: CursorParams) =>
    http.get<CommentDto[]>(`/posts/${id}/comments`, params),

  addComment: (id: number, dto: CreateCommentDto) =>
    http.post<CommentDto>(`/posts/${id}/comments`, dto),

  deleteComment: (commentId: number) => http.delete<DeletedDto>(`/posts/comments/${commentId}`),

  /** Toggle → new state + count. */
  likeComment: (commentId: number) =>
    http.post<CommentLikeToggleDto>(`/posts/comments/${commentId}/like`),

  replyToComment: (commentId: number, dto: CreateCommentDto) =>
    http.post<CommentDto>(`/posts/comments/${commentId}/reply`, dto),

  getCommentReplies: (commentId: number, params: CursorParams) =>
    http.get<CommentDto[]>(`/posts/comments/${commentId}/replies`, params),
};
