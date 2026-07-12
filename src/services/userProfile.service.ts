import { http } from "@/lib/axios";
import type { UserProfile } from "@/types/profile.types";

/** Swagger tag: UserProfile. The remaining endpoints land in Phase 4. */
export const userProfileService = {
  getMyProfile: () => http.get<UserProfile>("/UserProfile/get-my-profile"),
};
