import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NetLab Coach",
  description: "AI lab helper for IT and networking students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
