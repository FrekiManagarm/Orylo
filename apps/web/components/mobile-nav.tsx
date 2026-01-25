"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, Settings, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MobileNav Component
 * 
 * Story 2.6:
 * - AC1: Hamburger icon trigger (top-left)
 * - AC2: Shadcn Sheet (slide-in from left)
 * - AC3: Navigation links (Dashboard, Settings, Docs, Logout)
 * - AC4: Active state highlighting
 * - AC5: Close via swipe, X button, click outside, Escape
 * - AC6: Smooth slide animation (300ms)
 * - AC7: Focus trap when open
 * 
 * Story 2.11:
 * - AC6: Tap targets ≥44px
 */

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
};

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Documentation",
    href: "https://docs.orylo.com",
    icon: FileText,
    external: true,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // AC4: Check if link is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard");
    }
    return pathname === href;
  };

  // Handle logout (will be implemented with Better Auth)
  const handleLogout = async () => {
    try {
      // TODO: Implement Better Auth logout in a later story
      console.log("Logout triggered");
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* AC1: Hamburger icon trigger - Story 2.11: 44px tap target */}
      <SheetTrigger>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-11 w-11 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      {/* AC2: Sheet content (slide-in from left) */}
      <SheetContent
        side="left"
        className="w-[280px] sm:w-[320px]"
        aria-labelledby="mobile-nav-title"
      >
        <SheetHeader>
          <SheetTitle id="mobile-nav-title">Navigation</SheetTitle>
        </SheetHeader>

        {/* AC3: Navigation links */}
        <nav className="flex flex-col gap-2 mt-6" role="navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  // AC4: Active state highlighting
                  active && "bg-accent text-accent-foreground font-semibold"
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          {/* AC3: Logout button - Story 2.11: 44px tap target */}
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 min-h-[44px]"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
