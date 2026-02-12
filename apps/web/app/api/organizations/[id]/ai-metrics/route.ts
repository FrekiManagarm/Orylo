import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { aiSuggestions } from "@orylo/database";
import { eq } from "drizzle-orm";
import { OrganizationIdSchema } from "@/lib/validation/ai-feedback";
import { ruleRecommendationsGetRateLimit } from "@/lib/rate-limit";
import { analyzeFeedback } from "@/lib/ai/feedback-analyzer";

/**
 * GET /api/organizations/[id]/ai-metrics
 *
 * Story 4.4: AC6 - Get AI suggestion accuracy metrics
 *
 * Security (ADR-010):
 * - Validates organizationId with Zod schema
 * - Verifies Better Auth session
 * - Verifies organization belongs to user's session (RLS)
 * - Rate limiting: 100 req/min per organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Check session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract organizationId from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionOrganizationId = (session.user as any).organizationId as
      | string
      | undefined;

    if (!sessionOrganizationId) {
      return Response.json(
        { error: "Organization ID not found in session" },
        { status: 400 },
      );
    }

    // 3. Get and validate organizationId from params
    const { id } = await params;
    const validatedOrganizationId = OrganizationIdSchema.parse(id);

    // 4. Verify organization belongs to user (RLS check)
    if (validatedOrganizationId !== sessionOrganizationId) {
      return Response.json(
        { error: "Organization access denied" },
        { status: 403 },
      );
    }

    // 5. Rate limiting
    const rateLimitResult = await ruleRecommendationsGetRateLimit.limit(
      validatedOrganizationId,
    );
    if (!rateLimitResult.success) {
      return Response.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        },
      );
    }

    // 6. Calculate metrics from feedback
    const analysis = await analyzeFeedback(validatedOrganizationId, 30); // Last 30 days

    if (!analysis) {
      return Response.json({
        accuracy: 0,
        totalSuggestions: 0,
        accepted: 0,
        rejected: 0,
        modified: 0,
      });
    }

    // AC6: AI Suggestion Accuracy = acceptance rate
    const accuracy = analysis.acceptanceRate;

    // Get total suggestions count
    const totalSuggestionsResult = await db
      .select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.organizationId, validatedOrganizationId));

    return Response.json({
      accuracy, // 0-1
      totalSuggestions: totalSuggestionsResult.length,
      accepted: analysis.accepted,
      rejected: analysis.rejected,
      modified: analysis.modified,
      averageConfidence: analysis.averageConfidence,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid organization ID format" },
        { status: 400 },
      );
    }

    console.error("Error fetching AI metrics:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
