/**
 * The Instagram app mark: rounded square with the brand gradient, camera outline
 * on top. Drawn (not an image asset) so it stays crisp at any size.
 */
export function InstagramGlyph({ size = 88, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Instagram"
    >
      <defs>
        <radialGradient id="ig-glyph" cx="0.3" cy="1.05" r="1.15">
          <stop offset="0%" stopColor="#FFD776" />
          <stop offset="25%" stopColor="#F5A45D" />
          <stop offset="50%" stopColor="#E43E5D" />
          <stop offset="72%" stopColor="#C32AA3" />
          <stop offset="100%" stopColor="#7B37C8" />
        </radialGradient>
      </defs>

      <rect x="1" y="1" width="62" height="62" rx="18" fill="url(#ig-glyph)" />
      <rect
        x="13"
        y="13"
        width="38"
        height="38"
        rx="11"
        stroke="#fff"
        strokeWidth="3.4"
        fill="none"
      />
      <circle cx="32" cy="32" r="9.5" stroke="#fff" strokeWidth="3.4" fill="none" />
      <circle cx="43.6" cy="20.6" r="2.6" fill="#fff" />
    </svg>
  );
}
