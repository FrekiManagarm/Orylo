import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { organization } from "@orylo/database";
import { eq } from "drizzle-orm";
import { OrganizationOnboardingForm } from "@/components/onboarding/organization-onboarding-form";

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
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-black text-white overflow-hidden selection:bg-primary/20 selection:text-primary">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute inset-0 flex justify-center">
        <div className="w-[520px] h-[520px] bg-indigo-500/10 rounded-full blur-3xl translate-y-[24%]" />
      </div>
      <div className="relative z-10 w-full px-4 sm:px-6 py-14">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">
            Configuration initiale
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Configurez votre organisation
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Aidez-nous à mieux comprendre votre activité pour optimiser la
            détection de fraude sur votre plateforme.
          </p>
        </div>
        <OrganizationOnboardingForm
          organizationId={org.id}
          organizationName={org.name}
        />
      </div>
    </div>
  );
};

export default OnboardingPage;