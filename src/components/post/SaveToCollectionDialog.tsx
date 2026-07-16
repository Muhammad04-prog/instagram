"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSavePost } from "@/hooks/usePosts";
import type { PostDto } from "@/types/post.types";

/**
 * "Save to collection" — the `collection` field on `POST /posts/{id}/favorite`.
 *
 * The API takes a collection **name**, not an id, and has no endpoint listing
 * collections — so this offers a free-text name rather than a picker over
 * something we cannot read back. Saving with no name is the plain save.
 */
export function SaveToCollectionDialog({
  post,
  open,
  onOpenChange,
}: {
  post: PostDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const save = useSavePost();

  const submit = (collection?: string) =>
    save.mutate(
      { post, collection },
      {
        onSuccess: () => {
          toast.success(collection ? t("savedToCollection", { name: collection }) : t("saved"));
          setName("");
          onOpenChange(false);
        },
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated w-[400px] gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b px-4 py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-semibold">
            {t("saveToCollection")}
          </DialogTitle>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const collection = name.trim();
            if (collection) submit(collection);
          }}
          className="space-y-4 p-4"
        >
          <p className="text-ig-text-secondary text-sm">{t("collectionHint")}</p>

          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            maxLength={50}
            placeholder={t("collectionPlaceholder")}
            className="border-ig-border text-ig-text h-11 rounded-lg"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submit(undefined)}
              disabled={save.isPending}
              className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover flex-1 rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
            >
              {t("justSave")}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || save.isPending}
              className="bg-ig-primary hover:bg-ig-primary-hover flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {tCommon("save")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
