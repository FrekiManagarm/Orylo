import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { Organization } from "@orylo/database";
import { SelectOrganizationCard } from "@/components/onboarding/select-organization-card";

export const metadata: Metadata = {
  title: "Select an organization",
  description: "Choose the organization you want to work with.",
  robots: {
    index: false,
    follow: false,
  },
};

const SelectOrganizationPage = async () => {
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

  const organizationsList = (organizations ?? []) as Organization[];

  if (organizationsList.length === 0) {
    redirect("/create-organization");
  }

  console.log(org, "org");
  console.log(organizations, "organizations");
  console.log(session, "session");

  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-black text-white overflow-hidden selection:bg-primary/20 selection:text-primary">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute inset-0 flex justify-center">
        <div className="w-[520px] h-[520px] bg-indigo-500/10 rounded-full blur-3xl translate-y-[24%]" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">
            Organization switch
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Select your organization
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Choose the organization you want to work with. You can switch at any
            time from the dashboard.
          </p>
        </div>
        <SelectOrganizationCard
          organizations={organizationsList}
          currentOrganizationId={org?.id || null}
        />
      </div>
    </div>
  );
};

export default SelectOrganizationPage;