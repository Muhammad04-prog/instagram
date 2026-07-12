export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Rasterises the crop react-easy-crop reports back into a new File, so the API
 * receives exactly what the user framed (add-post takes the raw Images[]).
 * Videos are never cropped — they are uploaded untouched.
 */
export async function cropImageToFile(file: File, area: CropArea): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);

  const context = canvas.getContext("2d");
  if (!context) return file;

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
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}
