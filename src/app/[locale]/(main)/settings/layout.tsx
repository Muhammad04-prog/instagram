import type { ReactNode } from "react";
import { SettingsNav } from "@/components/settings/SettingsNav";

/** Settings shell (img39): menu on the left, the selected screen on the right. */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <div className="border-ig-border bg-ig-bg w-[315px] shrink-0 overflow-y-auto border-r">
        <SettingsNav />
      </div>
      <main className="bg-ig-bg flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[640px] px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
