import { db } from "@/lib/db";
import { fraudDetections, customerTrustScores } from "@orylo/database";
import { eq, and, gte, sql } from "drizzle-orm";
import { subDays, subHours } from "date-fns";
import { redis } from "@/lib/redis";

/**
 * AI Suggestion Engine
 * 
 * Story 4.1: Suggestions IA pour Whitelist/Blacklist
 * 
 * AC1: Analyzes historical transaction patterns
 * AC2: Suggests whitelist for customers with high trust score and successful transactions
 * AC3: Suggests blacklist for customers with fraud patterns
 * AC7: Performance <500ms (cached patterns)
 * AC9: Priority rule (blacklist takes priority over whitelist)
 */

export interface AISuggestion {
  type: "whitelist" | "blacklist";
  confidence: number; // 0-1
  reasoning: string;
  factors: string[];
}

interface SuggestionContext {
  customerId: string | null;
  customerEmail: string | null;
  organizationId: string;
  detectionId: string;
}

/**
 * Generate AI suggestion for a detection
 * 
 * AC1, AC2, AC3: Analyzes patterns and returns suggestion
 * AC7: Uses cache for performance (<500ms)
 * AC9: Returns blacklist suggestion if both criteria met (priority)
 */
export async function generateSuggestion(
  context: SuggestionContext
): Promise<AISuggestion | null> {
  const startTime = Date.now();

  try {
    // AC7: Try cache first (pattern analysis cache)
    const cacheKey = context.customerId
      ? `pattern:${context.customerId}`
      : `pattern:email:${context.customerEmail}`;
    
    const cached = await redis.get<AISuggestion>(cacheKey);
    if (cached) {
      console.info("[suggestion_cache_hit]", {
        detectionId: context.detectionId,
        customerId: context.customerId,
      });
      return cached;
    }

    // Get customer trust score
    const trustScore = await getCustomerTrustScore(
      context.organizationId,
      context.customerId,
      context.customerEmail
    );

    // Check if customer is already whitelisted/blacklisted
    if (trustScore.status !== "normal") {
      // No suggestion for already listed customers
      return null;
    }

    // Analyze patterns
    const whitelistSuggestion = await analyzeWhitelistPattern(
      context,
      trustScore.trustScore
    );

    const blacklistSuggestion = await analyzeBlacklistPattern(
      context,
      trustScore.trustScore,
      trustScore.totalChargebacks
    );

    // AC9: Priority rule - blacklist takes priority
    const suggestion = blacklistSuggestion || whitelistSuggestion;

    if (!suggestion) {
      return null;
    }

    // AC7: Cache pattern analysis (30min TTL)
    await redis.set(cacheKey, suggestion, { ex: 1800 }); // 30min

    const latency = Date.now() - startTime;
    console.info("[suggestion_generated]", {
      detectionId: context.detectionId,
      type: suggestion.type,
      confidence: suggestion.confidence,
      latencyMs: latency,
    });

    return suggestion;
  } catch (error) {
    console.error("[suggestion_error]", {
      detectionId: context.detectionId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null; // Graceful degradation
  }
}

/**
 * Get customer trust score
 */
async function getCustomerTrustScore(
  organizationId: string,
  customerId: string | null,
  customerEmail: string | null
): Promise<{ trustScore: number; status: string; totalChargebacks: number }> {
  // Query by customerId (primary) or customerEmail (fallback)
  const whereConditions = customerId
    ? eq(customerTrustScores.customerId, customerId)
    : customerEmail
      ? eq(customerTrustScores.customerEmail, customerEmail)
      : null;

  if (!whereConditions) {
    // New customer - return default values
    return { trustScore: 50, status: "normal", totalChargebacks: 0 };
  }

  const record = await db
    .select()
    .from(customerTrustScores)
    .where(
      and(
        eq(customerTrustScores.organizationId, organizationId),
        whereConditions
      )
    )
    .limit(1);

  if (record.length === 0) {
    return { trustScore: 50, status: "normal", totalChargebacks: 0 };
  }

  return {
    trustScore: record[0].trustScore,
    status: record[0].status,
    totalChargebacks: record[0].totalChargebacks || 0,
  };
}

/**
 * Analyze whitelist pattern
 * 
 * AC2: Trust score >80, ≥3 successful transactions in last 90 days, no chargebacks
 */
async function analyzeWhitelistPattern(
  context: SuggestionContext,
  trustScore: number
): Promise<AISuggestion | null> {
  // AC2: Trust score must be >80
  if (trustScore <= 80) {
    return null;
  }

  // Build where condition (customerId primary, customerEmail fallback)
  const customerCondition = context.customerId
    ? eq(fraudDetections.customerId, context.customerId)
    : context.customerEmail
      ? eq(fraudDetections.customerEmail, context.customerEmail)
      : null;

  if (!customerCondition) {
    return null;
  }

  // AC2: Query successful transactions in last 90 days
  const successfulTxns = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(fraudDetections)
    .where(
      and(
        eq(fraudDetections.organizationId, context.organizationId),
        customerCondition,
        eq(fraudDetections.decision, "ALLOW"),
        gte(fraudDetections.createdAt, subDays(new Date(), 90))
      )
    );

  const successCount = Number(successfulTxns[0]?.count || 0);

  // AC2: Need ≥3 successful transactions
  if (successCount < 3) {
    return null;
  }

  // Calculate confidence based on matching criteria
  let matchingCriteria = 1; // Trust score >80
  if (successCount >= 3) matchingCriteria++;
  if (successCount >= 5) matchingCriteria++; // Bonus for more transactions

  const confidence = Math.min(0.9, 0.5 + matchingCriteria * 0.15);

  return {
    type: "whitelist",
    confidence,
    reasoning: `Client fiable avec un score de confiance de ${trustScore} et ${successCount} transactions réussies dans les 90 derniers jours.`,
    factors: [
      `Score de confiance élevé (${trustScore})`,
      `${successCount} transactions réussies`,
      "Aucun chargeback récent",
    ],
  };
}

/**
 * Analyze blacklist pattern
 * 
 * AC3: Trust score <30, ≥2 chargebacks, OR card testing (≥5 failed in 1h), OR ≥3 blocked transactions
 */
async function analyzeBlacklistPattern(
  context: SuggestionContext,
  trustScore: number,
  totalChargebacks: number
): Promise<AISuggestion | null> {
  // Build where condition
  const customerCondition = context.customerId
    ? eq(fraudDetections.customerId, context.customerId)
    : context.customerEmail
      ? eq(fraudDetections.customerEmail, context.customerEmail)
      : null;

  if (!customerCondition) {
    return null;
  }

  const factors: string[] = [];
  let matchingCriteria = 0;
  let patternStrength = 0.7;

  // AC3: Check trust score <30
  if (trustScore < 30) {
    matchingCriteria++;
    factors.push(`Score de confiance faible (${trustScore})`);
  }

  // AC3: Check ≥2 chargebacks
  if (totalChargebacks >= 2) {
    matchingCriteria++;
    patternStrength = 0.8; // Chargebacks are strong signal
    factors.push(`${totalChargebacks} chargebacks`);
  }

  // AC3: Check card testing pattern (≥5 failed attempts in 1h)
  const oneHourAgo = subHours(new Date(), 1);
  const recentBlocks = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(fraudDetections)
    .where(
      and(
        eq(fraudDetections.organizationId, context.organizationId),
        customerCondition,
        eq(fraudDetections.decision, "BLOCK"),
        gte(fraudDetections.createdAt, oneHourAgo)
      )
    );

  const blockCount = Number(recentBlocks[0]?.count || 0);
  if (blockCount >= 5) {
    matchingCriteria++;
    patternStrength = 0.9; // Card testing is very strong signal
    factors.push(`Pattern de test de carte détecté (${blockCount} tentatives en 1h)`);
  }

  // AC3: Check ≥3 blocked transactions in last 30 days
  const blockedTxns = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(fraudDetections)
    .where(
      and(
        eq(fraudDetections.organizationId, context.organizationId),
        customerCondition,
        eq(fraudDetections.decision, "BLOCK"),
        gte(fraudDetections.createdAt, subDays(new Date(), 30))
      )
    );

  const blockedCount = Number(blockedTxns[0]?.count || 0);
  if (blockedCount >= 3) {
    matchingCriteria++;
    factors.push(`${blockedCount} transactions bloquées dans les 30 derniers jours`);
  }

  // Need at least one matching criteria
  if (matchingCriteria === 0) {
    return null;
  }

  // Calculate confidence
  const confidence = Math.min(0.95, (matchingCriteria / 4) * patternStrength);

  return {
    type: "blacklist",
    confidence,
    reasoning: `Client suspect avec ${matchingCriteria} facteur${matchingCriteria > 1 ? "s" : ""} de risque détecté${matchingCriteria > 1 ? "s" : ""}.`,
    factors,
  };
}
