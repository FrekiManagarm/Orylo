import { task } from "@trigger.dev/sdk/v3";
import { openai } from "@/lib/openai";
import { db } from "@/lib/db";
import { aiExplanations } from "@orylo/database";
import { buildExplanationPrompt, EXPLANATION_SYSTEM_MESSAGE } from "@/lib/ai/explanation-prompt";
import { generateTemplateExplanation } from "@/lib/ai/explanation-templates";
import { getCachedExplanation, setCachedExplanation } from "@/lib/ai/explanation-cache";
import { explanationGenerationRateLimit } from "@/lib/rate-limit";
import type { DetectorResult } from "@orylo/fraud-engine";

/**
 * Trigger.dev Job: Generate AI Explanation
 * 
 * Story 4.2: AC1, AC2 - Generate AI explanation asynchronously after detection
 * 
 * ADR-006: Background Jobs Architecture
 * - Non-blocking (webhook returns <250ms)
 * - Retry: 3 attempts with exponential backoff
 * - Queue: ai-explanation with concurrency limit 10
 * - Priority: HIGH for BLOCK, NORMAL for REVIEW/ALLOW
 */
export interface AIExplanationPayload {
  detectionId: string;
  organizationId: string;
  context: {
    amount: number;
    currency: string;
    customerEmail: string | null;
    cardCountry?: string;
    customerIp?: string;
    riskScore: number;
    decision: "ALLOW" | "REVIEW" | "BLOCK";
  };
  detectorResults: DetectorResult[];
  priority: "HIGH" | "NORMAL";
}

export const generateAIExplanation = task({
  id: "generate-ai-explanation",
  retry: {
    maxAttempts: 3,
    factor: 2,
  },
  queue: {
    name: "ai-explanation",
    concurrencyLimit: 10,
  },
  run: async (payload: AIExplanationPayload, { ctx }) => {
    const startTime = Date.now();

    try {
      // AC8: Rate limiting - Check if organization exceeded limit
      const rateLimitResult = await explanationGenerationRateLimit.limit(
        payload.organizationId
      );
      
      if (!rateLimitResult.success) {
        // Rate limit exceeded - use template fallback
        console.warn("[ai_explanation_rate_limit_exceeded]", {
          organizationId: payload.organizationId,
          detectionId: payload.detectionId,
        });

        const explanation = generateTemplateExplanation(
          payload.detectorResults,
          payload.context.riskScore,
          payload.context.decision
        );

        await db.insert(aiExplanations).values({
          detectionId: payload.detectionId,
          organizationId: payload.organizationId,
          explanation,
          model: "template-rate-limit",
          tokensUsed: null,
          latency: Date.now() - startTime,
          triggerJobId: ctx.run.id,
          generatedAt: new Date(),
        });

        return {
          success: true,
          explanation,
          model: "template-rate-limit",
          latency: Date.now() - startTime,
          tokensUsed: null,
        };
      }

      // AC8: Check cache for similar detection pattern
      const cachedExplanation = await getCachedExplanation(payload.detectorResults);
      if (cachedExplanation) {
        console.info("[ai_explanation_cache_hit]", {
          detectionId: payload.detectionId,
        });

        // Store cached explanation for this detection
        await db.insert(aiExplanations).values({
          detectionId: payload.detectionId,
          organizationId: payload.organizationId,
          explanation: cachedExplanation,
          model: "cached",
          tokensUsed: null,
          latency: Date.now() - startTime,
          triggerJobId: ctx.run.id,
          generatedAt: new Date(),
        });

        return {
          success: true,
          explanation: cachedExplanation,
          model: "cached",
          latency: Date.now() - startTime,
          tokensUsed: null,
        };
      }

      // AC2: Build prompt with detection context
      const prompt = buildExplanationPrompt(
        {
          organizationId: payload.organizationId,
          detectionId: payload.detectionId,
          ...payload.context,
        },
        payload.detectorResults
      );

      // AC2: Call OpenAI API with French language instruction
      let explanation: string;
      let model = "gpt-4o-mini";
      let tokensUsed: number | null = null;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: EXPLANATION_SYSTEM_MESSAGE },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 200, // Limit to keep costs low
        });

        explanation = completion.choices[0]?.message?.content || "";
        tokensUsed = completion.usage?.total_tokens || null;

        // If empty response, fallback to template
        if (!explanation.trim()) {
          throw new Error("Empty LLM response");
        }
      } catch (llmError) {
        // AC7: Fallback to template-based explanation if LLM fails
        console.warn("[ai_explanation_llm_failed]", {
          detectionId: payload.detectionId,
          error: llmError instanceof Error ? llmError.message : "Unknown error",
        });

        explanation = generateTemplateExplanation(
          payload.detectorResults,
          payload.context.riskScore,
          payload.context.decision
        );
        model = "template-fallback";
      }

      const latency = Date.now() - startTime;

      // AC8: Cache explanation for similar patterns (if not template fallback)
      if (model !== "template-fallback" && model !== "template-rate-limit") {
        await setCachedExplanation(payload.detectorResults, explanation, 86400); // 24h TTL
      }

      // AC1: Store explanation in ai_explanations table
      await db.insert(aiExplanations).values({
        detectionId: payload.detectionId,
        organizationId: payload.organizationId,
        explanation,
        model,
        tokensUsed,
        latency,
        triggerJobId: ctx.run.id,
        generatedAt: new Date(),
      });

      // AC8: Monitor API costs (PostHog event would be sent here if PostHog configured)
      // For now, we log the event
      console.info("[ai_explanation_generated]", {
        detectionId: payload.detectionId,
        organizationId: payload.organizationId,
        model,
        latency,
        tokensUsed,
        // PostHog event: ai_explanation_generated with tokens_used
      });

      return {
        success: true,
        explanation,
        model,
        latency,
        tokensUsed,
      };
    } catch (error) {
      // AC7: Final fallback - use template if everything fails
      const explanation = generateTemplateExplanation(
        payload.detectorResults,
        payload.context.riskScore,
        payload.context.decision
      );

      // Store fallback explanation
      await db.insert(aiExplanations).values({
        detectionId: payload.detectionId,
        organizationId: payload.organizationId,
        explanation,
        model: "template-fallback",
        tokensUsed: null,
        latency: Date.now() - startTime,
        triggerJobId: ctx.run.id,
        generatedAt: new Date(),
      });

      console.error("[ai_explanation_error]", {
        detectionId: payload.detectionId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: true, // Still return success with fallback
        explanation,
        model: "template-fallback",
        latency: Date.now() - startTime,
        tokensUsed: null,
      };
    }
  },
});
