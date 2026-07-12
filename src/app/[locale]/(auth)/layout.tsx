'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

/* ─────────────────────────────────────────────────────────────────
   AppIcon using user-uploaded Instagram logo image.
   Protected against selection, drag, and context menu copying.
   ───────────────────────────────────────────────────────────────── */
function AppIcon({ size = 96 }: { size?: number }) {
  return (
    <div
      className="overflow-hidden rounded-3xl select-none pointer-events-none"
      style={{ width: size, height: size }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src="/instagram-logo-main.png"
        alt="Instagram"
        width={size}
        height={size}
        className="object-cover select-none pointer-events-none"
        priority
        draggable={false}
      />
    </div>
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
