"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { uploadService } from "@/services/upload.service";

/**
 * The standalone media pipe, for flows that need a URL *before* the thing that
 * will hold it exists — a live cover is uploaded, then handed to `/live/start`.
 *
 * Posts and stories do not come through here: they send their media as part of
 * creating the row.
 */
export function useUploadMedia() {
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (file: File) => uploadService.upload([file]),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * Deletes an uploaded file by its key.
 *
 * Used when someone picks a cover and then changes their mind: without this the
 * file would sit in storage forever, referenced by nothing. Failure is silent on
 * purpose — the user is discarding something, and an error about a file they
 * already stopped caring about is noise they cannot act on.
 */
export function useRemoveUpload() {
  return useMutation({
    mutationFn: (key: string) => uploadService.remove(key),
    onError: () => undefined,
  });
}
