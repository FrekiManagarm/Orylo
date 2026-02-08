"use client";

import { useMemo, Fragment } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { breadcrumbProList } from "@/lib/config/breadcrumb-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const breadcrumb = breadcrumbProList();

  const trail = useMemo(() => {
    const items: { title: string; href: string }[] = [];
    for (const item of breadcrumb) {
      if (pathname.startsWith(item.href)) {
        items.push({ title: item.title, href: item.href });
        if (
          Array.isArray(
            (item as { items: { title: string; href: string }[] }).items,
          ) &&
          (item as { items: { title: string; href: string }[] }).items.length >
          0
        ) {
          let deepest = null as null | { title: string; href: string };
          for (const sub of (
            item as { items: { title: string; href: string }[] }
          ).items as {
            title: string;
            href: string;
          }[]) {
            if (pathname.startsWith(sub.href)) {
              if (!deepest || sub.href.length > deepest.href.length) {
                deepest = { title: sub.title, href: sub.href };
              }
            }
          }
          if (deepest) items.push(deepest);
        }
      }
    }
    if (items.length === 0 && breadcrumb[0]) {
      items.push({
        title: breadcrumb[0].title as string,
        href: breadcrumb[0].href as string,
      });
    }
    return items;
  }, [breadcrumb, pathname]);

  return (
    <header className="flex flex-row justify-between items-center h-18 px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border border-white/10 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-indigo-500/50 transition-all p-0"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-8 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList className="gap-2">
            {trail.map((crumb, index) => {
              const isLast = index === trail.length - 1;
              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-white font-medium font-mono text-sm">
                        {crumb.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={
                          <Link
                            href={crumb.href}
                            className="text-zinc-400 hover:text-white font-mono text-sm transition-colors"
                          >
                            {crumb.title}
                          </Link>
                        }
                      />
                    )}
                  </BreadcrumbItem>
                  {!isLast ? (
                    <BreadcrumbSeparator className="text-zinc-600" />
                  ) : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}