/**
 * Feedback Anonymizer
 * 
 * Story 4.4: AC7 - Remove PII from feedback data for model improvement
 * 
 * GDPR compliant anonymization
 */

export interface DetectionContext {
  amount: number;
  customerEmail: string | null;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  riskScore: number;
}

export interface AnonymizedContext {
  amount: number;
  customerEmail: string; // Always "[REDACTED]"
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  riskScore: number;
}

/**
 * Anonymize feedback context by removing PII
 * 
 * AC7: Remove customerEmail (replace with [REDACTED])
 * Keep only: amount, decision, riskScore (no PII)
 */
export function anonymizeFeedbackContext(
  context: DetectionContext
): AnonymizedContext {
  return {
    amount: context.amount, // Keep (not PII)
    customerEmail: "[REDACTED]", // Remove PII
    decision: context.decision, // Keep
    riskScore: context.riskScore, // Keep
  };
}
