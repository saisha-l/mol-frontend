import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mol Platform Starter",
  description: "Molecular property predictor + visualizer starter app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}