import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

/**
 * Rate Limiters
 * 
 * Story 4.1: ADR-010 Layer 6 - Rate limiting for AI suggestions endpoints
 * Story 4.2: AC8 - Rate limiting for AI explanations (10 explanations/minute per organization)
 */

// GET /api/detections/[id]/suggestions: 100 req/min per organization
export const suggestionGetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:suggestion:get",
});

// POST /api/suggestions/[id]/accept: 50 req/min per organization
export const suggestionAcceptRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "ratelimit:suggestion:accept",
});

// POST /api/suggestions/[id]/reject: 50 req/min per organization
export const suggestionRejectRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "ratelimit:suggestion:reject",
});

// Story 4.2: AC8 - AI Explanation generation: 10 explanations/minute per organization
export const explanationGenerationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:explanation:generate",
});

// Story 4.3: AC4 - Rule recommendations endpoints
export const ruleRecommendationsGetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "ratelimit:rule-recommendations:get",
});

export const ruleRecommendationsApplyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:rule-recommendations:apply",
});

export const ruleRecommendationsPreviewRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "ratelimit:rule-recommendations:preview",
});
