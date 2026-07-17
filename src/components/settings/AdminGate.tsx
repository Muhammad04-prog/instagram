"use client";

import { useTranslations } from "next-intl";
import { AdminPanel } from "@/components/settings/AdminPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";

/**
 * Shows the panel only to an ADMIN.
 *
 * This is **not** the security boundary — every /admin endpoint is guarded
 * server-side and answers 403 regardless. It exists so a normal user is not
 * shown a screen that can only refuse them.
 */
export function AdminGate() {
  const t = useTranslations("admin");
  const { user, isReady } = useAuth();

  if (!isReady) return <Loader className="py-10" />;
  if (user?.role !== "ADMIN") return <EmptyState title={t("forbidden")} className="py-10" />;

  return <AdminPanel />;
}
