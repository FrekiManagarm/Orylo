import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fraudDetections, aiExplanations } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { DetectionIdSchema } from "@/lib/validation/ai-explanations";
import { suggestionGetRateLimit } from "@/lib/rate-limit";
import { generateTemplateExplanation } from "@/lib/ai/explanation-templates";
import type { DetectorResult } from "@orylo/fraud-engine";

/**
 * GET /api/detections/[id]/explanation
 * 
 * Story 4.2: AC4 - Get AI explanation for a detection
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

    // 6. Check if explanation exists
    const explanation = await db
      .select()
      .from(aiExplanations)
      .where(
        and(
          eq(aiExplanations.detectionId, validatedDetectionId),
          eq(aiExplanations.organizationId, organizationId)
        )
      )
      .limit(1);

    if (explanation[0]) {
      // AC4: Return explanation if generated
      return Response.json({
        explanation: explanation[0].explanation,
        status: "generated",
        model: explanation[0].model,
        generatedAt: explanation[0].generatedAt,
      });
    }

    // AC4: Return status "pending" if still generating
    // AC7: Return fallback template explanation if LLM failed (but no record exists)
    // In this case, we'll return pending since the job might still be running
    // If we want to return a template immediately, we could check if job failed
    // For now, we return pending and let the UI show loading state

    // Generate template as fallback (AC7)
    const detectorResults = (detection[0].detectorResults || []) as DetectorResult[];
    const templateExplanation = generateTemplateExplanation(
      detectorResults,
      detection[0].score,
      detection[0].decision as "ALLOW" | "REVIEW" | "BLOCK"
    );

    return Response.json({
      explanation: null,
      status: "pending",
      fallback: templateExplanation, // Provide template while waiting
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid detection ID format" },
        { status: 400 }
      );
    }

    console.error("Error fetching explanation:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
