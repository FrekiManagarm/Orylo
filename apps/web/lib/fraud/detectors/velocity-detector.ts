import {
  IDetector,
  DetectionContext,
  DetectorResult,
  createDetectorId,
} from "@orylo/fraud-engine";
import { redis } from "@/lib/redis";

/**
 * Velocity Detector
 * 
 * Detects card testing attacks by counting transactions per hour
 * 
 * AC1: Query Redis for transaction count in last 1 hour
 * AC2: Thresholds: >10 tx/hour = HIGH (+40), 5-10 = MEDIUM (+20), <5 = LOW (+0)
 * AC3: Redis key: velocity:{customerId}:{hour} with 1h TTL
 * AC4: Return metadata with txCount, timeframe, threshold
 * AC5: First transaction = 0 velocity (no false positive)
 * AC6: Performance <10ms (Redis in-memory)
 */
export class VelocityDetector implements IDetector {
  readonly id = createDetectorId("velocity-detector");
  readonly name = "Velocity Detector";
  readonly description =
    "Flags customers with unusually high transaction counts per hour";
  readonly priority = 1; // High priority - fast detector

  /**
   * Execute velocity detection
   * 
   * @param context - Fraud detection context with customer data
   * @returns Detection result or null if error
   */
  async detect(
    context: DetectionContext
  ): Promise<DetectorResult> {
    const startTime = Date.now();

    try {
      // AC5: Handle missing customerId (first-time customer or anonymous)
      if (!context.customerId) {
        console.warn("[velocity_detector_no_customer_id]", {
          paymentIntentId: context.paymentIntentId,
        });
        // Return LOW risk for anonymous transactions
        return {
          detectorId: this.id,
          score: 0,
          confidence: 50,
          reason: "No customer ID - cannot track velocity",
          metadata: {
            txCount: 0,
            timeframe: "1h",
            threshold: 10,
            reason: "anonymous_customer",
          },
        };
      }

      const customerId = context.customerId;

      // AC3: Build Redis key with hour granularity
      const hour = this.getCurrentHour();
      const key = `velocity:${customerId}:${hour}`;

      // AC1: Increment transaction counter (creates key if doesn't exist)
      const txCount = await redis.incr(key);

      // AC3: Set TTL on first increment (1 hour = 3600 seconds)
      if (txCount === 1) {
        await redis.expire(key, 3600);
      }

      // AC2: Apply thresholds
      const { score, reason, confidence } = this.calculateRisk(txCount);

      // AC6: Log if slow (>10ms)
      const latency = Date.now() - startTime;
      if (latency > 10) {
        console.warn("[velocity_detector_slow]", {
          paymentIntentId: context.paymentIntentId,
          latencyMs: latency,
          threshold: 10,
        });
      }

      console.info("[velocity_detector_executed]", {
        paymentIntentId: context.paymentIntentId,
        customerId,
        txCount,
        score,
        latencyMs: latency,
      });

      // AC4: Return result with metadata
      return {
        detectorId: this.id,
        score,
        confidence,
        reason,
        metadata: {
          txCount,
          timeframe: "1h",
          threshold: 10,
          hour,
          latencyMs: latency,
        },
      };
    } catch (error) {
      // AC6: Graceful degradation on Redis error
      console.error("[velocity_detector_error]", {
        paymentIntentId: context.paymentIntentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Return neutral result instead of null (don't block detection)
      return {
        detectorId: this.id,
        score: 0,
        confidence: 0,
        reason: "Velocity detector error - skipped",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Calculate risk score based on transaction count
   * 
   * AC2: Threshold logic
   * - >10 tx/hour: HIGH risk (+40)
   * - 5-10 tx/hour: MEDIUM risk (+20)
   * - <5 tx/hour: LOW risk (+0)
   */
  private calculateRisk(txCount: number): {
    score: number;
    reason: string;
    confidence: number;
  } {
    if (txCount > 10) {
      // AC2: HIGH risk - likely card testing attack
      return {
        score: 40,
        confidence: 90,
        reason: `High velocity: ${txCount} transactions in 1 hour (threshold: >10)`,
      };
    } else if (txCount >= 5) {
      // AC2: MEDIUM risk - elevated activity
      return {
        score: 20,
        confidence: 70,
        reason: `Medium velocity: ${txCount} transactions in 1 hour (threshold: 5-10)`,
      };
    } else {
      // AC2, AC5: LOW risk - normal activity or first transaction
      return {
        score: 0,
        confidence: 80,
        reason: `Low velocity: ${txCount} transactions in 1 hour (threshold: <5)`,
      };
    }
  }

  /**
   * Get current hour in format: YYYY-MM-DD-HH
   * 
   * AC3: Hour-based key for 1-hour velocity tracking
   * Uses UTC to avoid timezone issues
   */
  private getCurrentHour(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hour = String(now.getUTCHours()).padStart(2, "0");

    return `${year}-${month}-${day}-${hour}`;
  }
}
