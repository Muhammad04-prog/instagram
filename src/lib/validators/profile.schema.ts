import { z } from "zod";
import type { Translator } from "@/lib/validators/auth.schema";

/** "О себе" is capped at 150 characters — the counter in docs/screenshots/img43. */
export const ABOUT_MAX_LENGTH = 150;

/**
 * The whole of img43 / img44 is fillable now.
 *
 * Softclub's `update-user-profile` accepted **only** `about` + `gender`, so
 * Phase 4 could not offer "Website" or occupation and said so rather than fake
 * them. `UpdateProfileDto` here takes fullName, website, occupation, dob,
 * locationId and the three profile toggles.
 *
 * `occupation` is dropped from this form — real (non-business) Instagram
 * accounts don't expose it. `dob` and `gender` moved to their own
 * "Personal information" page/schema below, mirroring how real IG nests them
 * under Accounts Center rather than the main Edit Profile screen.
 */
export const editProfileSchema = (t: Translator) =>
  z.object({
    fullName: z
      .string()
      .min(1, t("required"))
      .max(100, t("maxLength", { count: 100 })),
    about: z.string().max(ABOUT_MAX_LENGTH, t("maxLength", { count: ABOUT_MAX_LENGTH })),
    // A bare domain ("example.com") is what people type; don't reject it.
    website: z
      .string()
      .max(200, t("maxLength", { count: 200 }))
      .optional()
      .or(z.literal("")),
    showThreadsBadge: z.boolean(),
    isAiAuthor: z.boolean(),
    showAccountSuggestions: z.boolean(),
  });

export type EditProfileValues = z.infer<ReturnType<typeof editProfileSchema>>;

/** "Personal information" — just dob + gender, split out of the main Edit Profile form. */
export const personalInfoSchema = (t: Translator) =>
  z.object({
    gender: z.enum(["MALE", "FEMALE", "OTHER", "HIDDEN"]),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, t("dob"))
      .optional()
      .or(z.literal("")),
  });

export type PersonalInfoValues = z.infer<ReturnType<typeof personalInfoSchema>>;
