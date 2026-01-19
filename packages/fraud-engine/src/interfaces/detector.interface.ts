import type { DetectionContext, DetectorResult } from "../types/detection";

/**
 * Interface que TOUS les detectors doivent implémenter
 *
 * Permet l'injection de dépendances et l'extensibilité du système
 */
export interface IDetector {
  /**
   * Identifiant unique du detector
   */
  readonly id: string;

  /**
   * Nom human-readable
   */
  readonly name: string;

  /**
   * Description de ce que le detector fait
   */
  readonly description: string;

  /**
   * Priorité d'exécution (1 = highest, utilisé pour early exit)
   */
  readonly priority: number;

  /**
   * Méthode principale : analyse le context et retourne un résultat
   */
  detect(context: DetectionContext): Promise<DetectorResult>;

  /**
   * Validation optionnelle avant exécution
   */
  validate?(context: DetectionContext): boolean;
}
