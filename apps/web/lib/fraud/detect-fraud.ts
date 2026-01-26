import {
  FraudDetectionEngine,
  type DetectionContext,
  type FraudDetectionResult,
  type DetectorResult,
  FraudDecision,
  AdditiveScoringStrategy,
} from "@orylo/fraud-engine";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { logger } from "@/lib/logger";
import { VelocityDetector, GeolocationDetector, TrustScoreDetector } from "./detectors";
import { generateAIExplanation } from "@/trigger/jobs/ai-explanation.job";

/**
 * Main Fraud Detection Orchestrator
 *
 * AC1: detectFraud(context) → Promise<DetectionResult>
 * AC2: Input: DetectionContext with payment + customer data
 * AC3: Output: DetectionResult with decision, risk_score, detector_results
 * AC4: Decision logic: ≥80 = BLOCK, 20-79 = REVIEW, <20 = ALLOW
 * AC5: Performance: P95 latency <350ms
 * AC6: Error handling: Graceful degradation if detectors fail
 * AC7: Database write: Store fraud_detections record
 * Story 1.7: Custom rules integration
 */

/**
 * Detect Fraud - Main Entry Point
 *
 * AC1: Main function that orchestrates fraud detection
 * Called by webhook handler in Story 1.2
 *
 * @param context - Payment and customer data for fraud analysis
 * @returns Fraud detection result with decision
 */
export async function detectFraud(
  context: DetectionContext,
): Promise<FraudDetectionResult> {
  // AC5: Performance monitoring - start timer
  const startTime = Date.now();

  console.info("[detection_start]", {
    paymentIntentId: context.paymentIntentId,
    organizationId: context.organizationId,
    amount: context.amount,
    currency: context.currency,
  });

  try {
    // Initialize fraud detection engine with detectors
    const engine = new FraudDetectionEngine(new AdditiveScoringStrategy());

    // Story 1.4: Register VelocityDetector
    const velocityDetector = new VelocityDetector();
    engine.registerDetector(velocityDetector);

    // Story 1.5: Register GeolocationDetector
    const geolocationDetector = new GeolocationDetector();
    await geolocationDetector.init(); // Load MaxMind database
    engine.registerDetector(geolocationDetector);

    // Story 1.6: Register TrustScoreDetector
    const trustScoreDetector = new TrustScoreDetector();
    engine.registerDetector(trustScoreDetector);

    // AC6: Execute detection with error handling
    // Story 3.4 AC3: Detectors run in parallel (verified via engine.detect)
    let result: FraudDetectionResult;

    try {
      // AC3: All detectors run in parallel via engine.detect()
      // Each detector target: <100ms
      const detectionStartTime = Date.now();
      result = await engine.detect(context);
      const detectionTime = Date.now() - detectionStartTime;

      logger.info("Detection engine completed", {
        paymentIntentId: context.paymentIntentId,
        score: result.score,
        decision: result.decision,
        detectorsExecuted: result.detectorResults.length,
        detectionTimeMs: detectionTime,
      });

      // Story 3.4 AC3: Alert if parallel execution exceeds target
      if (detectionTime > 350) {
        logger.warn("Slow detection - exceeds P95 target", {
          paymentIntentId: context.paymentIntentId,
          detectionTimeMs: detectionTime,
          targetMs: 350,
        });
      }
    } catch (error) {
      // AC6: Graceful degradation - if engine fails completely
      console.error("[detection_engine_error]", {
        paymentIntentId: context.paymentIntentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Return REVIEW decision for manual check
      result = {
        decision: FraudDecision.REVIEW,
        score: 50, // Medium risk - requires review
        detectorResults: [],
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date(),
      };
    }

    // Story 1.7: Apply Custom Rules (AC5, AC6)
    // Custom rules can override detector decision
    const { applyCustomRules } = await import("./custom-rules");

    // Extract detector-specific info for rule evaluation
    const velocityResult = result.detectorResults.find((r) =>
      String(r.detectorId).includes("velocity"),
    );
    const trustScoreResult = result.detectorResults.find((r) =>
      String(r.detectorId).includes("trust-score"),
    );
    const geoResult = result.detectorResults.find((r) =>
      String(r.detectorId).includes("geolocation"),
    );

    const customRuleResult = await applyCustomRules(
      context.organizationId,
      context,
      {
        riskScore: result.score,
        txCount: velocityResult?.metadata?.txCount ? Number(velocityResult.metadata.txCount) : 0,
        trustScore: trustScoreResult?.metadata?.trustScore ? Number(trustScoreResult.metadata.trustScore) : 50,
        ipCountry: geoResult?.metadata?.ipCountry ? String(geoResult.metadata.ipCountry) : null,
      },
      result.decision,
    );

    // Use custom rule decision if matched
    if (customRuleResult.matchedRule) {
      result.decision = customRuleResult.decision;
    }

    const latencyMs = Date.now() - startTime;

    // AC5: Log performance
    console.info("[detection_complete]", {
      paymentIntentId: context.paymentIntentId,
      decision: result.decision,
      score: result.score,
      latencyMs,
      customRuleMatched: customRuleResult.matchedRule?.name || null,
    });

    // AC5: Alert if latency exceeds target
    if (latencyMs > 350) {
      console.warn("[detection_latency_high]", {
        paymentIntentId: context.paymentIntentId,
        latencyMs,
        threshold: 350,
      });
    }

    // AC7: Persist to database
    await saveFraudDetection(context, result, customRuleResult.matchedRule);

    return result;
  } catch (error) {
    // Final catch-all error handler
    const latencyMs = Date.now() - startTime;

    console.error("[detection_critical_error]", {
      paymentIntentId: context.paymentIntentId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      latencyMs,
    });

    // Return REVIEW for manual check
    return {
      decision: FraudDecision.REVIEW,
      score: 50,
      detectorResults: [],
      executionTimeMs: latencyMs,
      timestamp: new Date(),
    };
  }
}

/**
 * Save Fraud Detection to Database
 *
 * AC7: Persist detection result with all fields
 * Handles DB errors gracefully (log but don't crash detection)
 */
async function saveFraudDetection(
  context: DetectionContext,
  result: FraudDetectionResult,
  customRule: { id: string; name: string; action: string } | null,
): Promise<string | null> {
  try {
    const [inserted] = await db
      .insert(fraudDetections)
      .values({
        organizationId: String(context.organizationId),
        paymentIntentId: String(context.paymentIntentId),
        customerId: context.customerId ? String(context.customerId) : null,
        customerEmail: context.customerEmail || null,
        amount: context.amount,
        currency: context.currency,
        decision: String(result.decision),
        score: result.score,
        detectorResults: result.detectorResults as unknown, // Cast for JSONB
        executionTimeMs: Math.round(result.executionTimeMs),
        createdAt: new Date(),
      })
      .returning({ id: fraudDetections.id });

    const detectionId = inserted?.id || null;

    console.info("[detection_db_save]", {
      paymentIntentId: context.paymentIntentId,
      detectionId,
    });

    // Story 4.2: AC1 - Trigger AI explanation job (non-blocking, fire-and-forget)
    if (detectionId) {
      try {
        // Extract card country and IP from detector results if available
        const geoResult = result.detectorResults.find((r) =>
          String(r.detectorId).includes("geolocation")
        );
        const cardCountry =
          (geoResult?.metadata as { cardCountry?: string } | undefined)?.cardCountry;
        const customerIp =
          (geoResult?.metadata as { customerIp?: string } | undefined)?.customerIp ||
          (context as { customerIp?: string }).customerIp;

        // AC1: Set priority: HIGH for BLOCK, NORMAL for REVIEW/ALLOW
        const priority =
          result.decision === FraudDecision.BLOCK ? ("HIGH" as const) : ("NORMAL" as const);

        // AC1: Trigger job (non-blocking, fire-and-forget)
        // Use void to ensure it doesn't block detection flow
        void generateAIExplanation.trigger({
          detectionId,
          organizationId: String(context.organizationId),
          context: {
            amount: context.amount,
            currency: context.currency,
            customerEmail: context.customerEmail || null,
            cardCountry,
            customerIp,
            riskScore: result.score,
            decision: String(result.decision) as "ALLOW" | "REVIEW" | "BLOCK",
          },
          detectorResults: result.detectorResults,
          priority,
        });

        console.info("[ai_explanation_triggered]", {
          detectionId,
          priority,
        });
      } catch (triggerError) {
        // Log but don't fail detection save
        console.error("[ai_explanation_trigger_error]", {
          detectionId,
          error:
            triggerError instanceof Error ? triggerError.message : "Unknown error",
        });
      }
    }

    return detectionId;
  } catch (error) {
    // AC7: Log but don't crash detection
    console.error("[detection_db_error]", {
      paymentIntentId: context.paymentIntentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

/**
 * Calculate Confidence Score
 *
 * AC3: Confidence (0-1) based on detector agreement and coverage
 * Higher confidence when:
 * - More detectors executed successfully
 * - Detectors agree on the risk level
 */
function calculateConfidence(detectorResults: DetectorResult[]): number {
  if (detectorResults.length === 0) {
    return 0; // No detectors ran
  }

  // Average confidence from all detectors
  const avgConfidence =
    detectorResults.reduce((sum, r) => sum + (r.confidence || 50), 0) /
    detectorResults.length;

  // Normalize to 0-1
  return avgConfidence / 100;
}
