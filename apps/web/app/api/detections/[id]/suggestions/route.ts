import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections, aiSuggestions } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { DetectionIdSchema } from "@/lib/validation/ai-suggestions";
import { suggestionGetRateLimit } from "@/lib/rate-limit";
import { generateSuggestion } from "@/lib/ai/suggestion-engine";
import {
  getCachedSuggestion,
  setCachedSuggestion,
} from "@/lib/ai/suggestion-cache";

/**
 * GET /api/detections/[id]/suggestions
 * 
 * Story 4.1: AC4 - Get AI suggestion for a detection
 * 
 * Security (ADR-010):
 * - Validates detectionId with Zod schema
 * - Verifies Better Auth session
 * - Verifies detection belongs to user's organization (RLS)
 * - Rate limiting: 100 req/min per organization
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

    // 3. Get and validate detectionId
    const { id } = await params;
    const validatedDetectionId = DetectionIdSchema.parse(id);

    // 4. Rate limiting
    const rateLimitResult = await suggestionGetRateLimit.limit(organizationId);
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

    // 5. Verify detection belongs to organization
    const detection = await db
      .select()
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.id, validatedDetectionId),
          eq(fraudDetections.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!detection[0]) {
      return Response.json(
        { error: "Detection not found" },
        { status: 404 }
      );
    }

    // 6. Check if suggestion already exists in DB
    const existingSuggestion = await db
      .select()
      .from(aiSuggestions)
      .where(
        and(
          eq(aiSuggestions.detectionId, validatedDetectionId),
          eq(aiSuggestions.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existingSuggestion[0]) {
      return Response.json({
        suggestion: {
          id: existingSuggestion[0].id,
          type: existingSuggestion[0].type,
          confidence: existingSuggestion[0].confidence,
          ...(existingSuggestion[0].suggestion as {
            reasoning: string;
            factors: string[];
          }),
          accepted: existingSuggestion[0].accepted,
        },
      });
    }

    // 7. Try cache first
    const cachedSuggestion = await getCachedSuggestion(validatedDetectionId);
    if (cachedSuggestion) {
      // Store in DB for persistence
      await db.insert(aiSuggestions).values({
        detectionId: validatedDetectionId,
        organizationId,
        type: cachedSuggestion.type,
        confidence: cachedSuggestion.confidence,
        suggestion: {
          reasoning: cachedSuggestion.reasoning,
          factors: cachedSuggestion.factors,
        },
        accepted: false,
      });

      return Response.json({
        suggestion: {
          ...cachedSuggestion,
          accepted: false,
        },
      });
    }

    // 8. Generate new suggestion
    const suggestion = await generateSuggestion({
      customerId: detection[0].customerId,
      customerEmail: detection[0].customerEmail,
      organizationId,
      detectionId: validatedDetectionId,
    });

    if (!suggestion) {
      return Response.json({ suggestion: null });
    }

    // 9. Store in DB
    const [insertedSuggestion] = await db
      .insert(aiSuggestions)
      .values({
        detectionId: validatedDetectionId,
        organizationId,
        type: suggestion.type,
        confidence: suggestion.confidence,
        suggestion: {
          reasoning: suggestion.reasoning,
          factors: suggestion.factors,
        },
        accepted: false,
      })
      .returning();

    // 10. Cache suggestion result (1h TTL)
    await setCachedSuggestion(validatedDetectionId, suggestion, 3600);

    return Response.json({
      suggestion: {
        id: insertedSuggestion.id,
        type: suggestion.type,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning,
        factors: suggestion.factors,
        accepted: false,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid detection ID format" },
        { status: 400 }
      );
    }

    console.error("Error fetching suggestion:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
