"use client";

import { Check, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useUpdateSettings } from "@/hooks/useSettings";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const REAL_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  tg: "Тоҷикӣ",
};

/**
 * Decorative-only entries — visual fidelity with img (Языковые предпочтения),
 * not functional locales. `next-intl` only ships en/ru/tg; picking one of
 * these does nothing, same as any UI mock without a backing feature.
 */
const DECORATIVE = [
  "Afrikaans",
  "العربية",
  "Čeština",
  "Dansk",
  "Deutsch",
  "Ελληνικά",
  "English (UK)",
  "Español (España)",
  "Español (Latinoamérica)",
  "فارسی",
  "Suomi",
  "Français",
  "עברית",
  "हिन्दी",
  "Hrvatski",
  "Magyar",
  "Bahasa Indonesia",
  "Italiano",
  "日本語",
  "한국어",
  "Bahasa Melayu",
  "Nederlands",
  "Norsk",
  "Polski",
  "Português (Brasil)",
  "Português (Portugal)",
  "Română",
  "Slovenčina",
  "Svenska",
  "ไทย",
  "Türkçe",
  "Українська",
  "Tiếng Việt",
  "中文(简体)",
  "中文(繁體)",
];

export function LanguagePreferences() {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const updateSettings = useUpdateSettings();

  const rows = useMemo(() => {
    const real = routing.locales.map((value) => ({ value, label: REAL_LABELS[value], real: true }));
    const decorative = DECORATIVE.map((label) => ({ value: label, label, real: false }));
    const all = [...real, ...decorative];
    const active = all.find((row) => row.real && row.value === locale);
    const rest = all.filter((row) => !(row.real && row.value === locale));
    const ordered = active ? [active, ...rest] : all;

    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter((row) => row.label.toLowerCase().includes(q));
  }, [locale, query]);

  return (
    <div className="max-w-[560px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("language")}</h2>
      <p className="text-ig-text-secondary text-sm">{t("languageHint")}</p>

      <div className="relative">
        <Search className="text-ig-text-secondary pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="bg-ig-bg-secondary text-ig-text placeholder:text-ig-text-secondary h-11 w-full rounded-xl pr-4 pl-11 text-sm outline-none"
        />
      </div>

      <ul className="max-h-[480px] overflow-y-auto">
        {rows.map((row) => {
          const active = row.real && row.value === locale;
          return (
            <li key={row.label}>
              <button
                type="button"
                disabled={!row.real || pending}
                onClick={() => {
                  if (!row.real) return;
                  // Fire-and-forget: the account-wide preference is a nice-to-have
                  // sync, not something the navigation should wait on.
                  updateSettings.mutate({ language: row.value });
                  startTransition(() => router.replace(pathname, { locale: row.value as Locale }));
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm",
                  row.real
                    ? "hover:bg-ig-bg-secondary cursor-pointer"
                    : "cursor-default opacity-70",
                  active ? "text-ig-text font-semibold" : "text-ig-text",
                )}
              >
                <span className="flex-1">{row.label}</span>
                {active ? <Check className="text-ig-text size-4 shrink-0" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
