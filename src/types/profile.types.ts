import type { OtherProfileDto, ProfileDto } from "@/types/api.types";

/**
 * Profile helpers.
 *
 * The DTOs are generated (`api.types.ts`). Three long-standing workarounds die
 * with this file:
 *
 * - `gender` is a symmetric enum (MALE | FEMALE | OTHER | HIDDEN). Softclub read
 *   it as "Male" but only accepted `0|1` on write, so we kept a GENDER_VALUE map
 *   to translate (bug #12). Gone — what you send is what you get back.
 * - `id` is on the profile. Softclub's `get-my-profile` omitted it and the id had
 *   to be dug out of the JWT claims.
 * - `fullName` is one field, so `profileFullName()` joining firstName/lastName
 *   is no longer needed.
 */

export type { OtherProfileDto, ProfileDto };

/** Every gender the API accepts, in the order the picker lists them. */
export const GENDERS = ["MALE", "FEMALE", "OTHER", "HIDDEN"] as const;

export type Gender = ProfileDto["gender"];

/** A profile the viewer may not be allowed to see the posts of. */
export function isLocked(profile: OtherProfileDto): boolean {
  return !profile.canViewContent;
}
