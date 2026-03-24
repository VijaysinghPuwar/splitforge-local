import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitForge Local",
  description: "Split large text files into numbered chunks — 100% local, zero cloud.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-white min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
