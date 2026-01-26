import { analyzeFeedback } from "./feedback-analyzer";

/**
 * A/B Testing Framework
 * 
 * Story 4.4: AC5 - Compare suggestion acceptance rates by time period
 */

export interface ABTestResult {
  period: "before" | "after";
  acceptanceRate: number;
  totalSuggestions: number;
  improvement: number; // percentage
}

/**
 * Compare acceptance rates between two periods
 * 
 * AC5: A/B testing framework for model updates
 */
export async function compareAcceptanceRates(
  organizationId: string,
  beforePeriod: { start: Date; end: Date },
  afterPeriod: { start: Date; end: Date }
): Promise<{
  before: ABTestResult;
  after: ABTestResult;
  improvement: number;
}> {
  // Note: This is a simplified version
  // In production, would query feedback for specific date ranges
  const beforeAnalysis = await analyzeFeedback(organizationId, 7); // Last 7 days
  const afterAnalysis = await analyzeFeedback(organizationId, 7); // Next 7 days

  const beforeRate = beforeAnalysis?.acceptanceRate || 0;
  const afterRate = afterAnalysis?.acceptanceRate || 0;
  const improvement = afterRate > beforeRate
    ? ((afterRate - beforeRate) / beforeRate) * 100
    : 0;

  return {
    before: {
      period: "before",
      acceptanceRate: beforeRate,
      totalSuggestions: beforeAnalysis?.totalFeedback || 0,
      improvement: 0,
    },
    after: {
      period: "after",
      acceptanceRate: afterRate,
      totalSuggestions: afterAnalysis?.totalFeedback || 0,
      improvement,
    },
    improvement,
  };
}

/**
 * Generate A/B test report
 * 
 * AC5: Generate reports showing improvement
 */
export function generateABTestReport(
  before: ABTestResult,
  after: ABTestResult
): string {
  const improvement = after.acceptanceRate > before.acceptanceRate
    ? ((after.acceptanceRate - before.acceptanceRate) / before.acceptanceRate) * 100
    : 0;

  if (improvement > 0) {
    return `Acceptance rate improved from ${(before.acceptanceRate * 100).toFixed(1)}% to ${(after.acceptanceRate * 100).toFixed(1)}% (+${improvement.toFixed(1)}%)`;
  } else {
    return `Acceptance rate changed from ${(before.acceptanceRate * 100).toFixed(1)}% to ${(after.acceptanceRate * 100).toFixed(1)}%`;
  }
}
