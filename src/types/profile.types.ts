/**
 * Shapes confirmed against the live API, not Swagger (see docs/API_REAL_DTO.md).
 *
 * `get-my-profile` carries NO id — the current user's id comes from the JWT
 * claims (SessionUser.userId). Gender is READ as a string ("Male" | "Female")
 * but WRITTEN as the enum ordinal (0 = Female, 1 = Male); sending the string
 * to update-user-profile answers 400.
 */
export type Gender = "Male" | "Female";

/** Wire values of Domain.Enums.Gender — verified by round-tripping the API. */
export const GENDER_VALUE: Record<Gender, 0 | 1> = { Female: 0, Male: 1 };

export interface UserProfile {
  userName: string;
  image: string | null;
  firstName: string | null;
  lastName: string | null;
  about: string | null;
  occupation: string | null;
  gender: Gender | null;
  dob: string | null;
  locationId: number | null;
  postCount: number;
  subscribersCount: number;
  subscriptionsCount: number;
  dateUpdated: string;
}

/**
 * `get-is-follow-user-profile-by-id` does not answer a bare boolean: it returns
 * the whole profile plus `isSubscriber`, so a single call feeds both the header
 * and the follow button.
 */
export interface FollowableUserProfile extends UserProfile {
  isSubscriber: boolean;
}

/** PUT /UserProfile/update-user-profile — the API accepts these two fields only. */
export interface UpdateProfileDto {
  about: string;
  gender: 0 | 1;
}

/** Item of get-subscribers / get-subscriptions. Note the lowercase `fullname`. */
export interface UserShortInfo {
  userId: string;
  userName: string;
  userPhoto: string | null;
  fullname: string | null;
}

export interface FollowRelation {
  id: number;
  userShortInfo: UserShortInfo;
}

/** Convenience: the profile has firstName/lastName, the UI wants one string. */
export function profileFullName(profile: UserProfile): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
}
