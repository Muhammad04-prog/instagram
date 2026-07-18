/**
 * The "from Meta" lockup shown on the splash — a stylised infinity ribbon in
 * Meta's blue gradient followed by the wordmark. Drawn (not an image) so it
 * stays crisp and needs no remote asset.
 */
export function MetaLogo({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <svg width="30" height="20" viewBox="0 0 30 20" fill="none" role="img" aria-label="Meta">
        <defs>
          <linearGradient
            id="meta-mark"
            x1="0"
            y1="0"
            x2="30"
            y2="20"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0064E1" />
            <stop offset="40%" stopColor="#0080FF" />
            <stop offset="100%" stopColor="#00C6FF" />
          </linearGradient>
        </defs>
        {/* Two loops meeting in the middle → the Meta ribbon. */}
        <path
          d="M4.2 15.5c-1.9 0-3.2-1.7-3.2-4.3C1 7.6 2.9 4.5 5.4 4.5c1.9 0 3.4 1.6 4.9 4l1.4 2.3 1.4-2.3c1.6-2.6 3.1-4 5-4 2.6 0 4.4 3 4.4 6.6 0 2.7-1.3 4.4-3.2 4.4-1.6 0-2.9-1.1-4.6-3.9L14 10.4l-.6 1c-1.7 2.8-3 3.9-4.6 3.9-1.5 0-2.6-1-3.2-2.6"
          stroke="url(#meta-mark)"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.5px",
          color: "var(--ig-text)",
        }}
      >
        Meta
      </span>
    </span>
  );
}
