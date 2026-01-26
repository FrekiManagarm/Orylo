import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiRuleRecommendations, customRules } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { RecommendationIdSchema } from "@/lib/validation/rule-recommendations";
import { ruleRecommendationsApplyRateLimit } from "@/lib/rate-limit";
import { invalidateRecommendationsCache } from "@/lib/ai/rule-recommendation-cache";

/**
 * POST /api/rule-recommendations/[id]/apply
 * 
 * Story 4.3: AC4, AC6 - Apply a rule recommendation
 * 
 * Security (ADR-010):
 * - Validates recommendationId with Zod schema
 * - Verifies Better Auth session
 * - Verifies recommendation belongs to user's organization (RLS)
 * - Rate limiting: 20 req/min per organization
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
    const rateLimitResult = await ruleRecommendationsApplyRateLimit.limit(
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

    if (recommendation[0].applied) {
      return Response.json(
        { error: "Recommendation already applied" },
        { status: 400 }
      );
    }

    // 6. Extract rule suggestion
    const ruleSuggestion = recommendation[0].ruleSuggestion as {
      name: string;
      condition: unknown;
      action: "BLOCK" | "REVIEW" | "ALLOW";
      scoreModifier: number;
    };

    // 7. Create custom rule
    const [customRule] = await db
      .insert(customRules)
      .values({
        organizationId,
        name: ruleSuggestion.name,
        description: `AI-recommended rule: ${ruleSuggestion.name}`,
        condition: ruleSuggestion.condition,
        action: ruleSuggestion.action,
        scoreModifier: ruleSuggestion.scoreModifier,
        isActive: true,
        priority: 100,
      })
      .returning();

    // 8. Link recommendation to custom rule
    await db
      .update(aiRuleRecommendations)
      .set({
        applied: true,
        customRuleId: customRule.id,
        updatedAt: new Date(),
      })
      .where(eq(aiRuleRecommendations.id, validatedRecommendationId));

    // 9. Invalidate cache
    await invalidateRecommendationsCache(organizationId);

    return Response.json({
      success: true,
      customRuleId: customRule.id,
      message: "Rule applied successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid recommendation ID format" },
        { status: 400 }
      );
    }

    console.error("Error applying rule recommendation:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
