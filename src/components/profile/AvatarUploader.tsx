"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useDeleteAvatar, useUpdateAvatar } from "@/hooks/useProfile";
import { profileFullName, type UserProfile } from "@/types/profile.types";

/**
 * The card at the top of "Edit profile" (docs/screenshots/img43): avatar,
 * username + full name, and a blue "New photo" button. Removing the photo is
 * behind a confirm, as IG does.
 */
export function AvatarUploader({ profile }: { profile: UserProfile }) {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = useUpdateAvatar();
  const remove = useDeleteAvatar();
  const busy = update.isPending || remove.isPending;

  const onPick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(tErrors("imageOnly"));
      return;
    }
    update.mutate(file, { onSuccess: () => toast.success(t("photoUpdated")) });
  };

  return (
    <div className="bg-ig-bg-secondary border-ig-border flex items-center gap-4 rounded-2xl border px-4 py-3">
      <UserAvatar src={profile.image} alt={profile.userName} size={56} />

      <div className="min-w-0 flex-1">
        <p className="text-ig-text truncate text-sm font-semibold">{profile.userName}</p>
        <p className="text-ig-text-secondary truncate text-sm">{profileFullName(profile)}</p>
      </div>

      <div className="flex items-center gap-3">
        {profile.image ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            className="text-ig-danger text-sm font-semibold disabled:opacity-50"
          >
            {t("removePhoto")}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("newPhoto")}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          onPick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {/* The warning is not cosmetic: delete-user-image-profile sets image = null
          and the backend's own login then 500s for this account until a new photo
          is uploaded (docs/BACKEND_BUGS.md #1). */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("removePhotoConfirm")}
        description={t("removePhotoWarning")}
        warnDescription
        confirmLabel={t("removePhoto")}
        onConfirm={() =>
          remove.mutate(undefined, { onSuccess: () => toast.success(t("photoRemoved")) })
        }
      />
    </div>
  );
}
