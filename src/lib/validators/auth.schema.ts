import { z } from 'zod';

// ── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  userNameOrEmail: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Register ─────────────────────────────────────────────────────────────────
// confirmPassword is not shown in the UI (matches Instagram's real UX)
// but is derived from password to satisfy the backend DTO contract.
export const registerSchema = z
  .object({
    email: z.string().min(1, 'Required').email('Invalid email'),
    password: z.string().min(6, 'Min 6 characters'),
    confirmPassword: z.string().min(6, 'Min 6 characters'),
    fullName: z.string().min(1, 'Required'),
    userName: z.string().min(1, 'Required'),
    day: z.string().min(1, 'Required'),
    month: z.string().min(1, 'Required'),
    year: z.string().min(1, 'Required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ── Reset Password ───────────────────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Required'),
    email: z.string().min(1, 'Required').email('Invalid email'),
    password: z.string().min(6, 'Min 6 characters'),
    confirmPassword: z.string().min(6, 'Min 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

