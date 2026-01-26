import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSuggestions } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { SuggestionIdSchema } from "@/lib/validation/ai-suggestions";
import { MerchantReasonSchema } from "@/lib/validation/ai-feedback";
import { trackFeedback, getDetectionContext } from "@/lib/ai/feedback-tracker";
import { z } from "zod";

/**
 * POST /api/suggestions/[id]/feedback
 * 
 * Story 4.4: AC1, AC2, AC3 - Explicit feedback for modified suggestions
 * 
 * Security (ADR-010):
 * - Validates suggestionId with Zod schema
 * - Verifies Better Auth session
 * - Verifies suggestion belongs to user's organization (RLS)
 * - Rate limiting: 30 req/min per organization
 */
const FeedbackSchema = z.object({
  merchantAction: z.enum(["accepted", "rejected", "modified"]),
  merchantReason: MerchantReasonSchema,
});

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

    // 3. Get and validate suggestionId
    const { id } = await params;
    const validatedSuggestionId = SuggestionIdSchema.parse(id);

    // 4. Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validatedBody = FeedbackSchema.parse(body);

    // 5. Rate limiting (30 req/min)
    // Note: Using suggestion reject rate limit as similar endpoint
    const rateLimitResult = await suggestionRejectRateLimit.limit(organizationId);
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

    // 6. Get suggestion and verify ownership
    const suggestion = await db
      .select()
      .from(aiSuggestions)
      .where(
        and(
          eq(aiSuggestions.id, validatedSuggestionId),
          eq(aiSuggestions.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!suggestion[0]) {
      return Response.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    // 7. Get detection context
    const detectionContext = await getDetectionContext(
      organizationId,
      suggestion[0].detectionId
    );

    if (!detectionContext) {
      return Response.json(
        { error: "Detection context not found" },
        { status: 404 }
      );
    }

    // 8. Track feedback
    await trackFeedback(
      organizationId,
      validatedSuggestionId,
      validatedBody.merchantAction,
      {
        detectionId: suggestion[0].detectionId,
        suggestionType: suggestion[0].type,
        originalConfidence: suggestion[0].confidence,
        detectionContext,
      },
      validatedBody.merchantReason
    );

    return Response.json({
      success: true,
      message: "Feedback tracked successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    console.error("Error tracking feedback:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
