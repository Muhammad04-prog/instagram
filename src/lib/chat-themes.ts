/**
 * Chat themes.
 *
 * `PUT /chats/{id}/theme` takes a **free string** (max 30, Swagger's example is
 * "sunset") — not an enum. So the presets live here and only the *name* travels,
 * exactly like post filters: the server stores what it is told, and both sides
 * of the conversation see the same theme because they read the same name.
 *
 * An unknown name (a theme added later, or set by another client) falls back to
 * the default rather than breaking the chat.
 */

export interface ChatTheme {
  /** Wire value — what `ThemeDto.theme` carries. */
  id: string;
  /** Tailwind classes for my own bubbles. */
  bubble: string;
  /** Swatch for the picker. */
  swatch: string;
}

export const DEFAULT_CHAT_THEME = "default";

export const CHAT_THEMES: ChatTheme[] = [
  { id: DEFAULT_CHAT_THEME, bubble: "bg-ig-primary text-white", swatch: "bg-ig-primary" },
  {
    id: "sunset",
    bubble: "bg-gradient-to-br from-[#f09433] to-[#dc2743] text-white",
    swatch: "bg-gradient-to-br from-[#f09433] to-[#dc2743]",
  },
  {
    id: "purple",
    bubble: "bg-gradient-to-br from-[#8a3ab9] to-[#4c68d7] text-white",
    swatch: "bg-gradient-to-br from-[#8a3ab9] to-[#4c68d7]",
  },
  {
    id: "forest",
    bubble: "bg-gradient-to-br from-[#0f9b0f] to-[#00b74a] text-white",
    swatch: "bg-gradient-to-br from-[#0f9b0f] to-[#00b74a]",
  },
  {
    id: "ocean",
    bubble: "bg-gradient-to-br from-[#2193b0] to-[#6dd5ed] text-white",
    swatch: "bg-gradient-to-br from-[#2193b0] to-[#6dd5ed]",
  },
  {
    id: "mono",
    bubble: "bg-ig-text text-ig-bg",
    swatch: "bg-ig-text",
  },
];

/** Classes for my bubbles under a theme name. Unknown → the default. */
export function themeBubble(theme: string | null | undefined): string {
  const found = CHAT_THEMES.find((item) => item.id === theme);
  return (found ?? CHAT_THEMES[0]!).bubble;
}
