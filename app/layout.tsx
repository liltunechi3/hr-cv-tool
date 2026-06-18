import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR CV Evaluator",
  description: "AI-powered CV evaluation for HR professionals",
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
