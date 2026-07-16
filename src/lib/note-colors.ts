/**
 * Note background colours.
 *
 * `bgColor` is a free hex string on the wire, so these are just the swatches the
 * picker offers — anything the server hands back is rendered as-is, and a note
 * from another client with its own colour still looks right.
 */
export const NOTE_COLORS = ["#262626", "#0095f6", "#8a3ab9", "#e1306c", "#f09433", "#00b74a"];

export const DEFAULT_NOTE_COLOR = NOTE_COLORS[0]!;

/**
 * Black text on a light background, white on a dark one.
 *
 * Relative luminance, not a guess: a picker colour can be anything, and text
 * that a user cannot read is worse than no colour at all.
 */
export function noteTextColor(bg: string | null | undefined): string {
  const hex = (bg ?? DEFAULT_NOTE_COLOR).replace("#", "");
  if (hex.length !== 6) return "#ffffff";

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);

  return luminance > 0.5 ? "#000000" : "#ffffff";
}
