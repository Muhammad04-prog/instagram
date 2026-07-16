import { adjustmentsCss, isNeutral, type Adjustments } from "@/lib/filters";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Rasterises the crop react-easy-crop reports back into a new File, so the API
 * receives exactly what the user framed (`POST /posts` takes raw media).
 * Videos are never cropped — they are uploaded untouched.
 *
 * `adjustments` (img32's Brightness / Contrast / … sliders) are **baked in
 * here**, because the API has no field for them: media carries `filter` and
 * nothing else. Filters, which do have a field, are deliberately *not* baked —
 * they travel by name and are applied at display time, so they stay editable.
 */
export async function cropImageToFile(
  file: File,
  area: CropArea,
  adjustments?: Adjustments,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);

  const context = canvas.getContext("2d");
  if (!context) return file;

  // Canvas takes the same syntax as the CSS property, so the bake and the
  // preview cannot drift apart.
  if (adjustments && !isNeutral(adjustments)) context.filter = adjustmentsCss(adjustments);

  context.drawImage(
    bitmap,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  if (adjustments && adjustments.vignette > 0) drawVignette(context, canvas, adjustments.vignette);

  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

/**
 * Darkened corners — img32's "Виньетка".
 *
 * `context.filter` cannot express it (it is a position-dependent effect, not a
 * per-pixel one), so it is painted as a radial gradient over the drawn image.
 */
function drawVignette(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  strength: number,
): void {
  const { width, height } = canvas;
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );

  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${Math.min(strength, 100) / 125})`);

  // The gradient must not be filtered again by the adjustment above.
  context.filter = "none";
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}
