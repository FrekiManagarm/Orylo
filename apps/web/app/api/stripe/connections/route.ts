import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { paymentProcessorsConnections } from "@orylo/database";
import { and, eq } from "drizzle-orm";

/**
 * GET /api/stripe/connections
 *
 * Returns active Stripe connections for the current organization.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullOrg = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!fullOrg?.id) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const connections = await db.query.paymentProcessorsConnections.findMany({
      where: and(
        eq(paymentProcessorsConnections.organizationId, fullOrg.id),
        eq(paymentProcessorsConnections.paymentProcessor, "stripe"),
      ),
      columns: {
        id: true,
        accountId: true,
        isActive: true,
        livemode: true,
        connectedAt: true,
      },
    });

    return NextResponse.json(
      connections.map((c) => ({
        id: c.id,
        accountId: c.accountId,
        stripeAccountId: c.accountId, // Alias for backward compatibility
        isActive: c.isActive,
        livemode: c.livemode,
        connectedAt: c.connectedAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching Stripe connections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
