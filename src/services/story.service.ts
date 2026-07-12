import { http } from "@/lib/axios";
import type { AddStoryDto, StoryDetail, UserStories } from "@/types/story.types";

/**
 * Swagger tag: Story (8 endpoints), all checked against the live API.
 *
 * ⚠️ `get-stories` answers a BARE ARRAY grouped by author (no envelope, and not
 * the flat GetStoryDto[] Swagger promises). `LikeStory` is a toggle that answers
 * the string "Liked" / "Disliked". Nothing in the API says whether *I* have seen
 * a story — the seen ring is tracked client-side (store/story.store.ts).
 */
export const storyService = {
  getStories: () => http.get<UserStories[]>("/Story/get-stories"),

  getUserStories: (userId: string) => http.get<UserStories>(`/Story/get-user-stories/${userId}`),

  getMyStories: () => http.get<UserStories>("/Story/get-my-stories"),

  getStoryById: (id: number) => http.get<StoryDetail>("/Story/GetStoryById", { id }),

  addStory: (dto: AddStoryDto) => {
    const form = new FormData();
    form.append("Image", dto.image);
    return http.post<string>("/Story/AddStories", form, { PostId: dto.postId });
  },

  /** Toggle — resolves to "Liked" or "Disliked". */
  likeStory: (storyId: number) => http.post<string>("/Story/LikeStory", undefined, { storyId }),

  addStoryView: (storyId: number) =>
    http.post<unknown>("/Story/add-story-view", undefined, { StoryId: storyId }),

  deleteStory: (id: number) => http.delete<boolean>("/Story/DeleteStory", { id }),
};
