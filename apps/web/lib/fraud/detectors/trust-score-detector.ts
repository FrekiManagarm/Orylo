import {
  IDetector,
  FraudDetectionContext,
  FraudDetectionResult,
  FraudScoreSeverity,
  DetectorIdSchema,
} from "@orylo/fraud-engine";
import { getTrustScore, getTrustScoreLevel } from "../trust-score";

/**
 * Trust Score Detector
 * 
 * Rewards trusted repeat customers, penalizes problematic ones
 * 
 * AC2: New customer = 50 (neutral)
 * AC4: Thresholds: <30=HIGH(+40), 30-70=MEDIUM(+20), >70=LOW(+0)
 * AC5: Redis cached (via getTrustScore)
 * 
 * Updates happen async after detection (AC6 - via webhook handler)
 */
export class TrustScoreDetector implements IDetector {
  readonly id = DetectorIdSchema.parse("trust-score-detector");
  readonly name = "Trust Score Detector";
  readonly description =
    "Rewards trusted repeat customers based on historical behavior";
  readonly severity = 40; // Base score for HIGH risk

  /**
   * Execute trust score detection
   * 
   * @param context - Fraud detection context with customer data
   * @returns Detection result or null if error
   */
  async execute(
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult | null> {
    const startTime = Date.now();

    try {
      // Extract customerId from metadata
      const customerId = context.metadata?.customerId as string | undefined;

      if (!customerId) {
        console.warn("[trust_score_detector_no_customer_id]", {
          paymentIntentId: context.paymentIntentId,
        });

        // Return neutral score for anonymous transactions
        return {
          detectorId: this.id,
          score: {
            value: 20, // MEDIUM risk for anonymous
            severity: FraudScoreSeverity.MEDIUM,
            reason: "No customer ID - cannot assess trust history",
            detectorId: this.id,
          },
          details: {
            trustScore: 50,
            level: "MEDIUM_RISK",
            isNewCustomer: true,
            reason: "anonymous_customer",
          },
        };
      }

      // AC5: Get trust score (cached via Redis)
      const trustScore = await getTrustScore(
        context.organizationId,
        customerId
      );

      // AC4: Apply thresholds
      const { score, severity, reason } = this.calculateRisk(trustScore);
      const level = getTrustScoreLevel(trustScore);

      const latency = Date.now() - startTime;

      // Log if slow (>20ms including DB/cache lookup)
      if (latency > 20) {
        console.warn("[trust_score_detector_slow]", {
          paymentIntentId: context.paymentIntentId,
          latencyMs: latency,
          threshold: 20,
        });
      }

      console.info("[trust_score_detector_executed]", {
        paymentIntentId: context.paymentIntentId,
        customerId,
        trustScore,
        level,
        detectorScore: score,
        latencyMs: latency,
      });

      return {
        detectorId: this.id,
        score: {
          value: score,
          severity,
          reason,
          detectorId: this.id,
        },
        details: {
          trustScore,
          level,
          isNewCustomer: trustScore === 50, // Heuristic
          latencyMs: latency,
        },
      };
    } catch (error) {
      // Graceful degradation on error
      console.error("[trust_score_detector_error]", {
        paymentIntentId: context.paymentIntentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Return null to skip detector (don't block detection)
      return null;
    }
  }

  /**
   * Calculate risk score based on trust score
   * 
   * AC4: Threshold logic
   * - <30: HIGH risk (+40)
   * - 30-70: MEDIUM risk (+20)
   * - >70: LOW risk (+0)
   */
  private calculateRisk(trustScore: number): {
    score: number;
    severity: FraudScoreSeverity;
    reason: string;
  } {
    if (trustScore < 30) {
      // AC4: HIGH risk - untrusted customer
      return {
        score: 40,
        severity: FraudScoreSeverity.HIGH,
        reason: `Low trust score: ${trustScore}/100 (threshold: <30)`,
      };
    } else if (trustScore <= 70) {
      // AC4: MEDIUM risk - neutral customer
      return {
        score: 20,
        severity: FraudScoreSeverity.MEDIUM,
        reason: `Medium trust score: ${trustScore}/100 (threshold: 30-70)`,
      };
    } else {
      // AC4: LOW risk - trusted customer
      return {
        score: 0,
        severity: FraudScoreSeverity.LOW,
        reason: `High trust score: ${trustScore}/100 (threshold: >70)`,
      };
    }
  }
}
