import { QueryProvider } from "@/components/providers/query-provider";
import { inter } from "@/lib/fonts/inter";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pindo — Vertical Video Feed",
  description: "Production-grade virtualized short-video feed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inter.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full overflow-hidden bg-black font-sans text-white"
        suppressHydrationWarning
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
