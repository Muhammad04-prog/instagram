"use client";

import { useTranslations } from "next-intl";
import { DotsIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { ROUTES, SITE_URL } from "@/lib/constants";
import type { PostDto } from "@/types/post.types";
import { toast } from "sonner";

/**
 * The reel action rail's "..." — real Instagram's menu, minus the two items
 * with no backend support (`docs/API_MAP.md` has no report/embed endpoint):
 * those stay as honest client-side actions (toast / real copied snippet)
 * instead of pretending to hit a server.
 */
export function ReelMoreMenu({ post, onShare }: { post: PostDto; onShare: () => void }) {
  const t = useTranslations("post");
  const url = `${SITE_URL}${ROUTES.post(post.id)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
  };

  const copyEmbed = async () => {
    const snippet = `<iframe src="${url}" width="400" height="480" frameborder="0"></iframe>`;
    await navigator.clipboard.writeText(snippet);
    toast.success(t("embedCopied"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t("more")} className="flex flex-col items-center gap-1">
          <DotsIcon className="size-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-ig-elevated w-56">
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => toast.error(t("reportUnavailable"))}
        >
          {t("reportPost")}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.post(post.id)}>{t("goToPost")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onShare}>{t("shareEllipsis")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyLink()}>{t("copyLink")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyEmbed()}>{t("embed")}</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.profile(post.author.id)}>{t("aboutAccount")}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
