import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unified Business Data Portal · DeView",
  description: "Internal operational portal — unified search and customer 360 (MVP scaffold).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
