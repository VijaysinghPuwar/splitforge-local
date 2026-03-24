import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#0c0e14" };

export const metadata: Metadata = {
  title: "SplitForge — Split large text files in your browser",
  description:
    "Paste or import text, set a character limit, and export numbered .txt files or a ZIP. All processing runs locally — nothing is uploaded.",
  keywords: ["text splitter", "file splitter", "browser tool", "local processing", "offline"],
  openGraph: {
    title: "SplitForge",
    description: "Split large text into numbered files — runs entirely in your browser.",
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
