import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { Organization } from "@orylo/database";
import { SelectOrganizationCard } from "@/components/onboarding/select-organization-card";
import { AuthLayout } from "@/components/auth/auth-layout";

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

  return (
    <AuthLayout
      headerTitle="Select Organization"
      headerSubtitle="Organization Switch"
      showBackButton={false}
      maxWidth="max-w-2xl"
    >
      <SelectOrganizationCard
        organizations={organizationsList}
        currentOrganizationId={org?.id || null}
      />
    </AuthLayout>
  );
};

export default SelectOrganizationPage;
