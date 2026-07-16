import { z } from "zod";
import type { Translator } from "@/lib/validators/auth.schema";

/** "О себе" is capped at 150 characters — the counter in docs/screenshots/img43. */
export const ABOUT_MAX_LENGTH = 150;

/**
 * `update-user-profile` used to accept only `about` + `gender`. This backend
 * takes the whole profile, so the form can finally offer "Website" and the rest
 * of img43/img44 — wiring those fields in is Phase 13.
 */
export const editProfileSchema = (t: Translator) =>
  z.object({
    about: z.string().max(ABOUT_MAX_LENGTH, t("maxLength", { count: ABOUT_MAX_LENGTH })),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "HIDDEN"]),
  });

export type EditProfileValues = z.infer<ReturnType<typeof editProfileSchema>>;
