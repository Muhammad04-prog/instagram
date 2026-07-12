'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ChevronLeft, Eye, EyeOff, Info, ChevronDown } from 'lucide-react';
import { useRouter, Link } from '@/i18n/navigation';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth.schema';
import { accountService } from '@/services/account.service';
import { getErrorMessage } from '@/lib/utils';

// ── Month keys used for translations ────────────────────────────────────────
const MONTH_KEYS = ['1','2','3','4','5','6','7','8','9','10','11','12'] as const;

// ── Locale display names ─────────────────────────────────────────────────────
const LOCALE_LABELS: Record<string, string> = {
  ru: 'Русский',
  tg: 'Тоҷикӣ',
  en: 'English',
};

export default function RegisterForm({ locale }: { locale: string }) {
  const t  = useTranslations('Register');
  const tA = useTranslations('Auth');
  const tL = useTranslations('LocaleSwitcher');
  const tErrors = useTranslations('AuthErrors');
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError]   = useState<string | null>(null);
  const [localeOpen, setLocaleOpen]     = useState(false);

  // ── Current year for footer copyright ──────────────────────────────────────
  const year = new Date().getFullYear();

  // ── Year range for date of birth ───────────────────────────────────────────
  const years = Array.from({ length: year - 1940 + 1 }, (_, i) => year - i);
  const days  = Array.from({ length: 31 }, (_, i) => i + 1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  // Auto-sync confirmPassword = password (hidden from UI, required by backend)
  const watchedPassword = watch('password');
  useEffect(() => {
    setValue('confirmPassword', watchedPassword ?? '', { shouldValidate: true });
  }, [watchedPassword, setValue]);


  async function onSubmit(data: RegisterFormValues) {
    setServerError(null);
    try {
      await accountService.register(data);
      router.push('/login');
    } catch (error) {
      setServerError(getErrorMessage(error, tErrors));
    }
  }

  return (
    <div className="flex flex-col">

      {/* ── Back + Meta label ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-white p-1 rounded hover:bg-white/10 transition-colors"
          aria-label={tA('back')}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs text-ig-text-muted font-semibold tracking-widest">
          {t('metaLabel')}
        </span>
        <div className="w-7" /> {/* spacer */}
      </div>

      {/* ── Heading + subtext ────────────────────────────────────── */}
      <div className="text-center mb-5">
        <h1 className="text-white font-semibold text-base leading-snug">
          {t('title')}
        </h1>
        <p className="text-ig-text-muted text-xs mt-1 leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5" noValidate>

        {/* Email / phone */}
        <div>
          <label className="block text-xs text-ig-text-muted mb-1">
            {t('emailPhoneLabel')}
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder={t('emailPhonePlaceholder')}
            className="ig-input"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-0.5 px-1">{errors.email.message}</p>
          )}
          <p className="text-ig-text-secondary text-xs mt-1 leading-snug">
            {t('notificationHelper')}{' '}
            <a href="#" className="text-ig-link hover:underline">{t('learnMore')}</a>
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs text-ig-text-muted mb-1">
            {t('passwordLabel')}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={t('passwordLabel')}
              className="ig-input pr-10"
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
            <p className="text-red-400 text-xs mt-0.5 px-1">{errors.password.message}</p>
          )}
          {/* Hidden confirmPassword — derived from password on submit */}
          <input type="hidden" {...register('confirmPassword')} />
        </div>

        {/* Date of birth */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-ig-text-muted mb-1">
            {t('birthdateLabel')}
            <Info size={13} className="text-ig-text-secondary" aria-label={t('birthdateInfo')} />
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {/* Day */}
            <div className="relative">
              <select
                {...register('day')}
                className="ig-input appearance-none pr-6 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>{t('day')}</option>
                {days.map((d) => (
                  <option key={d} value={String(d)}>{d}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ig-text-muted pointer-events-none" />
            </div>
            {/* Month */}
            <div className="relative">
              <select
                {...register('month')}
                className="ig-input appearance-none pr-6 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>{t('month')}</option>
                {MONTH_KEYS.map((k) => (
                  <option key={k} value={k}>{t(`months.${k}`)}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ig-text-muted pointer-events-none" />
            </div>
            {/* Year */}
            <div className="relative">
              <select
                {...register('year')}
                className="ig-input appearance-none pr-6 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>{t('year')}</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ig-text-muted pointer-events-none" />
            </div>
          </div>
          {(errors.day || errors.month || errors.year) && (
            <p className="text-red-400 text-xs mt-0.5 px-1">Required</p>
          )}
        </div>

        {/* Full name */}
        <div>
          <label className="block text-xs text-ig-text-muted mb-1">
            {t('fullNameLabel')}
          </label>
          <input
            {...register('fullName')}
            type="text"
            autoComplete="name"
            placeholder={t('fullNamePlaceholder')}
            className="ig-input"
          />
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-0.5 px-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs text-ig-text-muted mb-1">
            {t('usernameLabel')}
          </label>
          <input
            {...register('userName')}
            type="text"
            autoComplete="username"
            placeholder={t('usernamePlaceholder')}
            className="ig-input"
          />
          {errors.userName && (
            <p className="text-red-400 text-xs mt-0.5 px-1">{errors.userName.message}</p>
          )}
        </div>

        {/* Legal paragraph */}
        <p className="text-ig-text-secondary text-[10px] leading-relaxed mt-1">
          {t('legalUpload')}{' '}
          <a href="#" className="text-ig-link hover:underline">{t('legalLearnMore')}</a>
          {'. '}
          {t('legalAgreement')}{' '}
          <a href="#" className="text-ig-link hover:underline">{t('legalTerms')}</a>
          {t('legalComma')}{' '}
          <a href="#" className="text-ig-link hover:underline">{t('legalPrivacy')}</a>{' '}
          {t('legalAnd')}{' '}
          <a href="#" className="text-ig-link hover:underline">{t('legalCookies')}</a>
          {t('legalDot')}
        </p>
        <p className="text-ig-text-secondary text-[10px] leading-relaxed">
          {t('legalAds')}
        </p>

        {/* Server error */}
        {serverError && (
          <p className="text-ig-red text-sm text-center">{serverError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="ig-btn-primary w-full mt-1"
        >
          {isSubmitting ? tA('loading') : t('submit')}
        </button>
      </form>

      {/* ── Already have account ─────────────────────────────────── */}
      <div className="mt-4 text-center border border-ig-border rounded-lg py-3">
        <Link
          href="/login"
          className="text-ig-blue text-sm font-semibold hover:text-ig-blue-hover transition-colors"
        >
          {t('alreadyHaveAccount')}
        </Link>
      </div>

      {/* ── Footer links + locale switcher ───────────────────────── */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {/* Footer links row */}
        <p className="text-ig-text-secondary text-[10px] text-center leading-relaxed max-w-xs">
          {t('footerLinks')}
        </p>

        {/* Locale switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLocaleOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs text-ig-text-muted hover:text-white transition-colors font-medium"
          >
            {LOCALE_LABELS[locale] ?? locale}
            <ChevronDown size={12} />
          </button>
          {localeOpen && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-ig-surface border border-ig-border rounded-lg overflow-hidden shadow-xl z-10 min-w-[120px]">
              {(['ru', 'tg', 'en'] as const).map((loc) => (
                <Link
                  key={loc}
                  href="/register"
                  locale={loc}
                  onClick={() => setLocaleOpen(false)}
                  className={`block px-4 py-2 text-xs hover:bg-ig-surface-hover transition-colors ${
                    loc === locale ? 'text-white font-semibold' : 'text-ig-text-muted'
                  }`}
                >
                  {tL(loc)}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Copyright */}
        <p className="text-ig-text-secondary text-[10px]">
          {t('copyright', { year: String(year) })}
        </p>
      </div>
    </div>
  );
}
