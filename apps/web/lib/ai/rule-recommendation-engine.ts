import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, and, gte, sql } from "drizzle-orm";
import { subDays } from "date-fns";
import type { DetectorResult } from "@orylo/fraud-engine";
import type { SimpleCondition } from "@/lib/fraud/custom-rules";

/**
 * Rule Recommendation Engine
 * 
 * Story 4.3: AC1, AC2, AC3 - Analyze merchant transactions and generate rule recommendations
 */

export interface RuleRecommendation {
  type: "amount_threshold" | "velocity_limit" | "geo_restriction";
  name: string;
  condition: SimpleCondition;
  action: "BLOCK" | "REVIEW" | "ALLOW";
  scoreModifier: number;
  confidence: number; // 0-1
  reasoning: string;
  estimatedImpact?: {
    blocks: number;
    falsePositives: number;
    truePositives: number;
  };
}

interface MerchantTransactionStats {
  organizationId: string;
  averageAmount: number;
  amountDistribution: { min: number; max: number; median: number };
  geoPatterns: { country: string; count: number }[];
  velocityPatterns: { hour: number; count: number }[];
  fraudPatterns: {
    unusualAmounts: number[];
    geoMismatches: number;
    velocitySpikes: number;
  };
}

/**
 * Generate rule recommendations for an organization
 * 
 * AC1: Analyzes merchant's transaction patterns (last 90 days)
 * AC2: Identifies common fraud patterns
 * AC3: Generates rule suggestions compatible with custom_rules format
 */
export async function generateRuleRecommendations(
  organizationId: string
): Promise<RuleRecommendation[]> {
  try {
    // AC1: Query fraud_detections for last 90 days
    const ninetyDaysAgo = subDays(new Date(), 90);
    const detections = await db
      .select()
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.organizationId, organizationId),
          gte(fraudDetections.createdAt, ninetyDaysAgo)
        )
      );

    if (detections.length === 0) {
      return []; // No history, no recommendations
    }

    // AC1: Calculate statistics
    const stats = calculateTransactionStats(detections);

    // AC2: Identify fraud patterns
    const patterns = identifyFraudPatterns(detections, stats);

    // AC3: Generate rule recommendations
    const recommendations: RuleRecommendation[] = [];

    // Amount threshold recommendation
    if (patterns.unusualAmounts.length > 0) {
      const highAmountRecommendation = generateAmountThresholdRecommendation(
        stats,
        patterns
      );
      if (highAmountRecommendation) {
        recommendations.push(highAmountRecommendation);
      }
    }

    // Velocity limit recommendation
    if (patterns.velocitySpikes > 0) {
      const velocityRecommendation = generateVelocityLimitRecommendation(
        stats,
        patterns
      );
      if (velocityRecommendation) {
        recommendations.push(velocityRecommendation);
      }
    }

    // Geo restriction recommendation
    if (patterns.geoMismatches > 0) {
      const geoRecommendation = generateGeoRestrictionRecommendation(
        stats,
        patterns
      );
      if (geoRecommendation) {
        recommendations.push(geoRecommendation);
      }
    }

    return recommendations;
  } catch (error) {
    console.error("[rule_recommendation_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}

/**
 * Calculate transaction statistics
 */
function calculateTransactionStats(
  detections: Array<{
    amount: number;
    detectorResults: unknown;
    decision: string;
  }>
): MerchantTransactionStats {
  const amounts = detections.map((d) => d.amount).sort((a, b) => a - b);
  const averageAmount =
    amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
  const min = amounts[0] || 0;
  const max = amounts[amounts.length - 1] || 0;
  const median =
    amounts.length > 0
      ? amounts[Math.floor(amounts.length / 2)]
      : averageAmount;

  // Extract geo patterns from detectorResults
  const geoPatterns: Record<string, number> = {};
  detections.forEach((d) => {
    const detectorResults = (d.detectorResults || []) as DetectorResult[];
    const geoDetector = detectorResults.find(
      (r) => String(r.detectorId).includes("geolocation")
    );
    const ipCountry =
      (geoDetector?.metadata as { ipCountry?: string } | undefined)
        ?.ipCountry || null;
    if (ipCountry) {
      geoPatterns[ipCountry] = (geoPatterns[ipCountry] || 0) + 1;
    }
  });

  const geoPatternsArray = Object.entries(geoPatterns)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    organizationId: "", // Will be set by caller
    averageAmount,
    amountDistribution: { min, max, median },
    geoPatterns: geoPatternsArray,
    velocityPatterns: [], // Calculated separately
    fraudPatterns: {
      unusualAmounts: [],
      geoMismatches: 0,
      velocitySpikes: 0,
    },
  };
}

/**
 * Identify fraud patterns
 * 
 * AC2: Unusual amounts, geo mismatches, velocity spikes
 */
function identifyFraudPatterns(
  detections: Array<{
    amount: number;
    detectorResults: unknown;
    decision: string;
  }>,
  stats: MerchantTransactionStats
): {
  unusualAmounts: number[];
  geoMismatches: number;
  velocitySpikes: number;
} {
  const unusualAmounts: number[] = [];
  let geoMismatches = 0;
  let velocitySpikes = 0;

  detections.forEach((detection) => {
    // AC2: Unusual amounts (>2x or <0.1x average)
    if (
      detection.amount > stats.averageAmount * 2 ||
      detection.amount < stats.averageAmount * 0.1
    ) {
      unusualAmounts.push(detection.amount);
    }

    // AC2: Geo mismatches (IP ≠ card country)
    const detectorResults = (detection.detectorResults || []) as DetectorResult[];
    const geoDetector = detectorResults.find((r) =>
      String(r.detectorId).includes("geolocation")
    );
    if (geoDetector) {
      const metadata = geoDetector.metadata as
        | { ipCountry?: string; cardCountry?: string }
        | undefined;
      const ipCountry = metadata?.ipCountry;
      const cardCountry = metadata?.cardCountry;
      if (ipCountry && cardCountry && ipCountry !== cardCountry) {
        geoMismatches++;
      }
    }

    // AC2: Velocity spikes (>10 tx/hour)
    const velocityDetector = detectorResults.find((r) =>
      String(r.detectorId).includes("velocity")
    );
    if (velocityDetector) {
      const txCount =
        (velocityDetector.metadata as { txCount?: number } | undefined)
          ?.txCount || 0;
      if (txCount > 10) {
        velocitySpikes++;
      }
    }
  });

  return {
    unusualAmounts,
    geoMismatches,
    velocitySpikes,
  };
}

/**
 * Generate amount threshold recommendation
 */
function generateAmountThresholdRecommendation(
  stats: MerchantTransactionStats,
  patterns: {
    unusualAmounts: number[];
    geoMismatches: number;
    velocitySpikes: number;
  }
): RuleRecommendation | null {
  if (patterns.unusualAmounts.length === 0) {
    return null;
  }

  // Find high amount threshold (block transactions >2x average)
  const highAmountThreshold = Math.round(stats.averageAmount * 2);
  const highAmountCount = patterns.unusualAmounts.filter(
    (a) => a > highAmountThreshold
  ).length;

  if (highAmountCount < 3) {
    return null; // Not enough pattern
  }

  const confidence = Math.min(0.9, 0.5 + (highAmountCount / 10) * 0.4);

  return {
    type: "amount_threshold",
    name: "Bloquer les transactions à montant élevé",
    condition: {
      field: "amount",
      operator: ">",
      value: highAmountThreshold,
    },
    action: "BLOCK",
    scoreModifier: 0,
    confidence,
    reasoning: `${highAmountCount} transactions avec un montant supérieur à ${highAmountThreshold / 100}€ ont été détectées. Recommandation: bloquer les transactions >${highAmountThreshold / 100}€.`,
  };
}

/**
 * Generate velocity limit recommendation
 */
function generateVelocityLimitRecommendation(
  stats: MerchantTransactionStats,
  patterns: {
    unusualAmounts: number[];
    geoMismatches: number;
    velocitySpikes: number;
  }
): RuleRecommendation | null {
  if (patterns.velocitySpikes === 0) {
    return null;
  }

  const confidence = Math.min(0.9, 0.5 + (patterns.velocitySpikes / 10) * 0.4);

  return {
    type: "velocity_limit",
    name: "Bloquer le test de carte (vélocité élevée)",
    condition: {
      field: "velocity",
      operator: ">",
      value: 10,
    },
    action: "BLOCK",
    scoreModifier: 0,
    confidence,
    reasoning: `${patterns.velocitySpikes} patterns de test de carte détectés (>10 transactions/heure). Recommandation: bloquer les transactions avec vélocité >10.`,
  };
}

/**
 * Generate geo restriction recommendation
 */
function generateGeoRestrictionRecommendation(
  stats: MerchantTransactionStats,
  patterns: {
    unusualAmounts: number[];
    geoMismatches: number;
    velocitySpikes: number;
  }
): RuleRecommendation | null {
  if (patterns.geoMismatches === 0) {
    return null;
  }

  // Find suspicious countries (countries with high mismatch rate)
  const suspiciousCountries = stats.geoPatterns
    .filter((p) => p.count > 5)
    .slice(0, 3)
    .map((p) => p.country);

  if (suspiciousCountries.length === 0) {
    return null;
  }

  const confidence = Math.min(
    0.85,
    0.5 + (patterns.geoMismatches / 20) * 0.35
  );

  return {
    type: "geo_restriction",
    name: "Bloquer les pays suspects",
    condition: {
      field: "ip_country",
      operator: "IN",
      value: suspiciousCountries,
    },
    action: "BLOCK",
    scoreModifier: 0,
    confidence,
    reasoning: `${patterns.geoMismatches} incohérences géographiques détectées. Recommandation: bloquer les transactions depuis ${suspiciousCountries.join(", ")}.`,
  };
}
