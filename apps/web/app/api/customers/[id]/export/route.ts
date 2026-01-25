import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fraudDetections, customerTrustScores } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

/**
 * GET /api/customers/[id]/export
 * 
 * Story 3.5 AC3: Data export API (GDPR right to data portability)
 * 
 * Exports all customer data in JSON format:
 * - Fraud detections
 * - Trust scores
 * 
 * Security:
 * - Requires authentication
 * - Enforces multi-tenancy (organizationId check)
 * 
 * Response:
 * - JSON file download with all customer data
 */
export async function GET(
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

    // AC3: Export all customer data (GDPR right to data portability)
    const [detections, trustScores] = await Promise.all([
      db
        .select()
        .from(fraudDetections)
        .where(
          and(
            eq(fraudDetections.customerId, customerId),
            eq(fraudDetections.organizationId, organizationId)
          )
        ),
      db
        .select()
        .from(customerTrustScores)
        .where(
          and(
            eq(customerTrustScores.customerId, customerId),
            eq(customerTrustScores.organizationId, organizationId)
          )
        ),
    ]);

    const exportData = {
      customerId,
      organizationId,
      exportedAt: new Date().toISOString(),
      detections,
      trustScores: trustScores[0] || null,
    };

    logger.info("Customer data exported (GDPR)", {
      customerId,
      organizationId,
      detectionsCount: detections.length,
      hasTrustScore: trustScores.length > 0,
    });

    // Return as downloadable JSON
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="customer-${customerId}-export.json"`,
      },
    });
  } catch (error) {
    const { id } = await params;
    logger.error("Customer export failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      customerId: id,
    });
    return Response.json(
      { error: "Failed to export customer data" },
      { status: 500 }
    );
  }
}
