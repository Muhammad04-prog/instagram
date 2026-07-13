"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { registerSchema, type RegisterValues } from "@/lib/validators/auth.schema";

/**
 * Layout follows docs/screenshots/img4 + img5 (single centred column, filled
 * inputs, section labels). The screenshot's "Дата рождения" block is dropped —
 * Swagger's RegisterDto has no birthday — and "Confirm password" takes its place
 * because the API requires it.
 */
export function RegisterForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema(tv)),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      userName: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        registerUser.mutate({
          userName: values.userName,
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      )}
      className="w-full max-w-[700px] space-y-6"
    >
      <Link href={ROUTES.login} aria-label={t("login")} className="block">
        <ChevronLeft className="text-ig-text size-6" />
      </Link>

      <header className="space-y-2">
        <p className="text-ig-text-secondary text-sm font-semibold">∞ Meta</p>
        <h1 className="text-ig-text text-[32px] font-bold">{t("registerTitle")}</h1>
        <p className="text-ig-text-secondary text-[15px]">{t("registerSubtitle")}</p>
      </header>

      <Field label={t("email")}>
        <AuthInput
          {...register("email")}
          filled
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          error={errors.email?.message}
        />
      </Field>

      <Field label={t("password")}>
        <AuthInput
          {...register("password")}
          filled
          type="password"
          placeholder={t("password")}
          autoComplete="new-password"
          error={errors.password?.message}
        />
      </Field>

      <Field label={t("confirmPassword")}>
        <AuthInput
          {...register("confirmPassword")}
          filled
          type="password"
          placeholder={t("confirmPassword")}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />
      </Field>

      <Field label={t("fullName")}>
        <AuthInput
          {...register("fullName")}
          filled
          placeholder={t("fullNamePlaceholder")}
          autoComplete="name"
          error={errors.fullName?.message}
        />
      </Field>

      <Field label={t("userName")}>
        <AuthInput
          {...register("userName")}
          filled
          placeholder={t("userName")}
          autoComplete="username"
          error={errors.userName?.message}
        />
      </Field>

      <p className="text-ig-text-secondary text-[13px] leading-relaxed">{t("registerTerms")}</p>

      <div className="space-y-3">
        <AuthButton type="submit" disabled={!isValid} loading={registerUser.isPending}>
          {t("submit")}
        </AuthButton>

        <Link href={ROUTES.login}>
          <AuthButton
            type="button"
            className="text-ig-text border-auth-input-border hover:bg-auth-input-bg border bg-transparent"
          >
            {t("haveAccount")}
          </AuthButton>
        </Link>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-ig-text text-[15px] font-semibold">{label}</span>
      {children}
    </label>
  );
}
