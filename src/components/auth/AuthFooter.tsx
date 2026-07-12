import { useTranslations } from "next-intl";

/** Static footer link row (docs/screenshots/img2, img5, img6). */
const FOOTER_KEYS = [
  "meta",
  "about",
  "blog",
  "jobs",
  "help",
  "api",
  "privacy",
  "terms",
  "locations",
  "instagramLite",
  "metaAi",
  "threads",
] as const;

export function AuthFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="text-ig-text-secondary flex flex-col items-center gap-3 px-4 py-6 text-xs">
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {FOOTER_KEYS.map((key) => (
          <li key={key}>
            <span className="hover:underline">{t(key)}</span>
          </li>
        ))}
      </ul>
      <p>{t("copyright", { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
