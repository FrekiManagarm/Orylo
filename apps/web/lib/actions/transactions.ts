"use server";

import { db } from "@/lib/db";
import {
  type InferSelectModel,
  fraudDetections,
} from "@orylo/database";
import { eq, desc, and, gte, lte, sql, or } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export type FraudAnalysisFilters = {
  riskScoreRange?: "low" | "medium" | "high";
  compositeRiskLevel?: "minimal" | "low" | "moderate" | "elevated" | "high" | "critical";
  actions?: string[];
  dateRange?: "24h" | "7d" | "30d" | "all";
};

export type FraudDetectionRow = InferSelectModel<typeof fraudDetections>;

export async function getFraudAnalyses(options?: {
  limit?: number;
  offset?: number;
  filters?: FraudAnalysisFilters;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!session?.user?.id || !org?.id) {
      throw new Error("Unauthorized");
    }

    // Build conditions array
    const conditions = [eq(fraudDetections.organizationId, org.id)];

    // Apply filters
    if (options?.filters) {
      const { riskScoreRange, compositeRiskLevel, actions, dateRange } = options.filters;

      // Risk Score filter (legacy)
      if (riskScoreRange) {
        if (riskScoreRange === "low") {
          conditions.push(lte(fraudDetections.score, 30));
        } else if (riskScoreRange === "medium") {
          conditions.push(
            and(
              gte(fraudDetections.score, 30),
              lte(fraudDetections.score, 70)
            )!
          );
        } else if (riskScoreRange === "high") {
          conditions.push(gte(fraudDetections.score, 70));
        }
      }

      // compositeRiskLevel non appliqué (pas de colonne dédiée en BDD)

      // Actions filter (decision: ALLOW, REVIEW, BLOCK)
      if (actions && actions.length > 0) {
        const actionConditions = actions.map((action) =>
          eq(fraudDetections.decision, action)
        );
        conditions.push(or(...actionConditions)!);
      }

      // Date range filter
      if (dateRange && dateRange !== "all") {
        const now = new Date();
        let startDate: Date;

        if (dateRange === "24h") {
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (dateRange === "7d") {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
          // 30d
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        conditions.push(gte(fraudDetections.createdAt, startDate));
      }
    }

    let query = db
      .select()
      .from(fraudDetections)
      .where(and(...conditions))
      .orderBy(desc(fraudDetections.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as typeof query;
    }

    if (options?.offset) {
      query = query.offset(options.offset) as typeof query;
    }

    const analyses: FraudDetectionRow[] = await query;
    return analyses;
  } catch (error) {
    console.error("Error fetching fraud analyses:", error);
    throw error;
  }
}

export async function getTotalFraudAnalysesCount(filters?: FraudAnalysisFilters) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!session?.user?.id || !org?.id) {
      throw new Error("Unauthorized");
    }

    // Build conditions array
    const conditions = [eq(fraudDetections.organizationId, org.id)];

    // Apply same filters as getFraudAnalyses
    if (filters) {
      const { riskScoreRange, actions, dateRange } = filters;

      if (riskScoreRange) {
        if (riskScoreRange === "low") {
          conditions.push(lte(fraudDetections.score, 30));
        } else if (riskScoreRange === "medium") {
          conditions.push(
            and(
              gte(fraudDetections.score, 30),
              lte(fraudDetections.score, 70)
            )!
          );
        } else if (riskScoreRange === "high") {
          conditions.push(gte(fraudDetections.score, 70));
        }
      }

      if (actions && actions.length > 0) {
        const actionConditions = actions.map((action) =>
          eq(fraudDetections.decision, action)
        );
        conditions.push(or(...actionConditions)!);
      }

      if (dateRange && dateRange !== "all") {
        const now = new Date();
        let startDate: Date;

        if (dateRange === "24h") {
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (dateRange === "7d") {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        conditions.push(gte(fraudDetections.createdAt, startDate));
      }
    }

    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fraudDetections)
      .where(and(...conditions));

    return result[0]?.count || 0;
  } catch (error) {
    console.error("Error fetching fraud analyses count:", error);
    throw error;
  }
}

export async function getFraudAnalysisById(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!session?.user?.id || !org?.id) {
      throw new Error("Unauthorized");
    }

    const rows = await db
      .select()
      .from(fraudDetections)
      .where(eq(fraudDetections.id, id))
      .limit(1);

    if (!rows[0] || rows[0].organizationId !== org.id) {
      throw new Error("Fraud analysis not found");
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching fraud analysis:", error);
    throw error;
  }
}

/** Single item in card testing trackers array (one attempt) */
export type CardTestingTrackerItem = {
  cardTesting: {
    result: string;
    fingerprint: string;
    ipAddress?: string | null;
    createdAt: string;
  };
};

export type CardTestingData = {
  trackers: CardTestingTrackerItem[];
  totalSuspicionScore: number;
  totalAttempts: number;
  hasCardTesting: boolean;
};

/** Fraud detection row with optional card testing and UI/computed fields */
export type FraudDetectionWithCardTesting = FraudDetectionRow & {
  cardTestingTracker?: CardTestingData | null;
  /** Alias / override for score (UI) */
  riskScore?: number;
  compositeScore?: number | null;
  compositeRiskLevel?: string | null;
  cardTestingSuspicionScore?: number | null;
  confidence?: string;
  aiExplanation?: string | null;
  detectionContext?: Record<string, unknown> | null;
  signals?: Record<string, unknown>;
  agentsUsed?: string[];
  blocked?: boolean;
  actualOutcome?: string | null;
  factors?: Array<{
    type: string;
    weight: number;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
};

export async function getCardTestingDataByPaymentIntent(
  paymentIntentId: string
): Promise<CardTestingData> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!session?.user?.id || !org?.id) {
      throw new Error("Unauthorized");
    }

    // Card testing : table non présente dans @orylo/database pour l'instant
    // Retourne une structure vide pour compatibilité API
    return {
      trackers: [],
      totalSuspicionScore: 0,
      totalAttempts: 0,
      hasCardTesting: false,
    };
  } catch (error) {
    console.error("Error fetching card testing data:", error);
    return {
      trackers: [],
      totalSuspicionScore: 0,
      totalAttempts: 0,
      hasCardTesting: false,
    };
  }
}

export async function getCardTestingStats(): Promise<{
  last24hBlocked: number;
  totalSuspicious: number;
  totalBlocked: number;
}> {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });
    if (!org?.id) {
      return { last24hBlocked: 0, totalSuspicious: 0, totalBlocked: 0 };
    }
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [blocked24h, blockedAll, reviewAll] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(fraudDetections)
        .where(
          and(
            eq(fraudDetections.organizationId, org.id),
            eq(fraudDetections.decision, "BLOCK"),
            gte(fraudDetections.createdAt, since24h)
          )
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(fraudDetections)
        .where(
          and(
            eq(fraudDetections.organizationId, org.id),
            eq(fraudDetections.decision, "BLOCK")
          )
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(fraudDetections)
        .where(
          and(
            eq(fraudDetections.organizationId, org.id),
            eq(fraudDetections.decision, "REVIEW")
          )
        ),
    ]);
    return {
      last24hBlocked: blocked24h[0]?.count ?? 0,
      totalSuspicious: reviewAll[0]?.count ?? 0,
      totalBlocked: blockedAll[0]?.count ?? 0,
    };
  } catch {
    return { last24hBlocked: 0, totalSuspicious: 0, totalBlocked: 0 };
  }
}

export async function getDashboardStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!session?.user?.id || !org?.id) {
      throw new Error("Unauthorized");
    }

    // Get current month date range
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // Get previous month date range
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Get current month stats
    const currentMonthStats = await db
      .select({
        totalTransactions: sql<number>`count(*)::int`,
        totalBlocked: sql<number>`count(case when ${fraudDetections.decision} =  'BLOCK' then 1 end)::int`,
        totalAmount: sql<number>`sum(case when ${fraudDetections.decision} = 'BLOCK' then ${fraudDetections.amount} else 0 end)::int`,
        avgRiskScore: sql<number>`avg(${fraudDetections.score})::int`,
      })
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.organizationId, org.id),
          gte(fraudDetections.createdAt, startOfCurrentMonth),
          lte(fraudDetections.createdAt, endOfCurrentMonth),
        ),
      );

    // Get previous month stats
    const lastMonthStats = await db
      .select({
        totalTransactions: sql<number>`count(*)::int`,
        totalBlocked: sql<number>`count(case when ${fraudDetections.decision} = 'BLOCK' then 1 end)::int`,
        totalAmount: sql<number>`sum(case when ${fraudDetections.decision} = 'BLOCK' then ${fraudDetections.amount} else 0 end)::int`,
        avgRiskScore: sql<number>`avg(${fraudDetections.score})::int`,
      })
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.organizationId, org.id),
          gte(fraudDetections.createdAt, startOfLastMonth),
          lte(fraudDetections.createdAt, endOfLastMonth),
        ),
      );

    const current = currentMonthStats[0] || {
      totalTransactions: 0,
      totalBlocked: 0,
      totalAmount: 0,
      avgRiskScore: 0,
    };

    const previous = lastMonthStats[0] || {
      totalTransactions: 0,
      totalBlocked: 0,
      totalAmount: 0,
      avgRiskScore: 0,
    };

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      transactionsAnalyzed: {
        value: current.totalTransactions,
        change: calculateChange(
          current.totalTransactions,
          previous.totalTransactions,
        ),
      },
      fraudsBlocked: {
        value: current.totalBlocked,
        change: calculateChange(current.totalBlocked, previous.totalBlocked),
      },
      moneySaved: {
        value: current.totalAmount, // Amount in cents
        change: calculateChange(current.totalAmount, previous.totalAmount),
      },
      avgRiskScore: {
        value: current.avgRiskScore,
        change: calculateChange(current.avgRiskScore, previous.avgRiskScore),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}