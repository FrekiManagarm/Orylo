import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { organization } from "@orylo/database";
import { eq } from "drizzle-orm";
import { OrganizationOnboardingForm } from "@/components/onboarding/organization-onboarding-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Configuration de votre organisation",
  description:
    "Configurez votre organisation pour commencer à détecter la fraude sur vos transactions Stripe.",
  robots: {
    index: false,
    follow: false,
  },
};

const OnboardingPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const activeOrganization = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  if (!activeOrganization) {
    redirect("/create-organization");
  }

  // Récupérer les détails complets de l'organisation depuis la DB
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, activeOrganization.id))
    .limit(1);

  if (!org) {
    redirect("/create-organization");
  }

  // Si l'onboarding est déjà complété, rediriger vers le dashboard
  if (org.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      headerTitle="Configurez votre organisation"
      headerSubtitle="Configuration initiale"
      showBackButton={false}
      maxWidth="max-w-2xl"
    >
      <OrganizationOnboardingForm
        organizationId={org.id}
        organizationName={org.name}
      />
    </AuthLayout>
  );
};

export default OnboardingPage;
