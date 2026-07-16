import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type {
  ActivityItemDto,
  AvatarDto,
  IsFollowingDto,
  MusicDto,
  OtherProfileDto,
  PostDto,
  ProfileDto,
  UpdatePrivacyDto,
  UpdateProfileDto,
} from "@/types/api.types";

/**
 * Swagger tag: profile (14 endpoints).
 *
 * `gender` is a symmetric enum now (MALE | FEMALE | OTHER | HIDDEN) — read and
 * write agree, unlike softclub where it read as "Male" but only accepted 0|1.
 *
 * The tabs of a profile each have their own endpoint, and a private account
 * answers 403 on posts/reels/tagged rather than an empty list — that 403 is the
 * "Account is private" screen, not an error to swallow.
 */
export const profileService = {
  getMyProfile: () => http.get<ProfileDto>("/profile/me"),

  getProfileById: (userId: string) => http.get<OtherProfileDto>(`/profile/${userId}`),

  update: (dto: UpdateProfileDto) => http.put<ProfileDto>("/profile", dto),

  setPrivacy: (dto: UpdatePrivacyDto) => http.put<ProfileDto>("/profile/privacy", dto),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http.put<AvatarDto>("/profile/avatar", form);
  },

  deleteAvatar: () => http.delete<AvatarDto>("/profile/avatar"),

  isFollowing: (userId: string) => http.get<IsFollowingDto>(`/profile/${userId}/is-following`),

  getUserPosts: (userId: string, params: CursorParams) =>
    http.get<PostDto[]>(`/profile/${userId}/posts`, params),

  getUserReels: (userId: string, params: CursorParams) =>
    http.get<PostDto[]>(`/profile/${userId}/reels`, params),

  getUserTagged: (userId: string, params: CursorParams) =>
    http.get<PostDto[]>(`/profile/${userId}/tagged`, params),

  /** Saved posts — only ever your own. */
  getFavorites: (params: CursorParams) => http.get<PostDto[]>("/profile/favorites", params),

  getMyReposts: (params: CursorParams) => http.get<PostDto[]>("/profile/me/reposts", params),

  getSavedMusic: (params: CursorParams) => http.get<MusicDto[]>("/profile/me/saved-music", params),

  /** "Your activity". */
  getMyActivity: (params: CursorParams) =>
    http.get<ActivityItemDto[]>("/profile/me/activity", params),
};
