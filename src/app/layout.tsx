import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Support Ledger",
  description:
    "Transparent funding pages and public payment ledgers for open-source projects, powered by Stellar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
