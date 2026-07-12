import { http } from "@/lib/axios";
import type {
  AddCommentDto,
  AddPostDto,
  AddPostFavoriteDto,
  GetFollowingPostsParams,
  GetPagedParams,
  GetPostsParams,
  Post,
  Reel,
} from "@/types/post.types";

/**
 * Swagger tag: Post (12 endpoints), all verified against the live API.
 *
 * ⚠️ `like-post` and `add-post-favorite` are TOGGLES: the returned boolean is the
 * NEW state (true = liked/saved, false = un-liked/un-saved), not "success".
 * ⚠️ `get-my-posts` answers a bare array — no `{ data, errors, statusCode }`
 * envelope — which the axios interceptor passes through untouched.
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

  getReels: (params: GetPagedParams) =>
    http.get<Reel[]>("/Post/get-reels", {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    }),

  getPostById: (id: number) => http.get<Post>("/Post/get-post-by-id", { id }),

  getMyPosts: () => http.get<Post[]>("/Post/get-my-posts"),

  getFollowingPosts: (params: GetFollowingPostsParams) =>
    http.get<Post[]>("/Post/get-following-post", {
      UserId: params.userId,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    }),

  /** multipart: Title, Content, Images[] (no location field exists). Returns the new postId. */
  addPost: (dto: AddPostDto) => {
    const form = new FormData();
    form.append("Title", dto.title);
    form.append("Content", dto.content);
    dto.images.forEach((file) => form.append("Images", file));
    return http.post<number>("/Post/add-post", form);
  },

  deletePost: (id: number) => http.delete<boolean>("/Post/delete-post", { id }),

  /** Toggle — resolves to the new like state. */
  likePost: (postId: number) => http.post<boolean>("/Post/like-post", undefined, { postId }),

  viewPost: (postId: number) => http.post<boolean>("/Post/view-post", undefined, { postId }),

  addComment: (dto: AddCommentDto) => http.post<boolean>("/Post/add-comment", dto),

  deleteComment: (commentId: number) => http.delete<boolean>("/Post/delete-comment", { commentId }),

  /** Toggle — resolves to the new saved state. */
  addPostFavorite: (dto: AddPostFavoriteDto) => http.post<boolean>("/Post/add-post-favorite", dto),
};
