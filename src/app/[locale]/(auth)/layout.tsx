import type { ReactNode } from "react";
import { AuthFooter } from "@/components/auth/AuthFooter";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-auth-bg flex min-h-dvh flex-col">
      {children}
      <AuthFooter />
    </div>
  );
}
