import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  /** Filled variant — active tab, liked heart, saved bookmark. */
  filled?: boolean;
};

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  width: 24,
  height: 24,
  "aria-hidden": true,
} as const;

/** Instagram uses 1.5–2px strokes on a 24px grid, joins rounded. */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function HomeIcon({ filled, ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z"
      />
    </svg>
  );
}

export function SearchIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle {...stroke} cx="10.5" cy="10.5" r="8.5" />
      <line {...stroke} x1="16.7" y1="16.7" x2="22" y2="22" />
    </svg>
  );
}

export function ExploreIcon({ filled, ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle {...stroke} cx="12" cy="12" r="10" />
      <polygon
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        points="13.941 13.941 10.059 10.059 6.5 17.5 13.941 13.941"
      />
      <polygon
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        points="10.059 10.059 13.941 13.941 17.5 6.5 10.059 10.059"
      />
    </svg>
  );
}

export function ReelsIcon({ filled, ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect {...stroke} x="2" y="2" width="20" height="20" rx="5" />
      <line {...stroke} x1="2.5" y1="7.5" x2="21.5" y2="7.5" />
      <line {...stroke} x1="7.5" y1="2.2" x2="10.5" y2="7.5" />
      <line {...stroke} x1="14" y1="2.2" x2="17" y2="7.5" />
      <path {...stroke} fill={filled ? "currentColor" : "none"} d="M10 11.5v5.5l5-2.75L10 11.5Z" />
    </svg>
  );
}

export function MessageIcon({ filled, ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        d="M22 3 2 10.2l7.4 2.8L12.2 21 22 3Z"
      />
      <line {...stroke} x1="9.4" y1="13" x2="22" y2="3" />
    </svg>
  );
}

export function HeartIcon({ filled, ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.113 1.763s.274-.588 1.113-1.763a4.21 4.21 0 0 1 3.683-1.941Z"
      />
    </svg>
  );
}

export function CommentIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path {...stroke} d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" strokeWidth={1.8} />
    </svg>
  );
}

export function ShareIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <line {...stroke} x1="22" y1="3" x2="9.2" y2="10.4" />
      <polygon {...stroke} points="11.7 20.8 22 3 2 3 9.2 10.4 11.7 20.8" />
    </svg>
  );
}

export function BookmarkIcon({ filled, ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <polygon
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        points="20 21 12 13.44 4 21 4 3 20 3 20 21"
      />
    </svg>
  );
}

export function CreateIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect {...stroke} x="2" y="2" width="20" height="20" rx="5" />
      <line {...stroke} x1="12" y1="7" x2="12" y2="17" />
      <line {...stroke} x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

export function MoreIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <line {...stroke} x1="3" y1="6" x2="21" y2="6" />
      <line {...stroke} x1="3" y1="12" x2="21" y2="12" />
      <line {...stroke} x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/** "Другие продукты" — the 3-square grid at the very bottom of the sidebar. */
export function AppsIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect {...stroke} x="8.5" y="2.5" width="7" height="7" rx="1.5" />
      <rect {...stroke} x="2" y="13.5" width="7" height="7" rx="1.5" />
      <rect {...stroke} x="15" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/** Explore compass — absent from the desktop sidebar, used in MobileNav. */
export function CompassIcon({ filled, ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle {...stroke} cx="12" cy="12" r="10" />
      <polygon
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        points="13.941 13.941 10.059 10.059 6.5 17.5 13.941 13.941"
      />
      <polygon
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        points="10.059 10.059 13.941 13.941 17.5 6.5 10.059 10.059"
      />
    </svg>
  );
}

export function DotsIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** Share-sheet row — kept monochrome outline like the rest of the set, not brand colours. */
export function FacebookIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path {...stroke} d="M15.5 8.5h-2a2 2 0 0 0-2 2V22" />
      <path {...stroke} d="M9 13.5h5" />
      <circle {...stroke} cx="12" cy="12" r="10" />
    </svg>
  );
}

export function WhatsAppIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path {...stroke} d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Z" />
      <path
        {...stroke}
        d="M8.3 8.4c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.4.2.5.6 1.5.7 1.6.1.2.1.3 0 .5-.1.2-.2.3-.4.5-.2.2-.4.4-.2.7.2.4 1 1.4 2 2.3 1.1 1 1.9 1.3 2.2 1.4.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4.1.4.1.9-.1 1.4-.3.6-1.4 1.2-1.9 1.2-.5 0-2 0-4-1.7-2.2-1.9-3.6-4.1-3.7-4.3-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.9Z"
      />
    </svg>
  );
}

export function XIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <line {...stroke} x1="4" y1="4" x2="20" y2="20" />
      <line {...stroke} x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

export function ThreadsIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        {...stroke}
        d="M12 3c-4.5 0-7.5 2.7-7.5 8.5v1c0 5.8 3 8.5 7.5 8.5s7.5-2.4 7.5-6.3c0-2.8-1.7-4.3-4.4-4.3-2.3 0-3.9 1.1-3.9 2.9 0 1.4 1 2.2 2.4 2.2 1.6 0 2.7-1.1 2.9-2.9.2-1.7-.3-4.2-2.6-5.4-1.2-.6-2.8-.7-4.2-.1"
      />
    </svg>
  );
}

/* ── Profile tabs (docs/screenshots/img35, img36, img38) ─────────────────── */

export function GridIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect {...stroke} x="3" y="3" width="18" height="18" rx="1" strokeWidth={1.5} />
      <path {...stroke} strokeWidth={1.5} d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  );
}

/** The "reposts" tab — two arrows chasing each other (IG's repost glyph). */
export function RepostIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        {...stroke}
        strokeWidth={1.5}
        d="M17 2.5 20.5 6 17 9.5M20.5 6H7a3.5 3.5 0 0 0-3.5 3.5V11M7 21.5 3.5 18 7 14.5M3.5 18H17a3.5 3.5 0 0 0 3.5-3.5V13"
      />
    </svg>
  );
}

export function TaggedIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect {...stroke} x="3" y="3" width="18" height="18" rx="3" strokeWidth={1.5} />
      <circle {...stroke} cx="12" cy="10" r="2.6" strokeWidth={1.5} />
      <path {...stroke} strokeWidth={1.5} d="M6.5 19a5.6 5.6 0 0 1 11 0" />
    </svg>
  );
}

export function SettingsIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle {...stroke} cx="12" cy="12" r="3" strokeWidth={1.5} />
      <path
        {...stroke}
        strokeWidth={1.5}
        d="M12 2.5 13.4 5a7.6 7.6 0 0 1 1.9.8l2.6-.8 1.6 2.8-1.9 1.9c.1.4.1.9 0 1.4l1.9 1.9-1.6 2.8-2.6-.8c-.6.4-1.2.6-1.9.8L12 21.5 10.6 19a7.6 7.6 0 0 1-1.9-.8l-2.6.8-1.6-2.8 1.9-1.9a5.9 5.9 0 0 1 0-1.4L4.5 11l1.6-2.8 2.6.8c.6-.4 1.2-.6 1.9-.8L12 2.5Z"
      />
    </svg>
  );
}

/* ── Grid-tile badges ────────────────────────────────────────────────────── */

/** Stacked squares — the tile holds more than one image. */
export function CarouselIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        fill="currentColor"
        d="M19 2H9a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Zm-4.5 18H7a3 3 0 0 1-3-3V9.5a1 1 0 1 0-2 0V17a5 5 0 0 0 5 5h7.5a1 1 0 0 0 0-2Z"
      />
    </svg>
  );
}

/** Play triangle in a rounded frame — the tile is a video / reel. */
export function ClipIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        fill="currentColor"
        d="M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9.5 13V8l6 4-6 4Z"
      />
    </svg>
  );
}

/** Padlock — the private-account gate, and the privacy switch in settings. */
export function LockIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect {...stroke} x="4" y="10.5" width="16" height="11" rx="2.5" strokeWidth={1.5} />
      <path {...stroke} strokeWidth={1.5} d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

/** Circular arrow — "Your activity". */
export function ActivityIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle {...stroke} cx="12" cy="12" r="9" strokeWidth={1.5} />
      <path {...stroke} strokeWidth={1.5} d="M12 7v5.2l3.4 2" />
    </svg>
  );
}

/** Crossed-out circle — blocked accounts. */
export function BlockIcon({ ...props }: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle {...stroke} cx="12" cy="12" r="9" strokeWidth={1.5} />
      <path {...stroke} strokeWidth={1.5} d="m5.6 5.6 12.8 12.8" />
    </svg>
  );
}
