import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitForge Local — Split large text files, locally",
  description:
    "A local-first desktop app that splits large text files into numbered chunks. No cloud. No uploads. 100% on your machine.",
  openGraph: {
    title: "SplitForge Local",
    description: "Split large text files into numbered chunks — 100% local, zero cloud.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
