import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "LeadForce",
  description: "e& Business Development CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable} suppressHydrationWarning>
        <div className="app-container">
          <AppShell>
            {children}
          </AppShell>
        </div>
      </body>
    </html>
  );
}
