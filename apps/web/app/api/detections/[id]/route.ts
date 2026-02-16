import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/detections/[id]
 * 
 * Story 2.4 - AC2: Fetch single detection with full details
 * 
 * Security (from Dev Notes):
 * - Requires Better Auth session
 * - Filters by organizationId (RLS)
 * - Returns 401 if unauthorized, 403 if wrong org, 404 if not found
 * 
 * Response format:
 * {
 *   id, paymentIntentId, customerEmail, customerIp, customerCountry,
 *   amount, currency, decision, riskScore, confidence,
 *   detectorResults, trustScore, createdAt
 * }
 */
export async function GET(
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

    // 2. Extract organizationId for multi-tenancy (RLS) - use getFullOrganization (same as feed/transactions)
    const organization = await auth.api.getFullOrganization({
      headers: request.headers,
    });

    if (!organization?.id) {
      return Response.json(
        { error: "Organization not found" },
        { status: 400 }
      );
    }

    const organizationId = organization.id;

    // 3. Get detection ID from params
    const { id } = await params;
    const detectionId = id;

    // 4. Query DB with RLS check (prevent cross-org access)
    const detectionResult = await db
      .select()
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.id, detectionId),
          eq(fraudDetections.organizationId, organizationId) // RLS
        )
      )
      .limit(1);

    // 5. Return 404 if not found or belongs to different org
    if (!detectionResult[0]) {
      return Response.json(
        { error: "Detection not found" },
        { status: 404 }
      );
    }

    // 6. Return full detection data
    return Response.json(detectionResult[0]);
  } catch (error) {
    console.error("Error fetching detection:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
