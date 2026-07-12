"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { useRouter } from "@/i18n/navigation";
import type { ApiError } from "@/lib/axios";
import { ROUTES } from "@/lib/constants";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators/auth.schema";
import { accountService } from "@/services/account.service";

/** No screenshot exists for this screen — laid out to match img6 (single column). */
export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
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
      accountService.resetPassword({
        token,
        email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: () => {
      toast.success(t("passwordChanged"));
      router.replace(ROUTES.login);
    },
    onError: (error: ApiError) => toast.error(error.message),
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
