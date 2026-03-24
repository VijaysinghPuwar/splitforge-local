import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitForge Local — Split large text files, locally",
  description:
    "A local-first desktop app that splits large text files into numbered .txt chunks. No cloud. No uploads. 100% on your machine.",
  keywords: ["text splitter", "file splitter", "local app", "tauri", "offline"],
  openGraph: {
    title: "SplitForge Local",
    description: "Split large text files into numbered chunks — 100% local, zero cloud.",
    type: "website",
    siteName: "SplitForge Local",
  },
  twitter: {
    card: "summary_large_image",
    title: "SplitForge Local",
    description: "Split large text files into numbered chunks — 100% local, zero cloud.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
