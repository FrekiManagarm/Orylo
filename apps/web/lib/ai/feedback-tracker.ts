import { db } from "@/lib/db";
import { aiFeedback, aiSuggestions, fraudDetections, organization } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { anonymizeFeedbackContext } from "./feedback-anonymizer";
import type { DetectionContext } from "./feedback-anonymizer";

/**
 * Feedback Tracker
 * 
 * Story 4.4: AC1, AC2 - Track merchant actions on AI suggestions
 */

export interface FeedbackContext {
  detectionId: string;
  suggestionType: "whitelist" | "blacklist";
  originalConfidence: number;
  detectionContext: DetectionContext;
}

/**
 * Track feedback when merchant accepts/rejects/modifies a suggestion
 * 
 * AC1: Track all merchant actions on AI suggestions
 * AC2: Store feedback in ai_feedback table with context
 * AC7: Anonymize if opt-in enabled
 */
export async function trackFeedback(
  organizationId: string,
  suggestionId: string,
  merchantAction: "accepted" | "rejected" | "modified",
  context: FeedbackContext,
  merchantReason?: string
): Promise<void> {
  try {
    // Get organization to check opt-in setting
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    const shareFeedback = org[0]?.shareFeedbackForModelImprovement || false;

    // AC7: Anonymize if opt-in enabled
    const anonymizedContext = shareFeedback
      ? anonymizeFeedbackContext(context.detectionContext)
      : context.detectionContext;

    // AC2: Store feedback with context
    await db.insert(aiFeedback).values({
      suggestionId,
      organizationId,
      merchantAction,
      merchantReason: merchantReason || null,
      context: {
        detectionId: context.detectionId,
        suggestionType: context.suggestionType,
        originalConfidence: context.originalConfidence,
        detectionContext: anonymizedContext,
      },
      anonymized: shareFeedback,
    });

    console.info("[feedback_tracked]", {
      suggestionId,
      organizationId,
      merchantAction,
      anonymized: shareFeedback,
    });
  } catch (error) {
    // Log but don't fail the main action
    console.error("[feedback_tracking_error]", {
      suggestionId,
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get detection context from detection ID
 */
export async function getDetectionContext(
  organizationId: string,
  detectionId: string
): Promise<DetectionContext | null> {
  try {
    const detection = await db
      .select()
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.id, detectionId),
          eq(fraudDetections.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!detection[0]) {
      return null;
    }

    // AC2: Store only non-PII fields
    return {
      amount: detection[0].amount,
      customerEmail: detection[0].customerEmail,
      decision: detection[0].decision as "ALLOW" | "REVIEW" | "BLOCK",
      riskScore: detection[0].score,
    };
  } catch (error) {
    console.error("[get_detection_context_error]", {
      detectionId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}
