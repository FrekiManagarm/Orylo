import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { Organization } from "@orylo/database";
import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Create an organization",
  description:
    "Set up your Orylo space and access the dashboard by creating your first organization.",
  robots: {
    index: false,
    follow: false,
  },
};

const CreateOrganizationPage = async () => {
  const [session, organizations] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listOrganizations({
      headers: await headers(),
    }),
  ]);

  if (!session) {
    redirect("/sign-in");
  }

  const organizationsList = (organizations ?? []) as Organization[];

  // Si l'utilisateur a déjà des organisations, rediriger vers la sélection
  if (organizationsList.length > 0) {
    redirect("/select-organization");
  }

  return (
    <AuthLayout
      headerTitle="Create Organization"
      headerSubtitle="Secure Onboarding"
      showBackButton={false}
    >
      <CreateOrganizationForm />
    </AuthLayout>
  );
};

export default CreateOrganizationPage;
