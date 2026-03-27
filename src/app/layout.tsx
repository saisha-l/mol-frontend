import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Molecular Discovery Platform",
  description: "ADMET profiling, protein target lookup, and drug similarity search",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}