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
import { loginSchema, type LoginValues } from "@/lib/validators/auth.schema";

export function LoginForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema(tv)),
    mode: "onChange",
    defaultValues: { userName: "", password: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => login.mutate(values))}
      className="w-full max-w-[420px] space-y-4"
    >
      <div className="mb-8 flex items-center gap-4">
        <Link href={ROUTES.register} aria-label={t("register")}>
          <ChevronLeft className="text-ig-text size-6" />
        </Link>
        <h1 className="text-ig-text text-[17px] font-semibold">{t("loginTitle")}</h1>
      </div>

      <AuthInput
        {...register("userName")}
        placeholder={t("userName")}
        autoComplete="username"
        error={errors.userName?.message}
      />
      <AuthInput
        {...register("password")}
        type="password"
        placeholder={t("password")}
        autoComplete="current-password"
        error={errors.password?.message}
      />

      <AuthButton type="submit" disabled={!isValid} loading={login.isPending} className="mt-6">
        {t("login")}
      </AuthButton>

      <Link
        href={ROUTES.forgotPassword}
        className="text-ig-text block pt-2 text-center text-sm font-semibold"
      >
        {t("forgotPassword")}
      </Link>

      <div className="pt-10">
        <Link href={ROUTES.register}>
          <AuthButton type="button" variant="outline">
            {t("createAccount")}
          </AuthButton>
        </Link>
      </div>
    </form>
  );
}
