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
    <div className="flex flex-row justify-between items-center h-16 px-4 py-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-10 w-10 rounded-xl bg-card border-border transition-all duration-300 hover:shadow-md p-0 m-0"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-4 bg-border" />
        <Breadcrumb>
          <BreadcrumbList>
            {trail.map((crumb, index) => {
              const isLast = index === trail.length - 1;
              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink>
                        <Link href={crumb.href}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}