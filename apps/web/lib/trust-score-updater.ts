import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { customerTrustScores } from "@orylo/database";
import { eq, and, sql } from "drizzle-orm";
import { logger, logChargeback } from "@/lib/logger";
import { alertAutoBlacklist } from "@/lib/alerts";

/**
 * Trust Score Updater for Chargebacks
 *
 * Story 3.2: Auto-update trust scores when chargebacks occur
 * AC2: Apply -50 penalty
 * AC3: Auto-blacklist after ≥3 chargebacks
 * AC4: Track totalChargebacks and lastChargebackDate
 * AC5: Invalidate Redis cache
 */

/**
 * Apply chargeback penalty to customer trust score
 *
 * AC2: Reduces trust score by 50 points (minimum 0)
 * AC3: Auto-blacklists if totalChargebacks ≥ 3
 * AC4: Updates totalChargebacks and lastChargebackDate
 * AC5: Invalidates Redis cache
 */
export async function applyChargebackPenalty(
  customerId: string,
  organizationId: string
): Promise<void> {
  // Use transaction for atomicity
  await db.transaction(async (tx) => {
    // AC2 & AC4: Update trust score with -50 penalty + metadata
    const updated = await tx
      .update(customerTrustScores)
      .set({
        trustScore: sql`GREATEST(trust_score - 50, 0)`, // Min 0
        totalChargebacks: sql`total_chargebacks + 1`,
        lastChargebackDate: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(customerTrustScores.customerId, customerId),
          eq(customerTrustScores.organizationId, organizationId)
        )
      )
      .returning();

    if (updated.length === 0) {
      // Customer trust score doesn't exist yet - create with penalty
      const newRecord = await tx.insert(customerTrustScores).values({
        customerId,
        organizationId,
        trustScore: 0, // Start at 0 due to chargeback
        totalChargebacks: 1,
        lastChargebackDate: new Date(),
        status: "normal", // Will be blacklisted if ≥3 chargebacks
      }).returning();

      logger.info("Created trust score for customer with chargeback penalty", {
        customerId,
        organizationId,
        score: 0,
        totalChargebacks: 1,
      });
      return newRecord[0];
    }

    const customer = updated[0];
    logChargeback(customerId, organizationId, customer.totalChargebacks);

    logger.info("Chargeback penalty applied", {
      customerId,
      organizationId,
      newScore: customer.trustScore,
      totalChargebacks: customer.totalChargebacks,
    });

    // AC3: Auto-blacklist if ≥3 chargebacks
    if (customer.totalChargebacks >= 3 && customer.status !== "blacklisted") {
      await tx
        .update(customerTrustScores)
        .set({ status: "blacklisted" })
        .where(
          and(
            eq(customerTrustScores.customerId, customerId),
            eq(customerTrustScores.organizationId, organizationId)
          )
        );

      logger.warn("Customer auto-blacklisted due to chargebacks", {
        customerId,
        organizationId,
        totalChargebacks: customer.totalChargebacks,
      });

      // Story 3.3 AC6: Send email alert (optional)
      await alertAutoBlacklist(customerId, customer.totalChargebacks);
    }

    return customer;
  });

  // AC5: Invalidate Redis cache
  try {
    await redis.del(`trust:${organizationId}:${customerId}`);
    logger.debug("Cache invalidated for customer", { customerId, organizationId });
  } catch (error) {
    // Non-critical - log warning but don't fail
    logger.warn("Cache invalidation failed", {
      customerId,
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
