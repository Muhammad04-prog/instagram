"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiError } from "@/hooks/useApiError";
import { useMyProfile, useUpdateProfile } from "@/hooks/useProfile";
import { personalInfoSchema, type PersonalInfoValues } from "@/lib/validators/profile.schema";
import type { Gender, ProfileDto } from "@/types/profile.types";

/**
 * "Personal information" (dob + gender), split out of Edit Profile — real IG
 * nests these under Accounts Center rather than the main profile form.
 */
export function PersonalInformationForm() {
  const { data: profile, isPending, isError, refetch } = useMyProfile();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !profile) return <ErrorState onRetry={() => void refetch()} />;

  return <PersonalInformationFields profile={profile} />;
}

function PersonalInformationFields({ profile }: { profile: ProfileDto }) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const update = useUpdateProfile();
  const toMessage = useApiError();

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema(tValidation)),
    defaultValues: {
      gender: profile.gender,
      dob: profile.dob ? profile.dob.slice(0, 10) : "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    update.mutate(
      {
        gender: values.gender,
        ...(values.dob ? { dob: values.dob } : {}),
      },
      {
        onSuccess: () => toast.success(t("profileUpdated")),
        onError: (error) => toast.error(toMessage(error)),
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title={t("dobLabel")} hint={t("dobHint")}>
        <Controller
          control={control}
          name="dob"
          render={({ field }) => (
            <Input
              {...field}
              type="date"
              className="border-ig-border text-ig-text h-11 rounded-lg px-4"
            />
          )}
        />
        {errors.dob ? <p className="text-ig-danger text-xs">{errors.dob.message}</p> : null}
      </Section>

      <Section title={t("gender")} hint={t("genderHint")}>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(value) => field.onChange(value as Gender)}>
              <SelectTrigger className="border-ig-border text-ig-text h-11 w-full rounded-lg px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">{t("male")}</SelectItem>
                <SelectItem value="FEMALE">{t("female")}</SelectItem>
                <SelectItem value="OTHER">{t("otherGender")}</SelectItem>
                <SelectItem value="HIDDEN">{t("hiddenGender")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={update.isPending || !isDirty}
          className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {update.isPending ? tCommon("loading") : tCommon("submit")}
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
