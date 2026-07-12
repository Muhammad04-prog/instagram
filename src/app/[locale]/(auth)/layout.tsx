import Image from 'next/image';
import type { ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────
   AppIcon using user-uploaded Instagram logo image.
   ───────────────────────────────────────────────────────────────── */
function AppIcon({ size = 56 }: { size?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl select-none" style={{ width: size, height: size }}>
      <Image
        src="/instagram-logo-2.jpg"
        alt="Instagram"
        width={size}
        height={size}
        className="object-cover"
        priority
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Phone mockup placeholder — pure CSS/SVG, no real photos.
   ───────────────────────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative w-[220px] h-[400px] mt-8 hidden xl:block">
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-zinc-600 bg-zinc-900 overflow-hidden shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-10" />
        {/* Simulated feed content */}
        <div className="mt-8 px-2 space-y-3">
          {/* Story row */}
          <div className="flex gap-2 px-1 pt-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-pink-500 bg-zinc-800" />
            ))}
          </div>
          <div className="h-px bg-zinc-800" />
          {/* Post placeholder 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-zinc-700" />
              <div className="h-2 w-20 rounded bg-zinc-700" />
            </div>
            <div className="h-36 rounded bg-gradient-to-br from-zinc-700 to-zinc-800" />
            <div className="flex gap-3 px-1">
              <div className="h-2 w-5 rounded bg-zinc-700" />
              <div className="h-2 w-5 rounded bg-zinc-700" />
              <div className="h-2 w-5 rounded bg-zinc-700" />
            </div>
          </div>
          {/* Post placeholder 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-zinc-700" />
              <div className="h-2 w-16 rounded bg-zinc-700" />
            </div>
            <div className="h-32 rounded bg-gradient-to-br from-purple-900/50 to-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Auth layout — two-column desktop, form-only on mobile
   ───────────────────────────────────────────────────────────────── */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex">
      {/* ── LEFT PANEL (desktop only) ──────────────────────────── */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-0">
          <AppIcon size={80} />
          <PhoneMockup />
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
