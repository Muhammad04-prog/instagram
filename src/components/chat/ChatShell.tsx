"use client";

import type { ReactNode } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatRequestsList } from "@/components/chat/ChatRequestsList";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Two columns on desktop (img18). On mobile there is only room for one, so the
 * list gives way to the open conversation — rendered once either way, never
 * twice in the DOM.
 */
export function ChatShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const chatOpen = /^\/chat\/\d+/.test(pathname);
  // img22 replaces the left column with the request queue rather than stacking
  // a third pane — same two-column shell, different list.
  const onRequests = pathname.startsWith("/chat/requests");

  return (
    // On mobile ContentArea already reserves the top Navbar and the bottom
    // MobileNav, so a full 100dvh here would push the composer off-screen.
    <div className="flex h-[calc(100dvh-var(--ig-navbar-height)-var(--ig-mobilenav-height))] md:h-dvh">
      <div className={cn("w-full md:block md:w-auto", chatOpen && "hidden")}>
        {onRequests ? <ChatRequestsList /> : <ChatList />}
      </div>
      {children}
    </div>
  );
}
