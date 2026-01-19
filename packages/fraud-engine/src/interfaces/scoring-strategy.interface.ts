import type { DetectorResult } from "../types/detection";
import type { FraudDecision } from "../types/detection";

/**
 * Interface pour les stratégies de scoring
 *
 * Permet de changer la logique de scoring sans toucher aux detectors
 */
export interface IScoringStrategy {
  /**
   * Calcule le score agrégé à partir des résultats des detectors
   */
  calculateScore(detectorResults: DetectorResult[]): number;

  /**
   * Détermine la décision finale (ALLOW/REVIEW/BLOCK) basée sur le score
   */
  makeDecision(score: number): FraudDecision;
}
