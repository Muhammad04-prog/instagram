import { http } from "@/lib/axios";
import type { CursorParams, Page } from "@/lib/cursor";
import type {
  ArchiveDto,
  CollaboratorActionDto,
  CommentDto,
  CommentLikeToggleDto,
  CreateCommentDto,
  DeletedDto,
  FavoriteToggleDto,
  FeedDto,
  InviteCollaboratorsDto,
  LikeToggleDto,
  PostDto,
  PostInsightsDto,
  ReportCreatedDto,
  ReportPostDto,
  ShareDto,
  ShareResultDto,
  TagActionDto,
  UpdatePostDto,
  UpdatePostPrivacyDto,
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
  /**
   * Explore — other people's posts (private accounts and blocks excluded server-side).
   *
   * Superseded by `searchService.getExplore` (`/search/explore`), which returns
   * the same posts ranked; see `useExplorePosts`. Kept because the endpoint
   * exists, but nothing calls it.
   */
  getPosts: (params: CursorParams) => http.get<Page<PostDto>>("/posts", params),

  /**
   * Superseded by `feedService.getFeed` (`GET /feed`, 19.07.2026) — same
   * params, same `FeedDto` response, same ranking. Kept typed for completeness
   * of the tag, same as `getPosts` above; nothing calls this one anymore.
   */
  getFeed: (params: CursorParams) => http.get<FeedDto>("/posts/feed", params),

  getReels: (params: CursorParams) => http.get<Page<PostDto>>("/posts/reels", params),

  getMyPosts: (params: CursorParams) => http.get<Page<PostDto>>("/posts/my", params),

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
    http.get<Page<UserBriefDto>>(`/posts/${id}/likes`, params),

  /** Counted once per user server-side — safe to fire on every impression. */
  view: (id: number) => http.post<ViewDto>(`/posts/${id}/view`),

  /** Toggle → new saved state. `collection` names a save-collection. */
  favorite: (id: number, collection?: string) =>
    http.post<FavoriteToggleDto>(`/posts/${id}/favorite`, collection ? { collection } : undefined),

  /** Share to a chat (`toUserId`), to a story (`toStory`), or as a link. */
  share: (id: number, dto: ShareDto) => http.post<ShareResultDto>(`/posts/${id}/share`, dto),

  report: (id: number, dto: ReportPostDto) =>
    http.post<ReportCreatedDto>(`/posts/${id}/report`, dto),

  getComments: (id: number, params: CursorParams) =>
    http.get<Page<CommentDto>>(`/posts/${id}/comments`, params),

  addComment: (id: number, dto: CreateCommentDto) =>
    http.post<CommentDto>(`/posts/${id}/comments`, dto),

  deleteComment: (commentId: number) => http.delete<DeletedDto>(`/posts/comments/${commentId}`),

  /** Toggle → new state + count. */
  likeComment: (commentId: number) =>
    http.post<CommentLikeToggleDto>(`/posts/comments/${commentId}/like`),

  replyToComment: (commentId: number, dto: CreateCommentDto) =>
    http.post<CommentDto>(`/posts/comments/${commentId}/reply`, dto),

  getCommentReplies: (commentId: number, params: CursorParams) =>
    http.get<Page<CommentDto>>(`/posts/comments/${commentId}/replies`, params),

  /** Only your own — `status` filters DRAFT vs SCHEDULED; omitted, both. */
  getDrafts: (params: CursorParams & { status?: "DRAFT" | "SCHEDULED" }) =>
    http.get<Page<PostDto>>("/posts/drafts", params),

  /** Publishes a draft/scheduled post immediately, dropping any scheduled job. */
  publish: (id: number) => http.put<PostDto>(`/posts/${id}/publish`),

  /** Toggle → max 3 pinned posts; server enforces the cap. */
  pin: (id: number) => http.patch<PostDto>(`/posts/${id}/pin`),

  /** Any subset of the two fields — a partial patch, not a full replacement. */
  updatePrivacy: (id: number, dto: UpdatePostPrivacyDto) =>
    http.patch<PostDto>(`/posts/${id}/privacy`, dto),

  getRemixes: (id: number, params: CursorParams) =>
    http.get<Page<PostDto>>(`/posts/${id}/remixes`, params),

  /** Author-only — 403 otherwise. */
  getInsights: (id: number) => http.get<PostInsightsDto>(`/posts/${id}/insights`),

  inviteCollaborators: (id: number, dto: InviteCollaboratorsDto) =>
    http.post<PostDto>(`/posts/${id}/collaborators`, dto),

  getPendingCollabs: (params: CursorParams) =>
    http.get<Page<PostDto>>("/posts/collabs/pending", params),

  acceptCollab: (id: number) =>
    http.post<CollaboratorActionDto>(`/posts/${id}/collaborators/accept`),

  declineCollab: (id: number) =>
    http.post<CollaboratorActionDto>(`/posts/${id}/collaborators/decline`),

  getPendingTags: (params: CursorParams) => http.get<Page<PostDto>>("/posts/tags/pending", params),

  /** Accepted tag → post shows up in "Photos of you". */
  acceptTag: (id: number) => http.post<TagActionDto>(`/posts/${id}/tag/accept`),

  /** Declined/removed tag → post stays out of "Photos of you". */
  declineTag: (id: number) => http.post<TagActionDto>(`/posts/${id}/tag/decline`),

  /** Toggle — only the post's own author may pin a comment on it. */
  pinComment: (postId: number, commentId: number) =>
    http.patch<CommentDto>(`/posts/${postId}/comments/${commentId}/pin`),
};
