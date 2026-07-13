import type { ReactNode } from "react";
import { SettingsNav } from "@/components/settings/SettingsNav";

/** Settings shell (img39): menu on the left, the selected screen on the right. */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 py-8 md:flex-row md:px-6">
      <SettingsNav />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
