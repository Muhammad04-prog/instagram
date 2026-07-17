/**
 * Instagram photo filters, as CSS.
 *
 * The API stores a filter **by name** (`PostMediaDto.filter`, and `filters` on
 * `POST /posts`), not baked pixels — so the name has to round-trip: picked in
 * the create stepper, sent as a string, handed back on the post, and applied
 * here at display time. That is why these are CSS declarations rather than a
 * canvas bake: re-rendering must reproduce exactly what the author previewed.
 *
 * Names match img31 (Aden, Clarendon, Crema, Gingham, Juno, Lark, Ludwig, Moon)
 * and are sent lower-case, which is what Swagger's example shows
 * ("clarendon,gingham").
 */

export interface PhotoFilter {
  /** Wire value — lower-case, as in Swagger's `filters` example. */
  id: string;
  /** Label shown under the thumbnail. "Original" is translated, the rest are brand names. */
  label: string;
  /** CSS `filter` value; empty for the original. */
  css: string;
}

export const ORIGINAL_FILTER = "original";

/** img31's grid, in its order: Aden, Clarendon, Crema, Gingham, Juno, Lark, Ludwig, Moon. */
export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: ORIGINAL_FILTER, label: "Original", css: "" },
  {
    id: "aden",
    label: "Aden",
    css: "sepia(0.2) brightness(1.15) saturate(1.4) hue-rotate(-20deg)",
  },
  { id: "clarendon", label: "Clarendon", css: "contrast(1.2) saturate(1.35) brightness(1.1)" },
  { id: "crema", label: "Crema", css: "sepia(0.5) contrast(1.25) brightness(1.15) saturate(0.9)" },
  { id: "gingham", label: "Gingham", css: "brightness(1.05) hue-rotate(-10deg) sepia(0.15)" },
  { id: "juno", label: "Juno", css: "sepia(0.35) contrast(1.15) brightness(1.15) saturate(1.8)" },
  { id: "lark", label: "Lark", css: "sepia(0.25) contrast(0.9) brightness(1.3) saturate(1.2)" },
  { id: "ludwig", label: "Ludwig", css: "sepia(0.25) contrast(1.05) brightness(1.05) saturate(2)" },
  { id: "moon", label: "Moon", css: "grayscale(1) contrast(1.1) brightness(1.1)" },
];

/** The CSS for a stored filter name. Unknown or missing → no filter, never a crash. */
export function filterCss(id: string | null | undefined): string | undefined {
  if (!id || id === ORIGINAL_FILTER) return undefined;
  return PHOTO_FILTERS.find((filter) => filter.id === id)?.css || undefined;
}

/**
 * Manual adjustments — img32's "Настройки" tab.
 *
 * These have **no field in the API**: a post's media carries `filter` and
 * nothing else. So unlike filters they cannot round-trip, and are baked into the
 * uploaded pixels instead (see `applyAdjustments` in `lib/image.ts`) — the same
 * way the crop already is. Bake once, and every viewer sees what was intended.
 */
export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  /** Warm ⇄ cool, expressed as a sepia/hue mix. */
  temperature: number;
  vignette: number;
}

export const NEUTRAL_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  vignette: 0,
};

export const ADJUSTMENT_KEYS = [
  "brightness",
  "contrast",
  "saturation",
  "temperature",
  "vignette",
] as const;

export function isNeutral(adjustments: Adjustments): boolean {
  return ADJUSTMENT_KEYS.every((key) => adjustments[key] === 0);
}

/** Sliders run -100…100; CSS wants multipliers around 1. */
export function adjustmentsCss(adjustments: Adjustments): string {
  const parts = [
    `brightness(${1 + adjustments.brightness / 200})`,
    `contrast(${1 + adjustments.contrast / 200})`,
    `saturate(${1 + adjustments.saturation / 100})`,
  ];

  // Warm = sepia, cool = a slight hue shift; one slider, two directions.
  if (adjustments.temperature > 0) parts.push(`sepia(${adjustments.temperature / 200})`);
  if (adjustments.temperature < 0) parts.push(`hue-rotate(${adjustments.temperature / 10}deg)`);

  return parts.join(" ");
}

/** Preview CSS for the create stepper: the chosen filter *and* the live sliders. */
export function previewCss(filterId: string, adjustments: Adjustments): string {
  return [filterCss(filterId), adjustmentsCss(adjustments)].filter(Boolean).join(" ");
}
