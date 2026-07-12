"use client";

import { useTranslations } from "next-intl";
import { HeartIcon, MessageIcon } from "@/components/icons";
import { InstagramWordmark } from "@/components/icons/InstagramLogo";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/** Mobile top bar — 44px (ТЗ §5). No screenshot exists for mobile (INDEX §2). */
export function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="border-ig-border bg-ig-bg h-navbar fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b px-4 md:hidden">
      <Link href={ROUTES.home}>
        <InstagramWordmark className="text-[24px]" />
      </Link>

      <div className="flex items-center gap-5">
        <Link href={ROUTES.home} aria-label={t("notifications")} className="relative">
          <HeartIcon className="text-ig-text size-6" />
          <span className="bg-ig-badge absolute -top-0.5 -right-0.5 size-2 rounded-full" />
        </Link>
        <Link href={ROUTES.chat} aria-label={t("messages")}>
          <MessageIcon className="text-ig-text size-6" />
        </Link>
      </div>
    </header>
  );
}
