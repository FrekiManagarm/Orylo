import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies, headers } from "next/headers";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/layout/dashboard-sidebar";
import { auth } from "@/lib/auth/auth";
import { Organization } from "@orylo/database";
import { Toaster } from "sonner";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value === "true";

  const [session, organizations, org] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listOrganizations({
      headers: await headers(),
    }),
    auth.api.getFullOrganization({
      headers: await headers(),
    }),
  ]);

  if (!session) {
    redirect("/sign-in");
  }

  if (!organizations.length || !org?.id) {
    redirect("/create-organization");
  }

  if (!org?.id) {
    redirect("/select-organization");
  }

  return (
    <SidebarProvider defaultOpen={sidebarOpen} className="dark bg-black">
      <div className="flex w-screen h-screen">
        <DashboardSidebar
          session={session}
          organizations={organizations as Organization[]}
        />
        <SidebarInset className="relative overflow-hidden">
          {/* Halo en haut à droite — visible sur toutes les pages du dashboard */}
          <div className="absolute top-0 right-0 w-md h-112 bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3" />
          <DashboardHeader />
          <div className="relative w-full overflow-y-auto mb-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default DashboardLayout;