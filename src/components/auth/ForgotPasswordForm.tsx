"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { Link } from "@/i18n/navigation";
import type { ApiError } from "@/lib/axios";
import { ROUTES } from "@/lib/constants";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators/auth.schema";
import { accountService } from "@/services/account.service";

/** docs/screenshots/img6 — "Поиск аккаунта". API takes an email only. */
export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema(tv)),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const forgot = useMutation({
    mutationFn: (values: ForgotPasswordValues) => accountService.forgotPassword(values.email),
    onSuccess: () => toast.success(t("resetLinkSent")),
    // The server's mailer is broken: a *valid* email answers with a raw MailKit
    // stack message ("Method not found: Void MailKit.MailTransport.Send…").
    // Show a sentence instead of that — docs/BACKEND_BUGS.md #22.
    onError: (error: ApiError) =>
      toast.error(
        /mailkit|method not found/i.test(error.message)
          ? t("resetMailBroken")
          : error.message || t("findAccount"),
      ),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => forgot.mutate(values))}
      className="w-full max-w-[750px] space-y-6"
    >
      <Link href={ROUTES.login} aria-label={t("login")} className="block">
        <ChevronLeft className="text-ig-text size-6" />
      </Link>

      <header className="space-y-2">
        <h1 className="text-ig-text text-[28px] font-bold">{t("findAccount")}</h1>
        <p className="text-ig-text-secondary text-[15px]">{t("findAccountSubtitle")}</p>
      </header>

      <AuthInput
        {...register("email")}
        type="email"
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        error={errors.email?.message}
      />

      <AuthButton type="submit" disabled={!isValid} loading={forgot.isPending}>
        {t("continue")}
      </AuthButton>
    </form>
  );
}
