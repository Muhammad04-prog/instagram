"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import {
  ABOUT_MAX_LENGTH,
  editProfileSchema,
  type EditProfileValues,
} from "@/lib/validators/profile.schema";
import type { Gender, ProfileDto } from "@/types/profile.types";

/**
 * docs/screenshots/img43 + img44.
 *
 * The API now has every field the screenshots show — website, occupation, dob,
 * the Threads / AI-author / suggestion toggles — where softclub accepted only
 * `about` and `gender`. They are added in Phase 13; this pass just keeps the
 * form working against the new enum.
 */
export function EditProfileForm({ profile }: { profile: ProfileDto }) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema(tValidation)),
    defaultValues: {
      about: profile.about ?? "",
      gender: profile.gender,
    },
  });

  const about = useWatch({ control, name: "about" });
  const gender = useWatch({ control, name: "gender" });

  const onSubmit = handleSubmit((values) => {
    // Symmetric enum: what we send is what GET returns. Softclub read "Male"
    // but only accepted 0|1 on write (bug #12) — hence the old ordinal map.
    update.mutate(
      { about: values.about, gender: values.gender },
      {
        onSuccess: () => {
          toast.success(t("profileUpdated"));
          router.push(ROUTES.myProfile);
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AvatarUploader profile={profile} />

      <section className="space-y-3">
        <h2 className="text-ig-text text-base font-semibold">{t("about")}</h2>
        <div className="border-ig-border focus-within:border-ig-text-secondary rounded-2xl border px-4 py-3">
          <Textarea
            {...register("about")}
            maxLength={ABOUT_MAX_LENGTH}
            rows={3}
            placeholder={t("aboutPlaceholder")}
            className="text-ig-text resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <p className="text-ig-text-secondary text-right text-xs">
            {about.length} / {ABOUT_MAX_LENGTH}
          </p>
        </div>
        {errors.about ? <p className="text-ig-danger text-xs">{errors.about.message}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-ig-text text-base font-semibold">{t("gender")}</h2>
        <Select
          value={gender}
          onValueChange={(value) => setValue("gender", value as Gender, { shouldDirty: true })}
        >
          <SelectTrigger className="border-ig-border text-ig-text h-12 w-full rounded-2xl px-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">{t("male")}</SelectItem>
            <SelectItem value="Female">{t("female")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-ig-text-secondary text-xs">{t("genderHint")}</p>
      </section>

      <button
        type="submit"
        disabled={update.isPending || !isDirty}
        className="bg-ig-primary hover:bg-ig-primary-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {update.isPending ? tCommon("loading") : tCommon("submit")}
      </button>
    </form>
  );
}
