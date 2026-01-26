import { schedules } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { aiFeedback, organization } from "@orylo/database";
import { gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { analyzeFeedback, updateSuggestionConfidence } from "@/lib/ai/feedback-analyzer";
import { redis } from "@/lib/redis";

/**
 * Trigger.dev Scheduled Job: Analyze Feedback
 * 
 * Story 4.4: AC4, AC7 - Daily analysis of feedback to update suggestion confidence thresholds
 * 
 * ADR-006: Background Jobs Architecture
 * - Scheduled: Daily at 2am UTC (cron: "0 2 * * *")
 * - Analyzes feedback from last 7 days
 * - Updates confidence thresholds in Redis
 * - Generates A/B test reports
 */
export const analyzeFeedbackJob = schedules.task({
  id: "analyze-feedback",
  cron: "0 2 * * *", // Daily at 2am UTC
  run: async () => {
    try {
      console.info("[analyze_feedback_job_start]", {
        timestamp: new Date().toISOString(),
      });

      // Get all organizations
      const organizations = await db.select().from(organization);

      const startDate = subDays(new Date(), 7);

      // Query feedback from last 7 days for all organizations
      const allFeedback = await db
        .select()
        .from(aiFeedback)
        .where(gte(aiFeedback.createdAt, startDate));

      // Group feedback by organization
      const feedbackByOrg = new Map<string, typeof allFeedback>();
      allFeedback.forEach((f) => {
        const orgFeedback = feedbackByOrg.get(f.organizationId) || [];
        orgFeedback.push(f);
        feedbackByOrg.set(f.organizationId, orgFeedback);
      });

      // Analyze feedback for each organization
      for (const org of organizations) {
        try {
          const analysis = await analyzeFeedback(org.id, 7);

          if (!analysis || analysis.totalFeedback === 0) {
            continue; // Skip if no feedback
          }

          // AC4: Update suggestion confidence thresholds
          await updateSuggestionConfidence(org.id, analysis);

          // Store model version and update history in Redis
          const modelVersion = `v${Date.now()}`;
          await redis.set(
            `model_version:${org.id}`,
            modelVersion,
            { ex: 86400 * 30 } // 30 days TTL
          );

          console.info("[feedback_analyzed]", {
            organizationId: org.id,
            acceptanceRate: analysis.acceptanceRate,
            totalFeedback: analysis.totalFeedback,
            modelVersion,
          });
        } catch (orgError) {
          console.error("[feedback_analysis_org_error]", {
            organizationId: org.id,
            error:
              orgError instanceof Error ? orgError.message : "Unknown error",
          });
          // Continue with other organizations
        }
      }

      console.info("[analyze_feedback_job_complete]", {
        organizationsProcessed: organizations.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[analyze_feedback_job_error]", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error; // Trigger.dev will retry
    }
  },
});
