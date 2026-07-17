import { http } from "@/lib/axios";
import type { DeletedKeyDto, UploadedMediaDto } from "@/types/api.types";

/**
 * Swagger tag: upload (2 endpoints).
 *
 * A standalone media pipe for flows that need a URL *before* the entity exists —
 * a highlight cover, a live cover. Posts and stories upload their own media as
 * part of creating the row, so they do not go through here.
 *
 * The backend answers with `key` + `url`: keep the key, it is what deletes the
 * file later.
 */
export const uploadService = {
  /** Up to 10 files: photo / video / audio. */
  upload: (files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    return http.post<UploadedMediaDto[]>("/upload", form);
  },

  remove: (key: string) => http.delete<DeletedKeyDto>(`/upload/${encodeURIComponent(key)}`),
};
