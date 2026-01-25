"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";

/**
 * App Header Component
 * 
 * Navigation header for authenticated pages
 * - Desktop: Horizontal navigation bar with user menu
 * - Mobile: Uses MobileNav component (Sheet)
 */

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Settings",
    href: "/settings/stripe",
    icon: Settings,
  },
  {
    title: "Documentation",
    href: "https://docs.orylo.com",
    icon: FileText,
    external: true,
  },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Orylo</h2>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.external
              ? false
              : pathname === item.href ||
                (item.href === "/dashboard" && pathname.startsWith("/dashboard"));

            if (item.external) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </a>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "bg-accent text-accent-foreground font-semibold"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
