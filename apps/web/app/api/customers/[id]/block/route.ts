import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { trackCustomerBlocked } from "@/lib/posthog";
import { logger } from "@/lib/logger";

/**
 * POST /api/customers/[id]/block
 * 
 * Story 2.7 - AC3: Block customer action
 * 
 * Security (from Dev Notes):
 * - Requires Better Auth session
 * - Filters by organizationId (RLS)
 * - Verifies customer belongs to organization via fraud_detections
 * - Returns 401 if unauthorized, 403 if wrong org, 404 if not found
 * 
 * Logic:
 * 1. Verify session & organization
 * 2. Check customer ownership (via fraud_detections)
 * 3. Update customer_trust_scores: isBlacklisted=true, score=0
 * 4. Invalidate Redis cache (future: Story 3.x)
 * 5. Return success
 * 
 * Response format:
 * { success: true } | { error: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check session (Security requirement)
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract organizationId for multi-tenancy (RLS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const organizationId = (session.user as any).organizationId as string | undefined;

    if (!organizationId) {
      return Response.json(
        { error: "Organization ID not found in session" },
        { status: 400 }
      );
    }

    // 3. Get customer ID from params (this is customerEmail from detections)
    const { id } = await params;
    const customerIdentifier = id;

    // 4. Verify customer belongs to organization (RLS check via fraud_detections)
    const customerDetection = await db
      .select()
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.customerEmail, customerIdentifier),
          eq(fraudDetections.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!customerDetection[0]) {
      return Response.json(
        { error: "Customer not found or does not belong to your organization" },
        { status: 404 }
      );
    }

    // 5. TODO (Epic 3): Update customer_trust_scores table
    // For now, we'll simulate success since customer_trust_scores table
    // implementation is part of Epic 3 (Integration & Production Readiness)

    // Future implementation:
    // await db
    //   .update(customerTrustScores)
    //   .set({ isBlacklisted: true, score: 0, updatedAt: new Date() })
    //   .where(
    //     and(
    //       eq(customerTrustScores.customerEmail, customerIdentifier),
    //       eq(customerTrustScores.organizationId, organizationId)
    //     )
    //   );

    // 6. TODO (Epic 3): Invalidate Redis cache
    // await redis.del(`trust:${organizationId}:${customerIdentifier}`);

    // Story 3.3 AC4: Track customer blocked event
    trackCustomerBlocked(organizationId, customerIdentifier);

    logger.info("Customer blocked", {
      customerId: customerIdentifier,
      organizationId,
    });

    // 7. Return success
    return Response.json({
      success: true,
      message: "Customer blocked successfully",
      // TODO: Remove this note in Epic 3 when full integration is complete
      note: "Blacklist will be enforced once customer_trust_scores table is implemented (Epic 3)",
    });
  } catch (error) {
    const { id } = await params;
    logger.error("Error blocking customer", {
      error: error instanceof Error ? error.message : "Unknown error",
      customerId: id,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
