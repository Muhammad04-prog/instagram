'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useRouter, Link } from '@/i18n/navigation';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators/auth.schema';
import { accountService } from '@/services/account.service';
import { getErrorMessage } from '@/lib/utils';

export default function ResetPasswordForm() {
  const t = useTranslations('ResetPassword');
  const tAuth = useTranslations('Auth');
  const tErrors = useTranslations('AuthErrors');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Read params from search params
  const tokenParam = searchParams.get('token') ?? '';
  const emailParam = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      token: tokenParam,
      email: emailParam,
      password: '',
      confirmPassword: '',
    },
  });

  // Pre-fill fields when query params load
  useEffect(() => {
    if (tokenParam) setValue('token', tokenParam, { shouldValidate: true });
    if (emailParam) setValue('email', emailParam, { shouldValidate: true });
  }, [tokenParam, emailParam, setValue]);

  async function onSubmit(data: ResetPasswordFormValues) {
    setServerError(null);
    try {
      await accountService.resetPassword(data);
      setSuccess(true);
    } catch (error) {
      setServerError(getErrorMessage(error, tErrors));
    }
  }

  if (success) {
    return (
      <div className="flex flex-col text-center">
        <h1 className="text-white font-semibold text-lg mb-3">{t('title')}</h1>
        <p className="text-ig-text-muted text-sm leading-relaxed mb-6">
          {t('successMessage')}
        </p>
        <Link
          href="/login"
          className="ig-btn-primary w-full"
        >
          {tAuth('back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header with logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center w-full mb-2">
          <Link
            href="/login"
            className="text-white p-1 rounded hover:bg-white/10 transition-colors"
            aria-label={tAuth('back')}
          >
            <ChevronLeft size={20} />
          </Link>
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {/* Hidden token field */}
        <input type="hidden" {...register('token')} />

        {/* Email field — read-only if present in URL, otherwise editable fallback */}
        <div>
          <label className="block text-xs text-ig-text-muted mb-1">
            {t('emailLabel')}
          </label>
          <input
            {...register('email')}
            type="email"
            readOnly={!!emailParam}
            className={`ig-input ${
              emailParam ? 'bg-ig-surface text-ig-text-muted border-dashed border-ig-border cursor-not-allowed' : ''
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1 px-1">{errors.email.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              className="ig-input pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-text-muted hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1 px-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirmPasswordPlaceholder')}
              className="ig-input pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-text-muted hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1 px-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-ig-red text-sm text-center">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="ig-btn-primary w-full mt-1"
        >
          {isSubmitting ? tAuth('loading') : t('submit')}
        </button>
      </form>
    </div>
  );
}
