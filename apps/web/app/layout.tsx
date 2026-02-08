import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ThemeScript } from "@/components/dashboard/components/theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orylo - Protect Your Stripe Account from Fraud | AI-Powered Detection",
  description: "Orylo detects and blocks fraud that Stripe Radar misses. Collective AI, 95%+ detection, custom rules. Start free trial.",
  openGraph: {
    title: "Orylo - Protect Your Stripe Account from Fraud",
    description: "AI-powered fraud detection for Stripe merchants",
    type: "website",
  },
};

/**
 * Root Layout
 * 
 * Story 2.12:
 * - AC1: Dark mode detection via system preference
 * - AC2: Uses .dark class with oklch variables from globals.css
 * - AC4: All Shadcn components auto-adapt
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <head>
        {/* Story 2.12 - AC1: System dark mode detection */}
        <ThemeScript />
      </head>
      <body
        className={`${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
