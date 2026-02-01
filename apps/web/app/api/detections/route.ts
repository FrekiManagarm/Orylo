import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, desc, count, and, gte, lte } from "drizzle-orm";

/**
 * GET /api/detections
 * 
 * Story 2.1 - AC5: Fetch detections with pagination
 * Story 2.3 - AC3, AC7: Filter by decision and date range (server-side)
 * 
 * Security (from Dev Notes):
 * - Requires Better Auth session
 * - Filters by organizationId (RLS)
 * - Returns 401 if unauthorized
 * 
 * Query params:
 * - limit: number of records (default: 20)
 * - offset: pagination offset (default: 0)
 * - decision: filter by decision type (ALLOW, REVIEW, BLOCK)
 * - dateFrom: filter by date range start (ISO string)
 * - dateTo: filter by date range end (ISO string)
 * 
 * Response format:
 * {
 *   data: Detection[],
 *   total: number,
 *   offset: number,
 *   limit: number
 * }
 */
export async function GET(request: NextRequest) {
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

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
      100
    ); // Cap at 100
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

    // Story 2.3: Filter parameters
    const decision = searchParams.get("decision");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // 4. Build query conditions (AC7: server-side filtering)
    const conditions = [eq(fraudDetections.organizationId, organizationId)];

    // Filter by decision (AC3)
    if (decision && decision !== "ALL") {
      conditions.push(eq(fraudDetections.decision, decision));
    }

    // Filter by date range (AC3)
    if (dateFrom) {
      conditions.push(gte(fraudDetections.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(fraudDetections.createdAt, new Date(dateTo)));
    }

    // 5. Query DB with filters
    // AC1: SELECT only needed columns (avoid heavy JSON fields like detectorResults)
    const whereClause = and(...conditions);

    const [detectionsResult, totalResult] = await Promise.all([
      // Fetch detections - optimized query (AC1)
      db
        .select({
          id: fraudDetections.id,
          paymentIntentId: fraudDetections.paymentIntentId,
          amount: fraudDetections.amount,
          currency: fraudDetections.currency,
          decision: fraudDetections.decision,
          score: fraudDetections.score,
          customerEmail: fraudDetections.customerEmail,
          customerId: fraudDetections.customerId,
          createdAt: fraudDetections.createdAt,
          // Omit: detectorResults (heavy JSON field), executionTimeMs (not needed for list)
        })
        .from(fraudDetections)
        .where(whereClause)
        .orderBy(desc(fraudDetections.createdAt))
        .limit(limit)
        .offset(offset),

      // Get total count for pagination
      db
        .select({ count: count() })
        .from(fraudDetections)
        .where(whereClause),
    ]);

    // 6. Return response
    return Response.json({
      data: detectionsResult,
      total: totalResult[0]?.count || 0,
      offset,
      limit,
    });
  } catch (error) {
    // Story 3.3: Use structured logging
    const { logger } = await import("@/lib/logger");
    logger.error("Error fetching detections", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
