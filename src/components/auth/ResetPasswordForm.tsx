"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { useApiError } from "@/hooks/useApiError";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators/auth.schema";
import { authService } from "@/services/auth.service";

/**
 * Final step of the reset flow — no screenshot exists for it, so it follows img6
 * (single column).
 *
 * `resetToken` is single-use and lives 15 minutes; it comes from `verify-code`.
 * The API takes only `newPassword` — "confirm" is enforced client-side, as the
 * screen still asks for it.
 */
export function ResetPasswordForm({ resetToken }: { resetToken: string }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const toMessage = useApiError();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema(tv)),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const reset = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      authService.resetPassword({ resetToken, newPassword: values.password }),
    onSuccess: () => {
      toast.success(t("passwordChanged"));
      router.replace(ROUTES.login);
    },
    // The resetToken is single-use and expires in 15 minutes.
    onError: (error) => toast.error(toMessage(error, { 400: t("codeInvalid") })),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => reset.mutate(values))}
      className="w-full max-w-[750px] space-y-6"
    >
      <header className="space-y-2">
        <h1 className="text-ig-text text-[28px] font-bold">{t("resetPassword")}</h1>
        <p className="text-ig-text-secondary text-[15px]">{t("resetPasswordSubtitle")}</p>
      </header>

      <AuthInput
        {...register("password")}
        type="password"
        placeholder={t("newPassword")}
        autoComplete="new-password"
        error={errors.password?.message}
      />
      <AuthInput
        {...register("confirmPassword")}
        type="password"
        placeholder={t("confirmPassword")}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
      />

      <AuthButton type="submit" disabled={!isValid} loading={reset.isPending}>
        {t("continue")}
      </AuthButton>
    </form>
  );
}
