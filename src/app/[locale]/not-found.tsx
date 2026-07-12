import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <EmptyState
        title={t("notFound")}
        description={t("notFoundDescription")}
        action={
          <Link href={ROUTES.home} className="text-ig-primary text-sm font-semibold">
            {t("backHome")}
          </Link>
        }
      />
    </div>
  );
}
