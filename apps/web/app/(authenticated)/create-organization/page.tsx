import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { Organization } from "@orylo/database";
import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form";

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
    <div className="relative h-screen w-screen flex items-center justify-center bg-black text-white overflow-hidden selection:bg-primary/20 selection:text-primary">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute inset-0 flex justify-center">
        <div className="w-[520px] h-[520px] bg-indigo-500/10 rounded-full blur-3xl translate-y-[24%]" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">
            Secure onboarding
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Set up your organization before opening the dashboard
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Create the space that centralizes your rules, alerts, and
            connections. You can invite your team and enable fraud protections
            in minutes.
          </p>
        </div>
        <CreateOrganizationForm />
      </div>
    </div>
  );
};

export default CreateOrganizationPage;