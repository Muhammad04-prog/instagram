import { http } from "@/lib/axios";
import type { GetPostsParams, Post } from "@/types/post.types";

/**
 * Swagger tag: Post. Phase 4 needs only the one read endpoint that feeds the
 * profile grid; the other 11 (reels, likes, comments, add/delete…) land in
 * Phase 5, so API_MAP stays unchecked for this tag until then.
 *
 * The profile's "reels" tab is derived from these posts (the ones whose file is
 * a video) — `get-reels` cannot be filtered by user.
 */
export const postService = {
  getPosts: (params: GetPostsParams) =>
    http.get<Post[]>("/Post/get-posts", {
      UserId: params.userId,
      Title: params.title,
      Content: params.content,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    }),
};
