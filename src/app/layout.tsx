import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Survey App",
  description: "Create and share surveys easily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
