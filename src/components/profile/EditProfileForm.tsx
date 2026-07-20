"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApiError } from "@/hooks/useApiError";
import { useUpdateProfile } from "@/hooks/useProfile";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import {
  ABOUT_MAX_LENGTH,
  editProfileSchema,
  type EditProfileValues,
} from "@/lib/validators/profile.schema";
import { cn } from "@/lib/utils";
import type { ProfileDto } from "@/types/profile.types";

/**
 * docs/screenshots/img43 + img44.
 *
 * Order and shape follow the screenshots: label above, then a rounded card; the
 * toggles carry a title, a description and a Switch on the right.
 *
 * `username` is shown but disabled — the real `UpdateProfileDto` has no
 * username field, so there is nowhere to send a rename. `dob` + `gender` live
 * on their own "Personal information" page (linked below), and `occupation`
 * is dropped entirely — real (non-business) IG accounts don't expose it.
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
        ...(values.website ? { website: values.website } : {}),
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

      <Link
        href={ROUTES.personalInfo}
        className="border-ig-border flex items-center gap-4 rounded-lg border px-4 py-4"
      >
        <span className="min-w-0 flex-1">
          <span className="text-ig-text block text-sm">{t("personalInformation")}</span>
          <span className="text-ig-text-secondary mt-1 block text-xs">
            {t("personalInformationHint")}
          </span>
        </span>
        <ChevronRight className="text-ig-text-secondary size-5 shrink-0" />
      </Link>

      <Section title={t("fullName")}>
        <Field error={errors.fullName?.message}>
          <Input
            {...register("fullName")}
            placeholder={t("fullNamePlaceholder")}
            className="bg-ig-elevated text-ig-text h-11 rounded-xl border-none px-4 shadow-sm"
          />
        </Field>
      </Section>

      <Section title={t("website")} hint={t("websiteHint")}>
        <Field error={errors.website?.message}>
          <Input
            {...register("website")}
            inputMode="url"
            placeholder={t("websitePlaceholder")}
            className="bg-ig-elevated text-ig-text h-11 rounded-xl border-none px-4 shadow-sm"
          />
        </Field>
      </Section>

      <Section title={t("about")}>
        <div className="bg-ig-elevated rounded-xl border-none px-4 py-3 shadow-sm">
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

      <Toggle
        control={control}
        name="showAccountSuggestions"
        title={t("showAccountSuggestions")}
        description={t("showAccountSuggestionsHint")}
      />

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!isDirty || update.isPending}
          className="bg-ig-primary hover:bg-ig-primary-hover w-auto rounded-lg px-6 py-2.5 font-semibold text-white shadow-sm transition disabled:opacity-50"
        >
          {tCommon("save")}
        </button>
      </div>
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
    <section className="space-y-1">
      <label className="text-ig-text block text-sm font-semibold">{title}</label>
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
    <section className={cn("space-y-1", className)}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <label className="border-ig-border flex cursor-pointer items-center gap-4 rounded-lg border px-4 py-4">
            <span className="min-w-0 flex-1">
              <span className="text-ig-text block text-sm font-semibold">{title}</span>
              <span className="text-ig-text-secondary block text-xs">{description}</span>
            </span>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </label>
        )}
      />
    </section>
  );
}
