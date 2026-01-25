import Link from "next/link";
import { Separator } from "@/components/ui/separator";

/**
 * Footer Component
 * 
 * Story 2.14:
 * - AC8: Footer with links: Documentation, Privacy Policy, Terms of Service
 */
export function LandingFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              © 2026 Orylo. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 md:gap-6">
            <Link
              href="https://docs.orylo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
