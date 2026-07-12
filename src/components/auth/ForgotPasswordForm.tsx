'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { useRouter, Link } from '@/i18n/navigation';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators/auth.schema';
import { accountService } from '@/services/account.service';
import { getErrorMessage } from '@/lib/utils';

export default function ForgotPasswordForm() {
  const t = useTranslations('ForgotPassword');
  const tAuth = useTranslations('Auth');
  const tErrors = useTranslations('AuthErrors');
  const router = useRouter();
  
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email');
  const isFilled = emailValue && emailValue.length > 0;

  async function onSubmit(data: ForgotPasswordFormValues) {
    setServerError(null);
    try {
      await accountService.forgotPassword(data.email);
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
          className="text-ig-blue text-sm font-semibold hover:text-ig-blue-hover transition-colors"
        >
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Back to Login Header with logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center w-full mb-2">
          <Link
            href="/login"
            className="text-white p-1 rounded hover:bg-white/10 transition-colors"
            aria-label={t('backToLogin')}
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

      <p className="text-ig-text-muted text-xs mb-4 leading-relaxed">
        {t('subtitle')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            className="ig-input"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1 px-1">{errors.email.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-ig-red text-sm text-center">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={!isFilled || isSubmitting}
          className="ig-btn-primary w-full mt-1"
        >
          {isSubmitting ? tAuth('loading') : t('submit')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-ig-blue text-xs font-semibold hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}
