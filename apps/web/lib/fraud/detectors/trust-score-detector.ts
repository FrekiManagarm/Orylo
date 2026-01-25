import {
  IDetector,
  DetectionContext,
  DetectorResult,
  createDetectorId,
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
  readonly id = createDetectorId("trust-score-detector");
  readonly name = "Trust Score Detector";
  readonly description =
    "Rewards trusted repeat customers based on historical behavior";
  readonly priority = 3; // Lower priority - may require DB lookup

  /**
   * Execute trust score detection
   * 
   * @param context - Fraud detection context with customer data
   * @returns Detection result
   */
  async detect(
    context: DetectionContext
  ): Promise<DetectorResult> {
    const startTime = Date.now();

    try {
      // Extract customerId from context
      const customerId = context.customerId;

      if (!customerId) {
        console.warn("[trust_score_detector_no_customer_id]", {
          paymentIntentId: context.paymentIntentId,
        });

        // Return neutral score for anonymous transactions
        return {
          detectorId: this.id,
          score: 20, // MEDIUM risk for anonymous
          confidence: 50,
          reason: "No customer ID - cannot assess trust history",
          metadata: {
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
      const { score, reason, confidence } = this.calculateRisk(trustScore);
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
        score,
        confidence,
        reason,
        metadata: {
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

      // Return neutral result instead of null
      return {
        detectorId: this.id,
        score: 0,
        confidence: 0,
        reason: "Trust score detector error - skipped",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
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
    reason: string;
    confidence: number;
  } {
    if (trustScore < 30) {
      // AC4: HIGH risk - untrusted customer
      return {
        score: 40,
        confidence: 85,
        reason: `Low trust score: ${trustScore}/100 (threshold: <30)`,
      };
    } else if (trustScore <= 70) {
      // AC4: MEDIUM risk - neutral customer
      return {
        score: 20,
        confidence: 75,
        reason: `Medium trust score: ${trustScore}/100 (threshold: 30-70)`,
      };
    } else {
      // AC4: LOW risk - trusted customer
      return {
        score: 0,
        confidence: 90,
        reason: `High trust score: ${trustScore}/100 (threshold: >70)`,
      };
    }
  }
}
