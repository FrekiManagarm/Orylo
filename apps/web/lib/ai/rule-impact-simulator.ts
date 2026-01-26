import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, and, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import type { SimpleCondition } from "@/lib/fraud/custom-rules";
import type { DetectorResult } from "@orylo/fraud-engine";

/**
 * Rule Impact Simulator
 * 
 * Story 4.3: AC5 - Simulate rule impact on historical transactions
 */

export interface ImpactPreview {
  blocks: number;
  falsePositives: number;
  truePositives: number;
  totalTransactions: number;
  blockRate: number; // percentage
}

/**
 * Simulate rule impact on last 30 days of transactions
 * 
 * AC5: Preview rule impact before applying
 */
export async function simulateRuleImpact(
  organizationId: string,
  condition: SimpleCondition
): Promise<ImpactPreview> {
  try {
    // Query last 30 days of transactions
    const thirtyDaysAgo = subDays(new Date(), 30);
    const detections = await db
      .select()
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.organizationId, organizationId),
          gte(fraudDetections.createdAt, thirtyDaysAgo)
        )
      );

    let blocks = 0;
    let falsePositives = 0;
    let truePositives = 0;

    detections.forEach((detection) => {
      // Extract metadata from detectorResults
      const detectorResults = (detection.detectorResults || []) as DetectorResult[];
      const metadata = extractMetadata(detectorResults, detection);

      // Evaluate condition
      const matches = evaluateCondition(condition, detection, metadata);

      if (matches) {
        blocks++;
        // True positive: if original decision was BLOCK
        if (detection.decision === "BLOCK") {
          truePositives++;
        } else {
          // False positive: if original decision was ALLOW or REVIEW
          falsePositives++;
        }
      }
    });

    const totalTransactions = detections.length;
    const blockRate = totalTransactions > 0 ? (blocks / totalTransactions) * 100 : 0;

    return {
      blocks,
      falsePositives,
      truePositives,
      totalTransactions,
      blockRate,
    };
  } catch (error) {
    console.error("[rule_impact_simulation_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      blocks: 0,
      falsePositives: 0,
      truePositives: 0,
      totalTransactions: 0,
      blockRate: 0,
    };
  }
}

/**
 * Extract metadata from detector results
 */
function extractMetadata(
  detectorResults: DetectorResult[],
  detection: { amount: number; customerEmail: string | null }
): {
  ipCountry: string | null;
  cardCountry: string | null;
  velocity: number;
  amount: number;
} {
  const geoDetector = detectorResults.find((r) =>
    String(r.detectorId).includes("geolocation")
  );
  const velocityDetector = detectorResults.find((r) =>
    String(r.detectorId).includes("velocity")
  );

  const geoMetadata = geoDetector?.metadata as
    | { ipCountry?: string; cardCountry?: string }
    | undefined;
  const velocityMetadata = velocityDetector?.metadata as
    | { txCount?: number }
    | undefined;

  return {
    ipCountry: geoMetadata?.ipCountry || null,
    cardCountry: geoMetadata?.cardCountry || null,
    velocity: velocityMetadata?.txCount || 0,
    amount: detection.amount,
  };
}

/**
 * Evaluate condition against detection
 */
function evaluateCondition(
  condition: SimpleCondition,
  detection: { amount: number; customerEmail: string | null },
  metadata: {
    ipCountry: string | null;
    cardCountry: string | null;
    velocity: number;
    amount: number;
  }
): boolean {
  const fieldValue = getFieldValue(condition.field, detection, metadata);
  const targetValue = condition.value;

  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  switch (condition.operator) {
    case ">":
      return Number(fieldValue) > Number(targetValue);
    case "<":
      return Number(fieldValue) < Number(targetValue);
    case "=":
      return String(fieldValue) === String(targetValue);
    case "!=":
      return String(fieldValue) !== String(targetValue);
    case "IN":
      return (targetValue as string[]).includes(String(fieldValue));
    default:
      return false;
  }
}

/**
 * Get field value from detection context
 */
function getFieldValue(
  field: string,
  detection: { amount: number; customerEmail: string | null },
  metadata: {
    ipCountry: string | null;
    cardCountry: string | null;
    velocity: number;
    amount: number;
  }
): string | number | null {
  switch (field) {
    case "amount":
      return metadata.amount;
    case "velocity":
      return metadata.velocity;
    case "ip_country":
      return metadata.ipCountry;
    case "card_country":
      return metadata.cardCountry;
    case "customer_email":
      return detection.customerEmail;
    default:
      return null;
  }
}
