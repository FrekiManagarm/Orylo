import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { aiRuleRecommendations } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { RecommendationIdSchema } from "@/lib/validation/rule-recommendations";
import { ruleRecommendationsPreviewRateLimit } from "@/lib/rate-limit";
import { simulateRuleImpact } from "@/lib/ai/rule-impact-simulator";
import type { SimpleCondition } from "@/lib/fraud/custom-rules";

/**
 * POST /api/rule-recommendations/[id]/preview
 * 
 * Story 4.3: AC5 - Preview rule impact before applying
 * 
 * Security (ADR-010):
 * - Validates recommendationId with Zod schema
 * - Verifies Better Auth session
 * - Verifies recommendation belongs to user's organization (RLS)
 * - Rate limiting: 30 req/min per organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract organizationId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const organizationId = (session.user as any).organizationId as
      | string
      | undefined;

    if (!organizationId) {
      return Response.json(
        { error: "Organization ID not found in session" },
        { status: 400 }
      );
    }

    // 3. Get and validate recommendationId
    const { id } = await params;
    const validatedRecommendationId = RecommendationIdSchema.parse(id);

    // 4. Rate limiting
    const rateLimitResult = await ruleRecommendationsPreviewRateLimit.limit(
      organizationId
    );
    if (!rateLimitResult.success) {
      return Response.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // 5. Get recommendation and verify ownership
    const recommendation = await db
      .select()
      .from(aiRuleRecommendations)
      .where(
        and(
          eq(aiRuleRecommendations.id, validatedRecommendationId),
          eq(aiRuleRecommendations.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!recommendation[0]) {
      return Response.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    // 6. Extract condition from rule suggestion
    const ruleSuggestion = recommendation[0].ruleSuggestion as {
      condition: SimpleCondition;
    };

    // 7. Simulate impact on last 30 days
    const impact = await simulateRuleImpact(
      organizationId,
      ruleSuggestion.condition
    );

    return Response.json({
      impact,
      message: `Cette règle bloquerait ${impact.blocks} transactions sur les 30 derniers jours (${impact.blockRate.toFixed(1)}%).`,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid recommendation ID format" },
        { status: 400 }
      );
    }

    console.error("Error previewing rule impact:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
