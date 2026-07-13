"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  tg: "Тоҷикӣ",
};

/**
 * Switching locale re-navigates to the same route under the new locale; next-intl
 * persists the choice in the NEXT_LOCALE cookie.
 */
export function LanguageSwitcher() {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-1">
      {routing.locales.map((value) => (
        <button
          key={value}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => router.replace(pathname, { locale: value }))}
          className={cn(
            "hover:bg-ig-bg-secondary flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm",
            value === locale ? "text-ig-text font-semibold" : "text-ig-text",
          )}
        >
          <span className="flex-1 text-left">{LABELS[value]}</span>
          {value === locale ? <span className="bg-ig-primary size-2 rounded-full" /> : null}
        </button>
      ))}
      <p className="text-ig-text-secondary px-2 pt-2 text-xs">{t("languageHint")}</p>
    </div>
  );
}
