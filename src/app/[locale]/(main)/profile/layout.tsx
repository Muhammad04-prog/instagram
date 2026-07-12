import type { ReactNode } from "react";

/** IG's profile column: 935px, centred, with the sidebar gutter already applied. */
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[935px] px-4 md:px-5">{children}</div>;
}
