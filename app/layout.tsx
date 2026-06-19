import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PT Neo Pudji Jaya — Sistem Evaluasi CV",
  description: "Sistem evaluasi CV berbasis AI untuk tim rekrutmen PT Neo Pudji Jaya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
