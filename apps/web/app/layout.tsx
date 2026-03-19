import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyBloom Terminal",
  description: "Ultimate Crypto Bloomberg Terminal + AI Trading Studio",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-screen bg-polybloom-dark">{children}</div>
      </body>
    </html>
  );
}
