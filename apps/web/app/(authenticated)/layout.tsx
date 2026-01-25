import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { MobileNav } from "@/components/mobile-nav";

/**
 * Authenticated Layout
 * 
 * Navigation header layout for authenticated pages
 * - Desktop: Horizontal navigation header
 * - Mobile: Header with MobileNav (Sheet)
 * - Wraps authenticated pages (dashboard, settings)
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify session
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Header */}
      <AppHeader />
      
      {/* Mobile Header with Menu */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
        <div className="container flex h-14 items-center">
          <MobileNav />
          <div className="flex flex-1 items-center justify-center">
            <h2 className="text-lg font-semibold">Orylo</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
