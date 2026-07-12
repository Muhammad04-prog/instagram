import type { ReactNode } from "react";
import { ContentArea } from "@/components/layout/ContentArea";
import { MobileNav } from "@/components/layout/MobileNav";
import { Navbar } from "@/components/layout/Navbar";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { Sidebar } from "@/components/layout/Sidebar";

/**
 * App shell. `modal` is the parallel-route slot that Phase 5 fills with the
 * intercepted post/story routes.
 *
 * Breakpoints (ТЗ §5): <768px mobile (top Navbar + bottom MobileNav),
 * 768–1264px collapsed sidebar, >1264px full sidebar + right column.
 */
export default function MainLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <div className="bg-ig-bg min-h-dvh">
      <Navbar />
      <Sidebar />
      <SearchPanel />
      <NotificationsPanel />

      <ContentArea>{children}</ContentArea>

      {modal}
      <MobileNav />
    </div>
  );
}
