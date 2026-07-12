import { http } from "@/lib/axios";
import type { GetPagedParams, Post } from "@/types/post.types";
import type { FollowableUserProfile, UpdateProfileDto, UserProfile } from "@/types/profile.types";

/** Swagger tag: UserProfile (7 endpoints). */
export const userProfileService = {
  getMyProfile: () => http.get<UserProfile>("/UserProfile/get-my-profile"),

  getProfileById: (id: string) =>
    http.get<UserProfile>("/UserProfile/get-user-profile-by-id", { id }),

  /** Answers the whole profile + `isSubscriber`, not a bare boolean. */
  getIsFollowProfile: (followingUserId: string) =>
    http.get<FollowableUserProfile>("/UserProfile/get-is-follow-user-profile-by-id", {
      followingUserId,
    }),

  updateProfile: (dto: UpdateProfileDto) =>
    http.put<string>("/UserProfile/update-user-profile", dto),

  updateImage: (file: File) => {
    const form = new FormData();
    form.append("imageFile", file);
    return http.put<string>("/UserProfile/update-user-image-profile", form);
  },

  deleteImage: () => http.delete<string>("/UserProfile/delete-user-image-profile"),

  getFavorites: (params: GetPagedParams) =>
    http.get<Post[]>("/UserProfile/get-post-favorites", {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    }),
};
