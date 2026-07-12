import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

/* ─────────────────────────────────────────────────────────────────
   AppIcon using smooth vector SVG gradient and camera proportions.
   Distinct design (cyan → purple → pink gradient, alternate layout).
   ───────────────────────────────────────────────────────────────── */
function AppIcon({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="appGradient" x1="10" y1="10" x2="86" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="20" fill="url(#appGradient)" />
      <rect x="24" y="32" width="48" height="36" rx="8" stroke="white" strokeWidth="4" fill="none" />
      <circle cx="48" cy="50" r="10" stroke="white" strokeWidth="4" fill="none" />
      <rect x="58" y="24" width="10" height="6" rx="2" fill="white" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Auth layout — two-column desktop, form-only on mobile
   ───────────────────────────────────────────────────────────────── */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen bg-black flex">
      {/* ── LEFT PANEL (desktop only) ──────────────────────────── */}
      <div className="hidden md:flex flex-col flex-1 items-center justify-center gap-6 bg-black px-8">
        <h2 className="text-white text-3xl font-light text-center max-w-sm leading-snug">
          {t.rich('leftPanel.heading', {
            accent: (chunks) => <span className="text-ig-blue font-normal">{chunks}</span>
          })}
        </h2>
        <div className="mt-4">
          <AppIcon size={96} />
        </div>
      </div>

      {/* ── RIGHT PANEL — form area ────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-screen items-center justify-center px-4 py-8">
        {/* Mobile: show small icon at top */}
        <div className="md:hidden mb-6">
          <AppIcon size={52} />
        </div>

        {/* Form slot */}
        <div className="w-full max-w-[350px]">
          {children}
        </div>

        {/* Footer branding */}
        <div className="mt-8 text-center text-xs text-zinc-600 select-none">
          <span className="font-semibold tracking-widest">Meta</span>
          <span className="mx-1">∞</span>
        </div>
      </div>
    </div>
  );
}
