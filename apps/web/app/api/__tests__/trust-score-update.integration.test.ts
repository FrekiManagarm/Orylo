import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { fraudDetections, customerTrustScores } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { updateTrustScore } from "@/lib/fraud/trust-score";

/**
 * Integration Tests - Trust Score Update Flow
 * 
 * Story 3.6 AC5: Integration tests for trust score updates
 * - Trust score updates after successful payment
 * - Trust score updates after chargeback
 * - Trust score updates after blocked transaction
 */

// Mock Redis
vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Trust Score Update Flow - Integration", () => {
  let testOrgId: string;
  let customerId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    testOrgId = `org_test_${Date.now()}`;
    customerId = "cus_test_123";

    // Clean up test data
    await db.delete(fraudDetections);
    await db.delete(customerTrustScores);
  });

  it("AC5: updates trust score after successful payment", async () => {
    // Create initial trust score
    await db.insert(customerTrustScores).values({
      organizationId: testOrgId,
      customerId,
      trustScore: 50,
      status: "normal",
      totalTransactions: 0,
      fraudulentTransactions: 0,
      totalAmountSpent: 0,
    });

    // Simulate successful payment
    await updateTrustScore(testOrgId, customerId, "successful_payment");

    // Verify trust score increased
    const trustScore = await db
      .select()
      .from(customerTrustScores)
      .where(
        and(
          eq(customerTrustScores.customerId, customerId),
          eq(customerTrustScores.organizationId, testOrgId)
        )
      )
      .limit(1);

    expect(trustScore.length).toBe(1);
    expect(trustScore[0].trustScore).toBe(55); // 50 + 5
    expect(trustScore[0].totalTransactions).toBe(1);
  });

  it("AC5: updates trust score after chargeback", async () => {
    // Create initial trust score
    await db.insert(customerTrustScores).values({
      organizationId: testOrgId,
      customerId,
      trustScore: 50,
      status: "normal",
      totalTransactions: 5,
      fraudulentTransactions: 0,
      totalAmountSpent: 25000,
    });

    // Simulate chargeback
    await updateTrustScore(testOrgId, customerId, "chargeback");

    // Verify trust score decreased
    const trustScore = await db
      .select()
      .from(customerTrustScores)
      .where(
        and(
          eq(customerTrustScores.customerId, customerId),
          eq(customerTrustScores.organizationId, testOrgId)
        )
      )
      .limit(1);

    expect(trustScore.length).toBe(1);
    expect(trustScore[0].trustScore).toBe(0); // 50 - 50, clamped to 0
    expect(trustScore[0].fraudulentTransactions).toBe(1);
  });

  it("AC5: creates new trust score for new customer", async () => {
    // No existing trust score

    // Simulate successful payment
    await updateTrustScore(testOrgId, customerId, "successful_payment");

    // Verify trust score created with default 50
    const trustScore = await db
      .select()
      .from(customerTrustScores)
      .where(
        and(
          eq(customerTrustScores.customerId, customerId),
          eq(customerTrustScores.organizationId, testOrgId)
        )
      )
      .limit(1);

    expect(trustScore.length).toBe(1);
    expect(trustScore[0].trustScore).toBe(55); // 50 (default) + 5
  });

  it("AC5: updates trust score after blocked transaction", async () => {
    // Create initial trust score
    await db.insert(customerTrustScores).values({
      organizationId: testOrgId,
      customerId,
      trustScore: 50,
      status: "normal",
      totalTransactions: 3,
      fraudulentTransactions: 0,
      totalAmountSpent: 15000,
    });

    // Simulate blocked transaction
    await updateTrustScore(testOrgId, customerId, "blocked_transaction");

    // Verify trust score decreased
    const trustScore = await db
      .select()
      .from(customerTrustScores)
      .where(
        and(
          eq(customerTrustScores.customerId, customerId),
          eq(customerTrustScores.organizationId, testOrgId)
        )
      )
      .limit(1);

    expect(trustScore.length).toBe(1);
    expect(trustScore[0].trustScore).toBe(40); // 50 - 10
  });
});
