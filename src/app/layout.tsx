import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitForge — Split text files locally",
  description: "Split large text into numbered chunks. Runs entirely in your browser — nothing is uploaded.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
