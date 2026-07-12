import { z } from "zod";
import type { Translator } from "@/lib/validators/auth.schema";

/** "О себе" is capped at 150 characters — the counter in docs/screenshots/img43. */
export const ABOUT_MAX_LENGTH = 150;

export const editProfileSchema = (t: Translator) =>
  z.object({
    about: z.string().max(ABOUT_MAX_LENGTH, t("maxLength", { count: ABOUT_MAX_LENGTH })),
    gender: z.enum(["Male", "Female"]),
  });

export type EditProfileValues = z.infer<ReturnType<typeof editProfileSchema>>;
