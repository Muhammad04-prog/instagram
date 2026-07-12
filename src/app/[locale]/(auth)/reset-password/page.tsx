import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

/** Reached from the emailed link: /reset-password?token=…&email=… */
export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { token = "", email = "" } = await searchParams;

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <ResetPasswordForm token={token} email={email} />
    </main>
  );
}
