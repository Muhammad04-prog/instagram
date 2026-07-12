import { z } from "zod";

/** next-intl translator, narrowed to what the schemas need. */
export type Translator = (key: string, values?: Record<string, string | number>) => string;

const password = (t: Translator) =>
  z
    .string()
    .min(6, t("minLength", { count: 6 }))
    .max(100, t("maxLength", { count: 100 }));

export const loginSchema = (t: Translator) =>
  z.object({
    userName: z.string().min(1, t("required")),
    password: z.string().min(1, t("required")),
  });

export const registerSchema = (t: Translator) =>
  z
    .object({
      email: z.email(t("email")),
      password: password(t),
      confirmPassword: z.string().min(1, t("required")),
      fullName: z
        .string()
        .min(1, t("required"))
        .max(100, t("maxLength", { count: 100 })),
      userName: z
        .string()
        .min(3, t("minLength", { count: 3 }))
        .max(30, t("maxLength", { count: 30 })),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

export const forgotPasswordSchema = (t: Translator) =>
  z.object({
    email: z.email(t("email")),
  });

export const resetPasswordSchema = (t: Translator) =>
  z
    .object({
      password: password(t),
      confirmPassword: z.string().min(1, t("required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

export const changePasswordSchema = (t: Translator) =>
  z
    .object({
      oldPassword: z.string().min(1, t("required")),
      password: password(t),
      confirmPassword: z.string().min(1, t("required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

export type LoginValues = z.infer<ReturnType<typeof loginSchema>>;
export type RegisterValues = z.infer<ReturnType<typeof registerSchema>>;
export type ForgotPasswordValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;
export type ResetPasswordValues = z.infer<ReturnType<typeof resetPasswordSchema>>;
export type ChangePasswordValues = z.infer<ReturnType<typeof changePasswordSchema>>;
