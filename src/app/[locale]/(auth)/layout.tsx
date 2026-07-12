import type { ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────
   Custom gradient camera icon — not Meta's actual logo.
   Visually inspired (rounded square + camera glyph), not copied.
   ───────────────────────────────────────────────────────────────── */
function AppIcon({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="App icon"
    >
      <defs>
        <linearGradient id="ig-icon-grad" x1="0" y1="96" x2="96" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#f9a825" />
          <stop offset="28%"  stopColor="#e91e63" />
          <stop offset="65%"  stopColor="#9c27b0" />
          <stop offset="100%" stopColor="#3949ab" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="96" height="96" rx="22" fill="url(#ig-icon-grad)" />
      {/* Camera body */}
      <rect x="18" y="32" width="60" height="38" rx="8" stroke="white" strokeWidth="4" fill="none" />
      {/* Viewfinder bump */}
      <path d="M36 32v-6a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v6" stroke="white" strokeWidth="4" fill="none" />
      {/* Lens ring */}
      <circle cx="48" cy="51" r="11" stroke="white" strokeWidth="4" fill="none" />
      {/* Flash dot */}
      <circle cx="69" cy="40" r="3" fill="white" />
    </svg>
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
