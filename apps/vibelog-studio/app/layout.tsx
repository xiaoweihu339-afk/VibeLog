import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeLog Studio",
  description: "Create, update, and export local Vibe Repos."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
