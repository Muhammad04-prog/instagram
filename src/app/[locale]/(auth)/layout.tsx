import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

/* ─────────────────────────────────────────────────────────────────
   AppIcon using smooth vector SVG gradient and camera proportions.
   ───────────────────────────────────────────────────────────────── */
function AppIcon({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="igGradient" x1="0" y1="96" x2="96" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#feda75" />
          <stop offset="0.25" stopColor="#fa7e1e" />
          <stop offset="0.5" stopColor="#d62976" />
          <stop offset="0.75" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="24" fill="url(#igGradient)" />
      <rect x="26" y="30" width="44" height="38" rx="10" stroke="white" strokeWidth="4" fill="none" />
      <path d="M36 30 L40 24 H56 L60 30" stroke="white" strokeWidth="4" fill="none" strokeLinejoin="round" />
      <circle cx="48" cy="49" r="11" stroke="white" strokeWidth="4" fill="none" />
      <circle cx="62" cy="38" r="2.5" fill="white" />
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
