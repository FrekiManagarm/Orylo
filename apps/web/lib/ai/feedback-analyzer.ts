import { db } from "@/lib/db";
import { aiFeedback } from "@orylo/database";
import { eq, and, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { redis } from "@/lib/redis";

/**
 * Feedback Analyzer
 * 
 * Story 4.4: AC4 - Analyze feedback patterns and update suggestion confidence scores
 */

export interface FeedbackAnalysis {
  organizationId: string;
  totalFeedback: number;
  accepted: number;
  rejected: number;
  modified: number;
  acceptanceRate: number; // accepted / total
  averageConfidence: number;
  patterns: {
    lowConfidenceRejected: number; // <0.6 confidence rejected
    highConfidenceAccepted: number; // >0.8 confidence accepted
  };
}

/**
 * Analyze feedback for an organization
 * 
 * AC4: Calculate acceptance rates and patterns
 */
export async function analyzeFeedback(
  organizationId: string,
  days: number = 7
): Promise<FeedbackAnalysis | null> {
  try {
    const startDate = subDays(new Date(), days);

    // Query feedback from last N days
    const feedback = await db
      .select()
      .from(aiFeedback)
      .where(
        and(
          eq(aiFeedback.organizationId, organizationId),
          gte(aiFeedback.createdAt, startDate)
        )
      );

    if (feedback.length === 0) {
      return null; // No feedback yet
    }

    const totalFeedback = feedback.length;
    let accepted = 0;
    let rejected = 0;
    let modified = 0;
    let totalConfidence = 0;
    let lowConfidenceRejected = 0;
    let highConfidenceAccepted = 0;

    feedback.forEach((f) => {
      if (f.merchantAction === "accepted") accepted++;
      if (f.merchantAction === "rejected") rejected++;
      if (f.merchantAction === "modified") modified++;

      const context = f.context as {
        originalConfidence?: number;
      };
      const confidence = context.originalConfidence || 0;
      totalConfidence += confidence;

      // Patterns
      if (f.merchantAction === "rejected" && confidence < 0.6) {
        lowConfidenceRejected++;
      }
      if (f.merchantAction === "accepted" && confidence >= 0.8) {
        highConfidenceAccepted++;
      }
    });

    const acceptanceRate =
      totalFeedback > 0 ? accepted / (accepted + rejected) : 0;
    const averageConfidence =
      totalFeedback > 0 ? totalConfidence / totalFeedback : 0;

    return {
      organizationId,
      totalFeedback,
      accepted,
      rejected,
      modified,
      acceptanceRate,
      averageConfidence,
      patterns: {
        lowConfidenceRejected,
        highConfidenceAccepted,
      },
    };
  } catch (error) {
    console.error("[feedback_analysis_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

/**
 * Update suggestion confidence thresholds based on feedback
 * 
 * AC4: Adjust thresholds based on acceptance patterns
 */
export async function updateSuggestionConfidence(
  organizationId: string,
  analysis: FeedbackAnalysis
): Promise<void> {
  try {
    // AC4: If acceptance rate <50% for confidence >0.8 → lower threshold (suggestions too aggressive)
    // If acceptance rate >80% for confidence <0.6 → raise threshold (suggestions too conservative)
    
    let adjustedThreshold = 0.7; // Default threshold

    if (analysis.acceptanceRate < 0.5 && analysis.patterns.highConfidenceAccepted > 0) {
      // Too aggressive - lower threshold
      adjustedThreshold = 0.75; // Require higher confidence
    } else if (analysis.acceptanceRate > 0.8 && analysis.patterns.lowConfidenceRejected > 0) {
      // Too conservative - raise threshold
      adjustedThreshold = 0.65; // Accept lower confidence
    } else {
      // Balanced - keep default
      adjustedThreshold = 0.7;
    }

    // Store in Redis (24h TTL)
    await redis.set(
      `suggestion_threshold:${organizationId}`,
      adjustedThreshold.toString(),
      { ex: 86400 }
    );

    console.info("[suggestion_threshold_updated]", {
      organizationId,
      acceptanceRate: analysis.acceptanceRate,
      adjustedThreshold,
    });
  } catch (error) {
    console.error("[update_threshold_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get current suggestion threshold for an organization
 */
export async function getSuggestionThreshold(
  organizationId: string
): Promise<number> {
  try {
    const cached = await redis.get<string>(
      `suggestion_threshold:${organizationId}`
    );
    return cached ? parseFloat(cached) : 0.7; // Default 0.7
  } catch (error) {
    console.warn("[get_threshold_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return 0.7; // Default fallback
  }
}
