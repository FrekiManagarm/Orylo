import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { customerTrustScores } from "@orylo/database";
import { eq, and } from "drizzle-orm";

/**
 * Trust Score Management
 *
 * AC1: Table customer_trust_scores with score 0-100
 * AC2: New customer = 50 (neutral)
 * AC3: Score evolution rules
 * AC5: Redis caching
 * AC6: Async updates (don't block detection)
 */

/**
 * Trust Score Event Types (AC3)
 */
export type TrustScoreEvent =
  | "successful_payment" // +5
  | "chargeback" // -50
  | "blocked_transaction" // -10
  | "whitelisted"; // Set to 90

/**
 * Trust Score Evolution Rules (AC3)
 */
const SCORE_CHANGES: Record<TrustScoreEvent, number | "set"> = {
  successful_payment: 5, // Increment by 5
  chargeback: -50, // Decrement by 50
  blocked_transaction: -10, // Decrement by 10
  whitelisted: "set", // Set to 90 (manual override)
};

/**
 * Get Trust Score for a Customer
 *
 * AC2: New customer = 50
 * AC5: Redis cache (TTL 1h)
 *
 * @param organizationId - Organization ID
 * @param customerId - Stripe customer ID
 * @returns Trust score (0-100)
 */
export async function getTrustScore(
  organizationId: string,
  customerId: string,
): Promise<number> {
  try {
    // AC5: Try cache first
    const cacheKey = `trust:${organizationId}:${customerId}`;
    const cached = await redis.get<{ score: number }>(cacheKey);

    if (cached && typeof cached.score === "number") {
      console.info("[trust_score_cache_hit]", {
        organizationId,
        customerId,
        score: cached.score,
      });
      return cached.score;
    }

    // Cache miss → Query DB
    console.info("[trust_score_cache_miss]", {
      organizationId,
      customerId,
    });

    const record = await db
      .select()
      .from(customerTrustScores)
      .where(
        and(
          eq(customerTrustScores.organizationId, organizationId),
          eq(customerTrustScores.customerId, customerId),
        ),
      )
      .limit(1);

    let score = 50; // AC2: Default for new customers

    if (record.length > 0) {
      score = record[0].trustScore;
    } else {
      // AC2: Create new customer with neutral score
      await db.insert(customerTrustScores).values({
        customerId,
        organizationId,
        trustScore: 50,
        status: "normal",
      });

      console.info("[trust_score_customer_created]", {
        organizationId,
        customerId,
        score: 50,
      });
    }

    // AC5: Cache for 1 hour
    await redis.set(
      cacheKey,
      { score, updatedAt: new Date().toISOString() },
      { ex: 3600 },
    );

    return score;
  } catch (error) {
    // Graceful degradation
    console.error("[trust_score_error]", {
      organizationId,
      customerId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Return neutral score on error
    return 50;
  }
}

/**
 * Update Trust Score based on event
 *
 * AC3: Score evolution rules
 * AC6: Async (don't block detection)
 *
 * @param organizationId - Organization ID
 * @param customerId - Stripe customer ID
 * @param event - Trust score event
 */
export async function updateTrustScore(
  organizationId: string,
  customerId: string,
  event: TrustScoreEvent,
): Promise<void> {
  try {
    console.info("[trust_score_update_start]", {
      organizationId,
      customerId,
      event,
    });

    // Get current record (or create if doesn't exist)
    let record = await db
      .select()
      .from(customerTrustScores)
      .where(
        and(
          eq(customerTrustScores.organizationId, organizationId),
          eq(customerTrustScores.customerId, customerId),
        ),
      )
      .limit(1);

    if (record.length === 0) {
      // Create new customer
      await db.insert(customerTrustScores).values({
        customerId,
        organizationId,
        trustScore: 50,
        status: "normal",
      });

      record = await db
        .select()
        .from(customerTrustScores)
        .where(
          and(
            eq(customerTrustScores.organizationId, organizationId),
            eq(customerTrustScores.customerId, customerId),
          ),
        )
        .limit(1);
    }

    const currentScore = record[0].trustScore;
    const scoreChange = SCORE_CHANGES[event];

    let newScore: number;

    // AC3: Apply score evolution rules
    if (event === "whitelisted") {
      // Manual override - set to 90
      newScore = 90;
    } else {
      // Calculate new score with min/max bounds
      newScore = Math.max(
        0,
        Math.min(100, currentScore + (scoreChange as number)),
      );
    }

    // Update database
    await db
      .update(customerTrustScores)
      .set({
        trustScore: newScore,
        lastSeenAt: new Date(),
        updatedAt: new Date(),
        // Update stats based on event
        ...(event === "successful_payment" && {
          totalTransactions: record[0].totalTransactions + 1,
        }),
        ...(event === "chargeback" && {
          fraudulentTransactions: record[0].fraudulentTransactions + 1,
        }),
        ...(event === "whitelisted" && {
          status: "whitelisted",
        }),
      })
      .where(eq(customerTrustScores.id, record[0].id));

    // AC5: Invalidate Redis cache
    const cacheKey = `trust:${organizationId}:${customerId}`;
    await redis.del(cacheKey);

    console.info("[trust_score_update_complete]", {
      organizationId,
      customerId,
      event,
      oldScore: currentScore,
      newScore,
      change: newScore - currentScore,
    });
  } catch (error) {
    // AC6: Log error but don't crash (async update)
    console.error("[trust_score_update_error]", {
      organizationId,
      customerId,
      event,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get Trust Score Level
 *
 * Helper function to determine risk level from score
 *
 * @param score - Trust score (0-100)
 * @returns Risk level
 */
export function getTrustScoreLevel(
  score: number,
): "HIGH_RISK" | "MEDIUM_RISK" | "LOW_RISK" {
  if (score < 30) {
    return "HIGH_RISK"; // Untrusted
  } else if (score <= 70) {
    return "MEDIUM_RISK"; // Neutral
  } else {
    return "LOW_RISK"; // Trusted
  }
}
