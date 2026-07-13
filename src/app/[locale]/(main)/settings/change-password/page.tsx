import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export const metadata: Metadata = { title: "Change password" };

// The full settings shell (sidebar, theme, language) lands in Phase 10.
export default async function ChangePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The Settings shell (layout) already supplies the page frame and the left menu.
  return (
    <div className="max-w-[640px]">
      <ChangePasswordForm />
    </div>
  );
}
