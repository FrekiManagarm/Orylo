import type { DetectorResult } from "@orylo/fraud-engine";

/**
 * Explanation Prompt Builder
 * 
 * Story 4.2: AC2, AC5 - Build LLM prompt for fraud explanation in French
 */

export interface TransactionContext {
  organizationId: string;
  detectionId: string;
  amount: number;
  currency: string;
  customerEmail: string | null;
  cardCountry?: string;
  customerIp?: string;
  riskScore: number;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
}

export interface FraudFactor {
  detectorId: string;
  score: number;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  reason?: string;
}

/**
 * Format detector results for prompt
 */
function formatDetectorResults(detectorResults: DetectorResult[]): string {
  return detectorResults
    .map((d) => {
      const reason =
        d.reason ||
        (d.metadata as { reason?: string } | undefined)?.reason ||
        "Détecteur déclenché";
      return `- ${d.detectorId}: Score ${d.score}/100, Décision: ${d.decision} (${reason})`;
    })
    .join("\n");
}

/**
 * Build explanation prompt in French
 * 
 * AC5: Language: French (LLM prompt in French)
 */
export function buildExplanationPrompt(
  context: TransactionContext,
  detectorResults: DetectorResult[]
): string {
  const detectorResultsFormatted = formatDetectorResults(detectorResults);

  return `Tu es un expert en détection de fraude. Analyse cette détection et explique en français (2-3 phrases) pourquoi cette transaction a été signalée.

Transaction:
- Montant: ${context.amount / 100} ${context.currency.toUpperCase()}
- Client: ${context.customerEmail || "N/A"}
${context.cardCountry ? `- Pays carte: ${context.cardCountry}` : ""}
${context.customerIp ? `- IP: ${context.customerIp}` : ""}

Détecteurs déclenchés:
${detectorResultsFormatted}

Score de risque: ${context.riskScore}/100
Décision: ${context.decision}

Explique en français pourquoi cette transaction est suspecte, en mentionnant les facteurs de risque principaux. Sois concis (2-3 phrases maximum).`;
}

/**
 * System message for LLM
 * 
 * AC5: System message in French
 */
export const EXPLANATION_SYSTEM_MESSAGE = `Tu es un expert en détection de fraude. Ton rôle est d'expliquer de manière claire et concise pourquoi une transaction a été signalée comme suspecte. 

Instructions:
- Explique en français (2-3 phrases maximum)
- Mentionne les facteurs de risque principaux
- Sois précis et factuel
- Utilise un langage compréhensible pour un marchand non-technique`;
