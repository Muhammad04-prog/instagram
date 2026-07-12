'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';

import { useRouter, Link } from '@/i18n/navigation';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth.schema';
import { accountService } from '@/services/account.service';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';

export default function LoginForm() {
  const t = useTranslations('Login');
  const tAuth = useTranslations('Auth');
  const tErrors = useTranslations('AuthErrors');
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();
  const isFormFilled =
    watchedValues.userNameOrEmail?.length > 0 &&
    watchedValues.password?.length > 0;

  async function onSubmit(data: LoginFormValues) {
    setServerError(null);
    try {
      const res = await accountService.login(data);
      if (res.data) {
        setToken(res.data);
        router.push('/');
      } else {
        setServerError(tErrors('generic'));
      }
    } catch (error) {
      setServerError(getErrorMessage(error, tErrors));
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Back + heading with logo ───────────────────────────── */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center w-full mb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-white p-1 rounded hover:bg-white/10 transition-colors"
            aria-label={tAuth('back')}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="w-12 h-12 mb-3 overflow-hidden select-none pointer-events-none" onContextMenu={(e) => e.preventDefault()}>
          <Image
            src="/insta.png"
            alt="Instagram"
            width={48}
            height={48}
            className="object-contain select-none pointer-events-none"
            priority
            draggable={false}
          />
        </div>
        <h1 className="text-white font-semibold text-base leading-tight mt-1">
          {t('title')}
        </h1>
      </div>

      {/* ── Form ────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        {/* Username / email */}
        <input
          {...register('userNameOrEmail')}
          type="text"
          autoComplete="username"
          placeholder={t('usernamePlaceholder')}
          className="ig-input"
          aria-label={t('usernamePlaceholder')}
        />
        {errors.userNameOrEmail && (
          <p className="text-red-400 text-xs px-1">{errors.userNameOrEmail.message}</p>
        )}

        {/* Password */}
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('passwordPlaceholder')}
            className="ig-input pr-10"
            aria-label={t('passwordPlaceholder')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-text-muted hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-xs px-1">{errors.password.message}</p>
        )}

        {/* Server error */}
        {serverError && (
          <p className="text-ig-red text-sm text-center mt-1">{serverError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormFilled || isSubmitting}
          className="ig-btn-muted w-full mt-2"
        >
          {isSubmitting ? tAuth('loading') : t('submit')}
        </button>
      </form>

      {/* ── Forgot password ─────────────────────────────────────── */}
      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-ig-link text-xs hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-ig-border" />
        <div className="flex-1 h-px bg-ig-border" />
      </div>

      {/* ── Facebook login ──────────────────────────────────────── */}
      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full border border-ig-border text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-ig-surface-hover transition-colors"
        onClick={() => {/* Facebook OAuth – not implemented */}}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="#1877f2"/>
          <path d="M15.5 8H13V6.5C13 5.95 13.45 5.5 14 5.5h1.5V3h-2C11.57 3 10 4.57 10 6.5V8H8v2.5h2V21h3v-10.5h2l.5-2.5z" fill="white"/>
        </svg>

        <span>{t('facebookButton')}</span>
      </button>

      {/* ── Create account ──────────────────────────────────────── */}
      <div className="mt-4 text-center border border-ig-border rounded-lg py-3">
        <Link
          href="/register"
          className="text-ig-blue text-sm font-semibold hover:text-ig-blue-hover transition-colors"
        >
          {t('createAccount')}
        </Link>
      </div>
    </div>
  );
}
