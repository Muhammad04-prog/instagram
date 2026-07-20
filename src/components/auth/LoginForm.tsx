"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { loginSchema, type LoginValues } from "@/lib/validators/auth.schema";

export function LoginForm({
  prefillLogin = "",
  onBack,
}: {
  /** Set when arriving from "Continue as …" — only the password is left to type. */
  prefillLogin?: string;
  /** Back to the saved-account card; absent when there is no card to go back to. */
  onBack?: () => void;
} = {}) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const { login, verifyTwoFactor } = useAuth();
  const [ticket, setTicket] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema(tv)),
    mode: "onChange",
    defaultValues: { login: prefillLogin, password: "" },
  });

  // Second step of login: the account has 2FA on, so `login` returned a
  // ticket instead of tokens (see `TwoFactorRequiredDto`) — this step trades
  // it for the real pair.
  if (ticket) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          verifyTwoFactor.mutate({ ticket, code });
        }}
        className="w-full max-w-[420px] space-y-4"
      >
        <div className="mb-8 flex items-center gap-4">
          <button type="button" onClick={() => setTicket(null)} aria-label={t("back")}>
            <ChevronLeft className="text-ig-text size-6" />
          </button>
          <h1 className="text-ig-text text-[17px] font-semibold">{t("twoFactorTitle")}</h1>
        </div>

        <p className="text-ig-text-secondary text-sm">{t("twoFactorHint")}</p>

        <AuthInput
          value={code}
          onChange={(event) => setCode(event.target.value.trim())}
          placeholder={t("twoFactorCodePlaceholder")}
          autoComplete="one-time-code"
          autoFocus
        />

        <AuthButton
          type="submit"
          disabled={!code}
          loading={verifyTwoFactor.isPending}
          className="mt-6"
        >
          {t("twoFactorConfirm")}
        </AuthButton>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        login.mutate(values, {
          onSuccess: (result) => {
            if (result.twoFactorRequired) setTicket(result.ticket);
          },
        }),
      )}
      className="w-full max-w-[420px] space-y-4"
    >
      <div className="mb-8 flex items-center gap-4">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label={t("back")}>
            <ChevronLeft className="text-ig-text size-6" />
          </button>
        ) : (
          <Link href={ROUTES.register} aria-label={t("register")}>
            <ChevronLeft className="text-ig-text size-6" />
          </Link>
        )}
        <h1 className="text-ig-text text-[17px] font-semibold">{t("loginTitle")}</h1>
      </div>

      <AuthInput
        {...register("login")}
        placeholder={t("loginPlaceholder")}
        autoComplete="username"
        autoFocus={prefillLogin.length > 0 ? false : undefined}
        error={errors.login?.message}
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
