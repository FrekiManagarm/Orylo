import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { paymentProcessorsConnections } from "@orylo/database";
import { eq } from "drizzle-orm";
import { ConnectionsClient } from "./connections-client";
import { paymentProcessorList, type PaymentProcessorId } from "@/lib/config/payment-processors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type Connection = {
  id: string;
  accountId: string;
  paymentProcessor: string;
  isActive: boolean;
  livemode: boolean;
  connectedAt: Date | null;
};

export default async function ConnectionsPage() {
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  const allConnections: Connection[] =
    org?.id
      ? await db.query.paymentProcessorsConnections.findMany({
          where: eq(paymentProcessorsConnections.organizationId, org.id),
          columns: {
            id: true,
            accountId: true,
            paymentProcessor: true,
            isActive: true,
            livemode: true,
            connectedAt: true,
          },
          orderBy: (c, { desc }) => [desc(c.connectedAt)],
        })
      : [];

  // Group connections by processor
  const connectionsByProcessor = paymentProcessorList.reduce<
    Record<PaymentProcessorId, Connection[]>
  >((acc, config) => {
    acc[config.id] = allConnections.filter(
      (c) => c.paymentProcessor === config.id
    );
    return acc;
  }, {} as Record<PaymentProcessorId, Connection[]>);

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Connections
        </h1>
        <p className="text-zinc-400 mt-1 font-light">
          Link your payment processors and e-commerce platforms for real-time fraud detection.
        </p>
      </div>

      <ConnectionsClient connectionsByProcessor={connectionsByProcessor} />
    </div>
  );
}
