import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { customRules } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import type { DetectionContext, FraudDecision } from "@orylo/fraud-engine";

/**
 * Custom Rules Engine
 *
 * AC1: Table custom_rules with conditions JSON and action
 * AC2: Condition syntax with field, operator, value
 * AC3: Operators: >, <, =, !=, IN
 * AC4: Logical operators: AND, OR
 * AC5: Execute after detectors
 * AC6: Override detector decision if matched
 * AC8: Performance <10ms (max 10 rules)
 */

/**
 * Condition Types (AC2, AC3, AC4)
 */
export type SimpleCondition = {
  field: string;
  operator: ">" | "<" | "=" | "!=" | "IN";
  value: number | string | string[];
};

export type LogicalCondition = {
  operator: "AND" | "OR";
  conditions: Condition[];
};

export type Condition = SimpleCondition | LogicalCondition;

/**
 * Custom Rule
 */
export interface CustomRule {
  id: string;
  name: string;
  condition: Condition;
  action: "BLOCK" | "REVIEW" | "ALLOW";
  priority: number;
}

/**
 * Get Field Value from Context
 *
 * Maps field names to context values
 */
function getFieldValue(
  context: DetectionContext,
  detectorResults: any,
  field: string,
): any {
  switch (field) {
    case "amount":
      return context.amount; // in cents
    case "currency":
      return context.currency;
    case "card_country":
      return context.cardCountry;
    case "ip_country":
      return detectorResults?.ipCountry || null;
    case "customer_email":
      return context.customerEmail;
    case "velocity":
      return detectorResults?.txCount || 0;
    case "trust_score":
      return detectorResults?.trustScore || 50;
    case "risk_score":
      return detectorResults?.riskScore || 0;
    default:
      return null;
  }
}

/**
 * Evaluate Condition
 *
 * AC2, AC3, AC4: Recursively evaluate conditions with operators
 *
 * @param condition - The condition to evaluate
 * @param context - Fraud detection context
 * @param detectorResults - Results from detectors
 * @returns True if condition matches
 */
function evaluateCondition(
  condition: Condition,
  context: DetectionContext,
  detectorResults: any,
): boolean {
  // AC4: Logical operators (AND, OR)
  if ("operator" in condition && (condition.operator === "AND" || condition.operator === "OR")) {
    const logicalCondition = condition as LogicalCondition;

    if (condition.operator === "AND") {
      return logicalCondition.conditions.every((c) =>
        evaluateCondition(c, context, detectorResults),
      );
    }

    if (condition.operator === "OR") {
      return logicalCondition.conditions.some((c) =>
        evaluateCondition(c, context, detectorResults),
      );
    }
  }

  // AC3: Simple operators (>, <, =, !=, IN)
  const simpleCondition = condition as SimpleCondition;
  const fieldValue = getFieldValue(
    context,
    detectorResults,
    simpleCondition.field,
  );
  const targetValue = simpleCondition.value;

  // Handle null field values
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  switch (simpleCondition.operator) {
    case ">":
      return fieldValue > targetValue;
    case "<":
      return fieldValue < targetValue;
    case "=":
      return fieldValue === targetValue;
    case "!=":
      return fieldValue !== targetValue;
    case "IN":
      return (targetValue as string[]).includes(String(fieldValue));
    default:
      return false;
  }
}

/**
 * Fetch Enabled Rules for Organization
 *
 * AC5, AC8: Fetch and cache rules (max 10 per org)
 *
 * @param organizationId - Organization ID
 * @returns Array of custom rules
 */
async function fetchEnabledRules(
  organizationId: string,
): Promise<CustomRule[]> {
  try {
    // AC8: Try cache first (5 min TTL)
    const cacheKey = `custom_rules:${organizationId}`;
    const cached = await redis.get<CustomRule[]>(cacheKey);

    if (cached && Array.isArray(cached)) {
      console.info("[custom_rules_cache_hit]", {
        organizationId,
        count: cached.length,
      });
      return cached;
    }

    // Cache miss → Query DB
    console.info("[custom_rules_cache_miss]", { organizationId });

    const rules = await db
      .select()
      .from(customRules)
      .where(
        and(
          eq(customRules.organizationId, organizationId),
          eq(customRules.isActive, true),
        ),
      )
      .orderBy(customRules.priority); // Highest priority first

    // AC8: Enforce max 10 rules
    const limitedRules = rules.slice(0, 10).map((rule) => ({
      id: rule.id,
      name: rule.name,
      condition: rule.condition as Condition,
      action: rule.action as "BLOCK" | "REVIEW" | "ALLOW",
      priority: rule.priority,
    }));

    // Cache for 5 minutes
    await redis.set(cacheKey, limitedRules, { ex: 300 });

    console.info("[custom_rules_fetched]", {
      organizationId,
      count: limitedRules.length,
    });

    return limitedRules;
  } catch (error) {
    console.error("[custom_rules_fetch_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return []; // Return empty array on error
  }
}

/**
 * Apply Custom Rules
 *
 * AC5, AC6: Execute rules and override detector decision if matched
 *
 * @param organizationId - Organization ID
 * @param context - Fraud detection context
 * @param detectorResults - Results from detectors
 * @param detectorDecision - Decision from detectors
 * @returns Final decision (potentially overridden by rules)
 */
export async function applyCustomRules(
  organizationId: string,
  context: DetectionContext,
  detectorResults: any,
  detectorDecision: FraudDecision,
): Promise<{
  decision: FraudDecision;
  matchedRule: { id: string; name: string; action: string } | null;
}> {
  const startTime = Date.now();

  try {
    // AC5: Fetch enabled rules
    const rules = await fetchEnabledRules(organizationId);

    if (rules.length === 0) {
      console.info("[custom_rules_none]", { organizationId });
      return { decision: detectorDecision, matchedRule: null };
    }

    // AC5: Evaluate each rule (stop on first match)
    for (const rule of rules) {
      try {
        const matches = evaluateCondition(
          rule.condition,
          context,
          detectorResults,
        );

        if (matches) {
          // AC6: Override detector decision
          const latency = Date.now() - startTime;

          console.info("[custom_rule_matched]", {
            organizationId,
            paymentIntentId: context.paymentIntentId,
            ruleName: rule.name,
            action: rule.action,
            originalDecision: detectorDecision,
            latencyMs: latency,
          });

          return {
            decision: rule.action as FraudDecision,
            matchedRule: {
              id: rule.id,
              name: rule.name,
              action: rule.action,
            },
          };
        }
      } catch (error) {
        // Log evaluation error but continue with other rules
        console.error("[custom_rule_evaluation_error]", {
          organizationId,
          ruleName: rule.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // No rules matched
    const latency = Date.now() - startTime;
    console.info("[custom_rules_no_match]", {
      organizationId,
      rulesEvaluated: rules.length,
      latencyMs: latency,
    });

    // AC8: Log if slow (>10ms)
    if (latency > 10) {
      console.warn("[custom_rules_slow]", {
        organizationId,
        latencyMs: latency,
        threshold: 10,
      });
    }

    return { decision: detectorDecision, matchedRule: null };
  } catch (error) {
    // Graceful degradation on error
    console.error("[custom_rules_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Return original detector decision on error
    return { decision: detectorDecision, matchedRule: null };
  }
}

/**
 * Invalidate Rules Cache
 *
 * Call after creating/updating/deleting a rule
 *
 * @param organizationId - Organization ID
 */
export async function invalidateRulesCache(
  organizationId: string,
): Promise<void> {
  try {
    const cacheKey = `custom_rules:${organizationId}`;
    await redis.del(cacheKey);
    console.info("[custom_rules_cache_invalidated]", { organizationId });
  } catch (error) {
    console.error("[custom_rules_cache_invalidation_error]", {
      organizationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
