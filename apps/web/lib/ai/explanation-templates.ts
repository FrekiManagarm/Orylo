import type { DetectorResult } from "@orylo/fraud-engine";

/**
 * Fallback Template Explanations
 * 
 * Story 4.2: AC7 - Fallback to template-based explanation if LLM fails
 */

/**
 * Generate template-based explanation
 * 
 * AC7: Fallback to template if LLM fails or unavailable
 * Format: "Cette transaction a été signalée par: [detector names]. Score de risque: [score]"
 */
export function generateTemplateExplanation(
  detectorResults: DetectorResult[],
  riskScore: number,
  decision: "ALLOW" | "REVIEW" | "BLOCK"
): string {
  if (detectorResults.length === 0) {
    return `Cette transaction a été signalée avec un score de risque de ${riskScore}/100. Décision: ${decision}.`;
  }

  const detectorNames = detectorResults
    .map((d) => {
      // Format detector ID to readable name
      const name = d.detectorId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return name;
    })
    .join(", ");

  const scores = detectorResults.map((d) => d.score).join(", ");

  return `Cette transaction a été signalée par les détecteurs suivants: ${detectorNames}. Scores de risque: ${scores}. Score global: ${riskScore}/100. Décision: ${decision}.`;
}
