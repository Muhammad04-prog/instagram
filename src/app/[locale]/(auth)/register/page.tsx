import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Sign up" };

/** Single centred column (docs/screenshots/img4 + img5). */
export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <RegisterForm />
    </main>
  );
}
