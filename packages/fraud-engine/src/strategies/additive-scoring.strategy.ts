import type { IScoringStrategy } from "../interfaces/scoring-strategy.interface";
import type { DetectorResult } from "../types/detection";
import { FraudDecision } from "../types/detection";

/**
 * Stratégie de scoring additive simple
 *
 * Score = somme pondérée des scores des detectors
 */
export class AdditiveScoringStrategy implements IScoringStrategy {
  private readonly allowThreshold: number;
  private readonly blockThreshold: number;

  constructor(allowThreshold = 30, blockThreshold = 70) {
    this.allowThreshold = allowThreshold;
    this.blockThreshold = blockThreshold;
  }

  calculateScore(detectorResults: DetectorResult[]): number {
    if (detectorResults.length === 0) {
      return 0;
    }

    // Moyenne pondérée par la confidence
    let totalScore = 0;
    let totalConfidence = 0;

    for (const result of detectorResults) {
      totalScore += result.score * result.confidence;
      totalConfidence += result.confidence;
    }

    const finalScore = totalConfidence > 0 ? totalScore / totalConfidence : 0;

    // Clamp entre 0-100
    return Math.max(0, Math.min(100, finalScore));
  }

  makeDecision(score: number): FraudDecision {
    if (score < this.allowThreshold) {
      return FraudDecision.ALLOW;
    }
    if (score >= this.blockThreshold) {
      return FraudDecision.BLOCK;
    }
    return FraudDecision.REVIEW;
  }
}
