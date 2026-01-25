"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, FileText } from "lucide-react";

/**
 * App Sidebar Component
 * 
 * Story 2.13:
 * - AC8: Desktop navigation with Sidebar component
 * - AC9: Collapsible on desktop, Sheet on mobile
 * - AC10: Active state highlighting
 * - AC11: Navigation links (Dashboard, Settings, Documentation)
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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <h2 className="text-lg font-semibold">Orylo</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.external
              ? false
              : pathname === item.href || 
                (item.href === "/dashboard" && pathname.startsWith("/dashboard"));

            if (item.external) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={(props) => (
                      <a
                        {...props}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </a>
                    )}
                    tooltip={item.title}
                    isActive={false}
                  />
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={(props) => (
                    <Link {...props} href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                  tooltip={item.title}
                  isActive={isActive}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
