import { useTranslations } from "next-intl";

/** Static footer link row (docs/screenshots/img2, img5, img6). */
const FOOTER_LINKS = [
  "Meta",
  "About",
  "Blog",
  "Jobs",
  "Help",
  "API",
  "Privacy",
  "Terms",
  "Locations",
  "Instagram Lite",
  "Meta AI",
  "Threads",
];

export function AuthFooter() {
  const t = useTranslations("common");

  return (
    <footer className="text-ig-text-secondary flex flex-col items-center gap-3 px-4 py-6 text-xs">
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {FOOTER_LINKS.map((link) => (
          <li key={link}>
            <span className="hover:underline">{link}</span>
          </li>
        ))}
      </ul>
      <p>
        © {new Date().getFullYear()} {t("appName")} from Meta
      </p>
    </footer>
  );
}
