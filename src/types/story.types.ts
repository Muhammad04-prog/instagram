export interface StoryViewer {
  userName: string;
  name: string | null;
  viewCount: number;
  viewLike: number;
}

export interface Story {
  id: number;
  fileName: string;
  postId: number | null;
  createAt: string;
  userId: string;
  userAvatar: string | null;
  viewerDto: StoryViewer | null;
}

/** /Story/get-stories groups stories by author for the avatar rail. */
export interface UserStories {
  userId: string;
  userName: string;
  userImage: string | null;
  stories: Story[];
  isViewed?: boolean;
}

export interface AddStoryDto {
  image: File;
  postId?: number;
}
