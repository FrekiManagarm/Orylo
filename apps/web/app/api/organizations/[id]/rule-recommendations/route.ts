import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { aiRuleRecommendations } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { OrganizationIdSchema } from "@/lib/validation/rule-recommendations";
import { ruleRecommendationsGetRateLimit } from "@/lib/rate-limit";
import { generateRuleRecommendations } from "@/lib/ai/rule-recommendation-engine";
import {
  getCachedRecommendations,
  setCachedRecommendations,
} from "@/lib/ai/rule-recommendation-cache";

/**
 * GET /api/organizations/[id]/rule-recommendations
 * 
 * Story 4.3: AC4 - Get AI rule recommendations for an organization
 * 
 * Security (ADR-010):
 * - Validates organizationId with Zod schema
 * - Verifies Better Auth session
 * - Verifies organization belongs to user's session (RLS)
 * - Rate limiting: 50 req/min per organization
 */
export async function GET(
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

    // 2. Extract organizationId from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionOrganizationId = (session.user as any).organizationId as
      | string
      | undefined;

    if (!sessionOrganizationId) {
      return Response.json(
        { error: "Organization ID not found in session" },
        { status: 400 }
      );
    }

    // 3. Get and validate organizationId from params
    const { id } = await params;
    const validatedOrganizationId = OrganizationIdSchema.parse(id);

    // 4. Verify organization belongs to user (RLS check)
    if (validatedOrganizationId !== sessionOrganizationId) {
      return Response.json(
        { error: "Organization access denied" },
        { status: 403 }
      );
    }

    // 5. Rate limiting
    const rateLimitResult = await ruleRecommendationsGetRateLimit.limit(
      validatedOrganizationId
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

    // 6. Check cache first (AC7)
    const cached = await getCachedRecommendations(validatedOrganizationId);
    if (cached) {
      return Response.json({ recommendations: cached });
    }

    // 7. Check if recommendations exist in DB
    const existingRecommendations = await db
      .select()
      .from(aiRuleRecommendations)
      .where(
        and(
          eq(aiRuleRecommendations.organizationId, validatedOrganizationId),
          eq(aiRuleRecommendations.applied, false)
        )
      );

    if (existingRecommendations.length > 0) {
      // Return existing recommendations
      const recommendations = existingRecommendations.map((r) => ({
        id: r.id,
        ...(r.ruleSuggestion as object),
        confidence: r.confidence,
        applied: r.applied,
        effectiveness: r.effectiveness,
        createdAt: r.createdAt,
      }));

      // Cache for future requests
      await setCachedRecommendations(validatedOrganizationId, recommendations, 86400); // 24h

      return Response.json({ recommendations });
    }

    // 8. Generate new recommendations
    const recommendations = await generateRuleRecommendations(
      validatedOrganizationId
    );

    if (recommendations.length === 0) {
      return Response.json({ recommendations: [] });
    }

    // 9. Store recommendations in DB
    const insertedRecommendations = await Promise.all(
      recommendations.map((rec) =>
        db
          .insert(aiRuleRecommendations)
          .values({
            organizationId: validatedOrganizationId,
            ruleSuggestion: {
              type: rec.type,
              name: rec.name,
              condition: rec.condition,
              action: rec.action,
              scoreModifier: rec.scoreModifier,
              reasoning: rec.reasoning,
            },
            confidence: rec.confidence,
            applied: false,
          })
          .returning()
      )
    );

    const insertedRows = insertedRecommendations.flat();
    const formattedRecommendations = insertedRows.map((r) => ({
      id: r.id,
      ...(r.ruleSuggestion as object),
      confidence: r.confidence,
      applied: r.applied,
      effectiveness: r.effectiveness,
      createdAt: r.createdAt,
    }));

    // 10. Cache recommendations (24h TTL)
    await setCachedRecommendations(
      validatedOrganizationId,
      formattedRecommendations,
      86400
    );

    return Response.json({ recommendations: formattedRecommendations });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid organization ID format" },
        { status: 400 }
      );
    }

    console.error("Error fetching rule recommendations:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
