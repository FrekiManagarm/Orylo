import type { IDetector } from "../interfaces/detector.interface";
import type { IScoringStrategy } from "../interfaces/scoring-strategy.interface";
import type { DetectionContext, FraudDetectionResult } from "../types/detection";

/**
 * Fraud Detection Engine - Orchestrateur principal
 * 
 * Utilise l'injection de dépendances pour rester extensible
 */
export class FraudDetectionEngine {
  private detectors: IDetector[] = [];
  private scoringStrategy: IScoringStrategy;

  constructor(scoringStrategy: IScoringStrategy) {
    this.scoringStrategy = scoringStrategy;
  }

  /**
   * Enregistre un nouveau detector
   */
  registerDetector(detector: IDetector): void {
    this.detectors.push(detector);
    // Tri par priorité (highest first)
    this.detectors.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Supprime un detector
   */
  unregisterDetector(detectorId: string): void {
    this.detectors = this.detectors.filter((d) => d.id !== detectorId);
  }

  /**
   * Liste tous les detectors enregistrés
   */
  getDetectors(): IDetector[] {
    return [...this.detectors];
  }

  /**
   * Exécute la détection de fraude
   */
  async detect(context: DetectionContext): Promise<FraudDetectionResult> {
    const startTime = performance.now();

    // Exécute tous les detectors en parallèle
    const detectorPromises = this.detectors
      .filter((detector) => {
        // Validation optionnelle
        if (detector.validate) {
          return detector.validate(context);
        }
        return true;
      })
      .map((detector) => detector.detect(context));

    const detectorResults = await Promise.all(detectorPromises);

    // Calcule le score agrégé
    const score = this.scoringStrategy.calculateScore(detectorResults);

    // Décision finale
    const decision = this.scoringStrategy.makeDecision(score);

    const endTime = performance.now();

    return {
      decision,
      score,
      detectorResults,
      executionTimeMs: endTime - startTime,
      timestamp: new Date(),
    };
  }
}
