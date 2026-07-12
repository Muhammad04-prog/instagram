import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AuthPromo } from "@/components/auth/AuthPromo";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

/** Split layout from docs/screenshots/img7: promo left, form right. */
export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-1">
      <AuthPromo />
      <section className="border-auth-divider flex flex-1 items-center justify-center px-6 lg:max-w-[810px] lg:border-l">
        <LoginForm />
      </section>
    </main>
  );
}
