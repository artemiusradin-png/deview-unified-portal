import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/components/LanguageSwitcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unified Business Data Portal · DeView",
  description: "Internal operational portal — unified search and customer 360 (MVP scaffold).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
