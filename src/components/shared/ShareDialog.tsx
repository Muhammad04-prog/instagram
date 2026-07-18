"use client";

import { Link2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { FacebookIcon, ThreadsIcon, WhatsAppIcon, XIcon } from "@/components/icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * Instagram's "Поделиться" sheet, external row only — no contact/DM grid
 * (backend has no share-to-user endpoint, see docs/API_MAP.md). `url` is the
 * absolute post link built by the caller (`${SITE_URL}${ROUTES.post(id)}`).
 */
export function ShareDialog({
  open,
  onOpenChange,
  url,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}) {
  const t = useTranslations("post");
  const encoded = encodeURIComponent(url);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
    onOpenChange(false);
  };

  const openShare = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated w-[400px] rounded-xl p-6">
        <DialogTitle className="text-ig-text text-center text-base font-semibold">
          {t("shareTitle")}
        </DialogTitle>

        <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
          <ShareTarget label={t("copyLink")} onClick={() => void copyLink()} icon={<Link2 />} />
          <ShareTarget
            label="Facebook"
            onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`)}
            icon={<FacebookIcon />}
          />
          <ShareTarget
            label="WhatsApp"
            onClick={() => openShare(`https://api.whatsapp.com/send?text=${encoded}`)}
            icon={<WhatsAppIcon />}
          />
          <ShareTarget
            label="Email"
            href={`mailto:?body=${encoded}`}
            onClick={() => onOpenChange(false)}
            icon={<Mail />}
          />
          <ShareTarget
            label="X"
            onClick={() => openShare(`https://twitter.com/intent/tweet?url=${encoded}`)}
            icon={<XIcon />}
          />
          <ShareTarget
            label="Threads"
            onClick={() => openShare(`https://www.threads.net/intent/post?text=${encoded}`)}
            icon={<ThreadsIcon />}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareTarget({
  label,
  icon,
  onClick,
  href,
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const button = (
    <span className="bg-ig-bg-secondary text-ig-text flex size-12 items-center justify-center rounded-full [&_svg]:size-5">
      {icon}
    </span>
  );

  const className = "flex flex-col items-center gap-1.5 text-center";

  if (href) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {button}
        <span className="text-ig-text-secondary text-xs">{label}</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {button}
      <span className="text-ig-text-secondary text-xs">{label}</span>
    </button>
  );
}
