"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApiError } from "@/hooks/useApiError";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import {
  ABOUT_MAX_LENGTH,
  editProfileSchema,
  type EditProfileValues,
} from "@/lib/validators/profile.schema";
import { cn } from "@/lib/utils";
import type { Gender, ProfileDto } from "@/types/profile.types";

/**
 * docs/screenshots/img43 + img44.
 *
 * Order and shape follow the screenshots: label above, then a rounded card; the
 * toggles carry a title, a description and a Switch on the right; "Пол" is a
 * select whose "Prefer not to say" is the API's `HIDDEN`.
 *
 * Everything here is real now. Phase 4 could only offer `about` + `gender` —
 * softclub's update endpoint rejected anything else — so "Сайт" and the toggles
 * were left out rather than faked. Name / occupation / date of birth are extra
 * fields the API accepts; IG edits those on mobile, so they sit above the link.
 */
export function EditProfileForm({ profile }: { profile: ProfileDto }) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const update = useUpdateProfile();
  const toMessage = useApiError();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema(tValidation)),
    defaultValues: {
      fullName: profile.fullName,
      about: profile.about ?? "",
      website: profile.website ?? "",
      occupation: profile.occupation ?? "",
      gender: profile.gender,
      // The API returns an ISO timestamp; the date input wants YYYY-MM-DD.
      dob: profile.dob ? profile.dob.slice(0, 10) : "",
      showThreadsBadge: profile.showThreadsBadge,
      isAiAuthor: profile.isAiAuthor,
      showAccountSuggestions: profile.showAccountSuggestions,
    },
  });

  const about = useWatch({ control, name: "about" });

  const onSubmit = handleSubmit((values) => {
    // Symmetric enum: what we send is what GET returns. Softclub read "Male"
    // but only accepted 0|1 on write (bug #12) — hence the old ordinal map.
    // Empty optional strings are dropped rather than sent as "".
    update.mutate(
      {
        fullName: values.fullName,
        about: values.about,
        gender: values.gender,
        ...(values.website ? { website: values.website } : {}),
        ...(values.occupation ? { occupation: values.occupation } : {}),
        ...(values.dob ? { dob: values.dob } : {}),
        showThreadsBadge: values.showThreadsBadge,
        isAiAuthor: values.isAiAuthor,
        showAccountSuggestions: values.showAccountSuggestions,
      },
      {
        onSuccess: () => {
          toast.success(t("profileUpdated"));
          router.push(ROUTES.myProfile);
        },
        onError: (error) => toast.error(toMessage(error)),
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AvatarUploader profile={profile} />

      <Section title={t("fullName")}>
        <Field error={errors.fullName?.message}>
          <Input
            {...register("fullName")}
            placeholder={t("fullNamePlaceholder")}
            className="border-ig-border text-ig-text h-12 rounded-2xl px-4"
          />
        </Field>
      </Section>

      <Section title={t("website")} hint={t("websiteHint")}>
        <Field error={errors.website?.message}>
          <Input
            {...register("website")}
            inputMode="url"
            placeholder={t("websitePlaceholder")}
            className="border-ig-border text-ig-text h-12 rounded-2xl px-4"
          />
        </Field>
      </Section>

      <Section title={t("about")}>
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
      </Section>

      <Section title={t("occupation")}>
        <Field error={errors.occupation?.message}>
          <Input
            {...register("occupation")}
            placeholder={t("occupation")}
            className="border-ig-border text-ig-text h-12 rounded-2xl px-4"
          />
        </Field>
      </Section>

      <Section title={t("dobLabel")} hint={t("dobHint")}>
        <Field error={errors.dob?.message}>
          <Input
            {...register("dob")}
            type="date"
            className="border-ig-border text-ig-text h-12 rounded-2xl px-4"
          />
        </Field>
      </Section>

      <Toggle
        control={control}
        name="showThreadsBadge"
        title={t("showThreadsBadge")}
        description={t("showThreadsBadgeHint")}
      />

      <Toggle
        control={control}
        name="isAiAuthor"
        title={t("isAiAuthor")}
        description={t("isAiAuthorHint")}
      />

      <Section title={t("gender")} hint={t("genderHint")}>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(value) => field.onChange(value as Gender)}>
              <SelectTrigger className="border-ig-border text-ig-text h-12 w-full rounded-2xl px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">{t("male")}</SelectItem>
                <SelectItem value="FEMALE">{t("female")}</SelectItem>
                <SelectItem value="OTHER">{t("otherGender")}</SelectItem>
                {/* img44: "Предпочитаю не указывать" — the API's HIDDEN. */}
                <SelectItem value="HIDDEN">{t("hiddenGender")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Section>

      <Toggle
        control={control}
        name="showAccountSuggestions"
        title={t("showAccountSuggestions")}
        description={t("showAccountSuggestionsHint")}
      />

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

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-ig-text text-base font-semibold">{title}</h2>
      {children}
      {hint ? <p className="text-ig-text-secondary text-xs">{hint}</p> : null}
    </section>
  );
}

function Field({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {children}
      {error ? <p className="text-ig-danger text-xs">{error}</p> : null}
    </div>
  );
}

/** Label above, then a card with title + description and the switch on the right (img43/img44). */
function Toggle({
  control,
  name,
  title,
  description,
  className,
}: {
  control: Control<EditProfileValues>;
  name: "showThreadsBadge" | "isAiAuthor" | "showAccountSuggestions";
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h2 className="text-ig-text text-base font-semibold">{title}</h2>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <label className="border-ig-border flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4">
            <span className="min-w-0 flex-1">
              <span className="text-ig-text block text-sm">{title}</span>
              <span className="text-ig-text-secondary block text-xs">{description}</span>
            </span>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </label>
        )}
      />
    </section>
  );
}
