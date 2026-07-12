import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Instagram",
    template: "%s • Instagram",
  },
  description: "Share photos and videos with your friends.",
};

// The locale layout renders <html>/<body>; this root layout only wires globals.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
