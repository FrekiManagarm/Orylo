import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { fraudDetections, customerTrustScores } from "@orylo/database";
import { eq } from "drizzle-orm";
import { generateSuggestion } from "../suggestion-engine";
import { subDays, subHours } from "date-fns";

// Mock redis
vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
  },
}));

/**
 * Integration tests for Suggestion Engine
 * 
 * Story 4.1: AC8 - Test suggestion generation with mock historical data
 */

describe("Suggestion Engine Integration Tests", () => {
  const testOrganizationId = "test-org-001";
  const testCustomerId = "cus_test_001";
  const testCustomerEmail = "test.customer@example.com";

  beforeEach(async () => {
    // Clean up test data
    await db
      .delete(fraudDetections)
      .where(eq(fraudDetections.organizationId, testOrganizationId));
    await db
      .delete(customerTrustScores)
      .where(eq(customerTrustScores.organizationId, testOrganizationId));
  });

  afterEach(async () => {
    // Clean up
    await db
      .delete(fraudDetections)
      .where(eq(fraudDetections.organizationId, testOrganizationId));
    await db
      .delete(customerTrustScores)
      .where(eq(customerTrustScores.organizationId, testOrganizationId));
  });

  describe("Whitelist suggestion logic", () => {
    it("should generate whitelist suggestion for customer with high trust score and ≥3 successful transactions", async () => {
      // Setup: Create customer with high trust score
      await db.insert(customerTrustScores).values({
        organizationId: testOrganizationId,
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        trustScore: 85, // >80
        status: "normal",
        totalChargebacks: 0,
      });

      // Setup: Create ≥3 successful transactions in last 90 days
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        await db.insert(fraudDetections).values({
          organizationId: testOrganizationId,
          customerId: testCustomerId,
          customerEmail: testCustomerEmail,
          paymentIntentId: `pi_test_${i}`,
          amount: 5000,
          currency: "eur",
          decision: "ALLOW",
          score: 20,
          detectorResults: [],
          executionTimeMs: 100,
          createdAt: subDays(now, i * 10), // Spread over last 90 days
        });
      }

      const suggestion = await generateSuggestion({
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        organizationId: testOrganizationId,
        detectionId: "det_test_001",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("whitelist");
      expect(suggestion?.confidence).toBeGreaterThan(0.5);
      expect(suggestion?.factors).toContain("Score de confiance élevé");
    });
  });

  describe("Blacklist suggestion logic", () => {
    it("should generate blacklist suggestion for customer with low trust score", async () => {
      // Setup: Create customer with low trust score
      await db.insert(customerTrustScores).values({
        organizationId: testOrganizationId,
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        trustScore: 20, // <30
        status: "normal",
        totalChargebacks: 0,
      });

      const suggestion = await generateSuggestion({
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        organizationId: testOrganizationId,
        detectionId: "det_test_001",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
      expect(suggestion?.factors.some((f) => f.includes("Score de confiance faible"))).toBe(
        true
      );
    });

    it("should generate blacklist suggestion for customer with ≥2 chargebacks", async () => {
      // Setup: Create customer with chargebacks
      await db.insert(customerTrustScores).values({
        organizationId: testOrganizationId,
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        trustScore: 50,
        status: "normal",
        totalChargebacks: 2, // ≥2
      });

      const suggestion = await generateSuggestion({
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        organizationId: testOrganizationId,
        detectionId: "det_test_001",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
      expect(suggestion?.factors.some((f) => f.includes("chargebacks"))).toBe(true);
    });

    it("should generate blacklist suggestion for card testing pattern (≥5 failed attempts in 1h)", async () => {
      // Setup: Create customer
      await db.insert(customerTrustScores).values({
        organizationId: testOrganizationId,
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        trustScore: 50,
        status: "normal",
        totalChargebacks: 0,
      });

      // Setup: Create ≥5 blocked transactions in last 1 hour
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        await db.insert(fraudDetections).values({
          organizationId: testOrganizationId,
          customerId: testCustomerId,
          customerEmail: testCustomerEmail,
          paymentIntentId: `pi_test_${i}`,
          amount: 100,
          currency: "eur",
          decision: "BLOCK",
          score: 90,
          detectorResults: [],
          executionTimeMs: 100,
          createdAt: subHours(now, i * 0.1), // Within 1 hour
        });
      }

      const suggestion = await generateSuggestion({
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        organizationId: testOrganizationId,
        detectionId: "det_test_001",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
      expect(suggestion?.factors.some((f) => f.includes("test de carte"))).toBe(true);
    });
  });

  describe("Priority rule (AC9)", () => {
    it("should return blacklist suggestion if both criteria met", async () => {
      // Setup: Customer with high trust (whitelist candidate) but also chargebacks (blacklist candidate)
      await db.insert(customerTrustScores).values({
        organizationId: testOrganizationId,
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        trustScore: 85, // High (whitelist)
        status: "normal",
        totalChargebacks: 2, // ≥2 (blacklist)
      });

      // Setup: Successful transactions
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        await db.insert(fraudDetections).values({
          organizationId: testOrganizationId,
          customerId: testCustomerId,
          customerEmail: testCustomerEmail,
          paymentIntentId: `pi_test_${i}`,
          amount: 5000,
          currency: "eur",
          decision: "ALLOW",
          score: 20,
          detectorResults: [],
          executionTimeMs: 100,
          createdAt: subDays(now, i * 10),
        });
      }

      const suggestion = await generateSuggestion({
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        organizationId: testOrganizationId,
        detectionId: "det_test_001",
      });

      // AC9: Blacklist takes priority
      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
    });
  });

  describe("Edge cases", () => {
    it("should return null for already whitelisted customer", async () => {
      await db.insert(customerTrustScores).values({
        organizationId: testOrganizationId,
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        trustScore: 90,
        status: "whitelisted", // Already whitelisted
        totalChargebacks: 0,
      });

      const suggestion = await generateSuggestion({
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        organizationId: testOrganizationId,
        detectionId: "det_test_001",
      });

      expect(suggestion).toBeNull();
    });

    it("should return null for already blacklisted customer", async () => {
      await db.insert(customerTrustScores).values({
        organizationId: testOrganizationId,
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        trustScore: 0,
        status: "blacklisted", // Already blacklisted
        totalChargebacks: 2,
      });

      const suggestion = await generateSuggestion({
        customerId: testCustomerId,
        customerEmail: testCustomerEmail,
        organizationId: testOrganizationId,
        detectionId: "det_test_001",
      });

      expect(suggestion).toBeNull();
    });
  });
});
