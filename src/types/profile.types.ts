/**
 * Shape confirmed against the live API (GET /UserProfile/get-my-profile).
 * Note: it carries NO id — the current user's id comes from the JWT claims
 * (SessionUser.userId). Gender is a string ("Male" | "Female"), not the 0|1
 * enum ТЗ §3.7 describes.
 */
export type Gender = "Male" | "Female";

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

export interface UpdateProfileDto {
  about: string;
  gender: Gender;
}

export interface Subscriber {
  userId: string;
  userName: string;
  fullName: string | null;
  userImage: string | null;
  isFollowing?: boolean;
}

/** Convenience: the profile has firstName/lastName, the UI wants one string. */
export function profileFullName(profile: UserProfile): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
}
