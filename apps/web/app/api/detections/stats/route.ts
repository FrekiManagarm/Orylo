import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, and, gte, count, sum, sql } from "drizzle-orm";

/**
 * GET /api/detections/stats
 * 
 * Story 2.2:
 * - AC4: Query fraud_detections table, filter by date range
 * - AC5: Calculate Total Saved (SUM of BLOCK amounts)
 * 
 * Security:
 * - Requires Better Auth session
 * - Filters by organizationId (RLS)
 * 
 * Query params:
 * - range: "today" | "week" | "month" (default: "today")
 * 
 * Response:
 * {
 *   totalTransactions: number,
 *   blocked: number,
 *   atRisk: number,
 *   totalSaved: number (cents)
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Check session (Security)
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract organizationId for RLS
    const org = await auth.api.getFullOrganization({
      headers: request.headers,
    });

    if (!org?.id) {
      return Response.json(
        { error: "Organization ID not found in session" },
        { status: 400 }
      );
    }

    const organizationId = org.id;

    // 3. Parse date range
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "today";

    // Calculate date threshold based on range
    const now = new Date();
    let dateFrom: Date;

    switch (range) {
      case "week":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "today":
      default:
        dateFrom = new Date(now.setHours(0, 0, 0, 0));
        break;
    }

    // 4. Query stats (AC4, AC5)
    const statsResult = await db
      .select({
        totalTransactions: count(),
        blocked: count(
          sql`CASE WHEN ${fraudDetections.decision} = 'BLOCK' THEN 1 END`
        ),
        atRisk: count(
          sql`CASE WHEN ${fraudDetections.decision} = 'REVIEW' THEN 1 END`
        ),
        totalSaved: sum(
          sql`CASE WHEN ${fraudDetections.decision} = 'BLOCK' THEN ${fraudDetections.amount} ELSE 0 END`
        ),
      })
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.organizationId, organizationId),
          gte(fraudDetections.createdAt, dateFrom)
        )
      );

    const stats = statsResult[0] || {
      totalTransactions: 0,
      blocked: 0,
      atRisk: 0,
      totalSaved: 0,
    };

    // Ensure totalSaved is a number (sum might return null)
    const response = {
      totalTransactions: Number(stats.totalTransactions) || 0,
      blocked: Number(stats.blocked) || 0,
      atRisk: Number(stats.atRisk) || 0,
      totalSaved: Number(stats.totalSaved) || 0,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
