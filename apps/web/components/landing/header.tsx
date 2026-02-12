"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 * Landing Page Header Component
 *
 * Story 2.14:
 * - AC10: Navigation: Header with logo, "Login" link (top-right), smooth scroll behavior
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/orylo-logo.png"
            alt="Orylo Logo"
            width={100}
            height={100}
          />
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 h-8 gap-1.5 px-2.5 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
