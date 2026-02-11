import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { organization } from "@orylo/database";
import { eq } from "drizzle-orm";
import { ConnectStripeClient } from "./connect-stripe-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConnectStripePage() {
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  console.log(org, "org");

  let stripeAccountId: string | null = null;
  if (org?.id) {
    const [row] = await db
      .select({ stripeAccountId: organization.stripeAccountId })
      .from(organization)
      .where(eq(organization.id, org.id))
      .limit(1);
    stripeAccountId = row?.stripeAccountId ?? null;
  }

  const stripeConnected = Boolean(stripeAccountId);

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Connect Stripe
        </h1>
        <p className="text-zinc-400 mt-1 font-light">
          Link your Stripe account to enable real-time fraud detection on your payments.
        </p>
      </div>

      <ConnectStripeClient
        stripeConnected={stripeConnected}
        stripeAccountId={stripeAccountId}
      />
    </div>
  );
}
