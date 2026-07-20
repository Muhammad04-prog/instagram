"use client";

import { useTranslations } from "next-intl";
import { CreatePost } from "@/components/post/CreatePost";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";

/**
 * «Создание публикации» laid over the feed, the way IG opens it.
 *
 * `CreatePost` already owns the whole flow and routes home on success, so this
 * is only the shell. Closing goes `back()` rather than pushing home, so the
 * feed underneath is left exactly where it was.
 */
export function CreatePostModal() {
  const t = useTranslations("post");
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        showCloseButton={false}
        // `block`, not the base `grid`: as a grid item CreatePost sized itself
        // to its content and rendered a ~300px sliver in the middle of a wide
        // grey box instead of filling the dialog.
        // `bg-ig-elevated` + a border, not `bg-ig-bg`: in dark mode the page and
        // the card are both pure black, so an unbordered dialog had no edge and
        // read as content dumped onto the feed.
        className="bg-ig-elevated border-ig-border block w-[95vw] max-w-[900px] gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl ring-0 sm:max-w-[900px]"
      >
        <DialogTitle className="sr-only">{t("createPost")}</DialogTitle>
        <CreatePost embedded onPublished={() => router.back()} />
      </DialogContent>
    </Dialog>
  );
}
