/**
 * Shapes from the live API (docs/API_REAL_DTO.md), which differs from Swagger:
 * the rail's items carry `liked` / `likedCount` and no `viewerDto`, while
 * `GetStoryById` is the only place `viewerDto` (aggregate counters) shows up.
 */

/** Aggregate counters of a story, NOT a list of viewers — the API has no such list. */
export interface StoryViewer {
  userName: string;
  name: string | null;
  viewCount: number | null;
  viewLike: number | null;
}

/** Item of get-stories / get-user-stories / get-my-stories. */
export interface Story {
  id: number;
  fileName: string;
  postId: number | null;
  createAt: string;
  liked: boolean;
  likedCount: number;
}

/** Single story from GetStoryById — a different shape than the list item. */
export interface StoryDetail {
  id: number;
  fileName: string;
  postId: number | null;
  createAt: string;
  userId: string;
  userAvatar: string | null;
  viewerDto: StoryViewer | null;
}

/** get-stories groups stories by author — one bubble per user in the rail. */
export interface UserStories {
  userId: string;
  userName: string;
  userImage: string | null;
  stories: Story[];
}

export interface AddStoryDto {
  image: File;
  /** Optional — "share a post to your story". */
  postId?: number;
}
