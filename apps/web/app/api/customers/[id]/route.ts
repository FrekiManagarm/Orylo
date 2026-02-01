import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections, customerTrustScores } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

/**
 * DELETE /api/customers/[id]
 * 
 * Story 3.5 AC2: Right to deletion API (GDPR compliance)
 * 
 * Cascade deletes all customer data:
 * - Fraud detections
 * - Trust scores
 * - Redis cache entries
 * 
 * Security:
 * - Requires authentication
 * - Enforces multi-tenancy (organizationId check)
 * - Transaction ensures atomicity (all or nothing)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication + multi-tenancy
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const organizationId = (session.user as any).organizationId as string | undefined;

    if (!organizationId) {
      return Response.json(
        { error: "Organization ID not found in session" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const customerId = id;

    // AC2: Cascade delete (GDPR right to deletion)
    // Use transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Delete fraud detections
      const deletedDetections = await tx
        .delete(fraudDetections)
        .where(
          and(
            eq(fraudDetections.customerId, customerId),
            eq(fraudDetections.organizationId, organizationId)
          )
        )
        .returning({ id: fraudDetections.id });

      // Delete trust scores
      const deletedTrustScores = await tx
        .delete(customerTrustScores)
        .where(
          and(
            eq(customerTrustScores.customerId, customerId),
            eq(customerTrustScores.organizationId, organizationId)
          )
        )
        .returning({ id: customerTrustScores.id });

      logger.info("Customer data deleted (GDPR)", {
        customerId,
        organizationId,
        detectionsDeleted: deletedDetections.length,
        trustScoresDeleted: deletedTrustScores.length,
      });

      return {
        detectionsDeleted: deletedDetections.length,
        trustScoresDeleted: deletedTrustScores.length,
      };
    });

    // Invalidate Redis cache
    try {
      await redis.del(`trust:${organizationId}:${customerId}`);
      await redis.del(`velocity:${organizationId}:${customerId}`);
      logger.debug("Cache invalidated for deleted customer", {
        customerId,
        organizationId,
      });
    } catch (error) {
      // Non-critical - log but don't fail
      logger.warn("Cache invalidation failed for deleted customer", {
        customerId,
        organizationId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return Response.json({
      deleted: true,
      customerId,
      message: "All customer data has been permanently deleted",
      ...result,
    });
  } catch (error) {
    const { id } = await params;
    logger.error("Customer deletion failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      customerId: id,
    });
    return Response.json(
      { error: "Failed to delete customer data" },
      { status: 500 }
    );
  }
}
