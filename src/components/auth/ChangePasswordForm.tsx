"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import type { ApiError } from "@/lib/axios";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validators/auth.schema";
import { authService } from "@/services/auth.service";

/** No screenshot for this screen — follows the register form's field style. */
export function ChangePasswordForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isValid },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema(tv)),
    mode: "onChange",
    defaultValues: { oldPassword: "", password: "", confirmPassword: "" },
  });

  const change = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      // The API takes only old + new; "confirm" is a client-side guard.
      authService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.password,
      }),
    onSuccess: () => {
      toast.success(t("passwordChanged"));
      resetForm();
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => change.mutate(values))}
      className="w-full max-w-[600px] space-y-5"
    >
      <h1 className="text-ig-text text-xl font-bold">{t("changePassword")}</h1>

      <AuthInput
        {...register("oldPassword")}
        filled
        type="password"
        placeholder={t("oldPassword")}
        autoComplete="current-password"
        error={errors.oldPassword?.message}
      />
      <AuthInput
        {...register("password")}
        filled
        type="password"
        placeholder={t("newPassword")}
        autoComplete="new-password"
        error={errors.password?.message}
      />
      <AuthInput
        {...register("confirmPassword")}
        filled
        type="password"
        placeholder={t("confirmPassword")}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
      />

      <AuthButton type="submit" disabled={!isValid} loading={change.isPending}>
        {t("submit")}
      </AuthButton>
    </form>
  );
}
