import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Hyperspace AI | Precision Agriculture",
  description: "AI-powered drone imagery analysis for modern farming.",
};

import { LanguageProvider } from "@/hooks/useLanguage";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <Navbar />
          <div className="flex pt-16">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-8">
              {children}
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
