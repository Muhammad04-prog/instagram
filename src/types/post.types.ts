export interface PostImage {
  id: number;
  imageName: string;
}

export interface Comment {
  postCommentId: number;
  postId: number;
  userId: string;
  userName: string;
  userImage: string | null;
  comment: string;
  dateCommented: string;
  commentLikeCount?: number;
}

export interface Post {
  postId: number;
  title: string | null;
  content: string | null;
  userId: string;
  userName: string;
  userImage: string | null;
  userPhoto?: string | null;
  images: PostImage[];
  postLikeCount: number;
  commentCount: number;
  postViewCount: number;
  postFavoriteCount?: number;
  datePublished: string;
  postLike: boolean;
  postFavorite: boolean;
  comments?: Comment[];
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
