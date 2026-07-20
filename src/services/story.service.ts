import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type {
  AddYoursFeedDto,
  AddYoursPromptDto,
  AnswerResultDto,
  AnswerStickerDto,
  CreateAddYoursDto,
  CreateStickerDto,
  DeletedDto,
  ReactionDto,
  ReactionSentDto,
  StickerDto,
  StickerResultsDto,
  StoryDto,
  StoryInsightsDto,
  StoryLikeToggleDto,
  StoryRailItemDto,
  StoryReplyDto,
  StoryViewerDto,
  ViewDto,
} from "@/types/api.types";

/** `POST /stories` — multipart, up to 10 files → up to 10 separate stories. */
export interface CreateStoriesInput {
  media: File[];
  musicId?: number;
  /** Where the track starts, in seconds. */
  musicStartSec?: number;
  /** Restricts the story to the close-friends list (green ring). */
  closeFriendsOnly?: boolean;
  /** Re-shares an existing post into a story. */
  fromPostId?: number;
  filter?: string;
  /** Stickers/text placed on the story, stored as JSON by the backend. */
  overlays?: unknown;
}

/**
 * Swagger tag: stories (12 endpoints).
 *
 * `isViewed` now comes from the server, so the seen/unseen ring is finally
 * truthful across devices — the localStorage workaround from Phase 6
 * (`store/story.store.ts`) exists only because softclub could not answer
 * "have I seen this?" and is deleted with this migration.
 *
 * `viewers` is a real list of people (who watched, who liked, which reaction),
 * not the two bare counters softclub returned.
 */
export const storyService = {
  /** The rail, grouped by author. */
  getRail: () => http.get<StoryRailItemDto[]>("/stories"),

  getMyStories: () => http.get<StoryDto[]>("/stories/my"),

  /** Expired stories — the archive screen (img45). */
  getArchive: (params: CursorParams) => http.get<StoryDto[]>("/stories/archive", params),

  getUserStories: (userId: string) => http.get<StoryDto[]>(`/stories/user/${userId}`),

  getStoryById: (id: number) => http.get<StoryDto>(`/stories/${id}`),

  create: (input: CreateStoriesInput) => {
    const form = new FormData();
    input.media.forEach((file) => form.append("media", file));

    if (input.musicId !== undefined) form.append("musicId", String(input.musicId));
    if (input.musicStartSec !== undefined) {
      form.append("musicStartSec", String(input.musicStartSec));
    }
    if (input.closeFriendsOnly !== undefined) {
      form.append("closeFriendsOnly", String(input.closeFriendsOnly));
    }
    if (input.fromPostId !== undefined) form.append("fromPostId", String(input.fromPostId));
    if (input.filter) form.append("filter", input.filter);
    if (input.overlays !== undefined) form.append("overlays", JSON.stringify(input.overlays));

    return http.post<StoryDto[]>("/stories", form);
  },

  remove: (id: number) => http.delete<DeletedDto>(`/stories/${id}`),

  /** Counted once per viewer server-side. */
  view: (id: number) => http.post<ViewDto>(`/stories/${id}/view`),

  /** Toggle → `{ liked, likesCount }`. */
  like: (id: number) => http.post<StoryLikeToggleDto>(`/stories/${id}/like`),

  /** An emoji reaction — lands in the author's chat. Repeatable. */
  react: (id: number, dto: ReactionDto) =>
    http.post<ReactionSentDto>(`/stories/${id}/reaction`, dto),

  /** A written reply — also lands in the author's chat. */
  reply: (id: number, dto: StoryReplyDto) =>
    http.post<ReactionSentDto>(`/stories/${id}/reply`, dto),

  /** Author-only. */
  getViewers: (id: number, params: CursorParams) =>
    http.get<StoryViewerDto[]>(`/stories/${id}/viewers`, params),

  /** Author-only — views/likes/reactions/replies + engagement rate. */
  getInsights: (id: number) => http.get<StoryInsightsDto>(`/stories/${id}/insights`),

  /** Turns an existing story into the first link of an "Add Yours" chain. */
  createAddYours: (id: number, dto: CreateAddYoursDto) =>
    http.post<AddYoursPromptDto>(`/stories/${id}/add-yours`, dto),

  /** The prompt + every response story so far (author's response first). */
  getAddYoursFeed: (promptId: string, params: CursorParams) =>
    http.get<AddYoursFeedDto>(`/stories/add-yours/${promptId}`, params),

  /** Add an interactive sticker (POLL/QUIZ/QUESTION/SLIDER/COUNTDOWN/LINK) to my own story. */
  createSticker: (storyId: number, dto: CreateStickerDto) =>
    http.post<StickerDto>(`/stories/${storyId}/stickers`, dto),

  /** A viewer's own answer, if any, comes back as `myAnswer`; QUIZ hides `correctIndex` until answered. */
  getStickers: (storyId: number) => http.get<StickerDto[]>(`/stories/${storyId}/stickers`),

  /** Answering again replaces the previous answer. */
  answerSticker: (storyId: number, stickerId: string, dto: AnswerStickerDto) =>
    http.post<AnswerResultDto>(`/stories/${storyId}/stickers/${stickerId}/answer`, dto),

  /** Author-only tally. */
  getStickerResults: (storyId: number, stickerId: string) =>
    http.get<StickerResultsDto>(`/stories/${storyId}/stickers/${stickerId}/results`),
};
