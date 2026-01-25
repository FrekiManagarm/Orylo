import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../block/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fraudDetections, customerTrustScores } from "@orylo/database";
import { eq, and } from "drizzle-orm";

/**
 * Integration Tests - POST /api/customers/[id]/block
 * 
 * Story 3.6 AC4: Integration tests for block customer action
 * - Updates trust score to blacklisted
 * - Enforces multi-tenancy
 * - Requires authentication
 */

// Mock auth
const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

// Mock PostHog
vi.mock("@/lib/posthog", () => ({
  trackCustomerBlocked: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("POST /api/customers/[id]/block - Integration", () => {
  let testOrgId: string;
  let customerId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    testOrgId = `org_test_${Date.now()}`;
    customerId = "cus_test_123";

    // Clean up test data
    await db.delete(fraudDetections);
    await db.delete(customerTrustScores);

    // Mock authenticated session
    mockGetSession.mockResolvedValue({
      user: {
        id: "user_test_123",
        email: "test@example.com",
        organizationId: testOrgId,
      },
    });

    // Seed test data: Create a detection for this customer
    await db.insert(fraudDetections).values({
      organizationId: testOrgId,
      paymentIntentId: "pi_test_123",
      decision: "REVIEW",
      score: 50,
      amount: 5000,
      currency: "usd",
      customerId,
      customerEmail: "test@example.com",
      detectorResults: [],
      executionTimeMs: 100,
    });

    // Create initial trust score
    await db.insert(customerTrustScores).values({
      organizationId: testOrgId,
      customerId,
      trustScore: 50,
      status: "normal",
      totalTransactions: 1,
      fraudulentTransactions: 0,
      totalAmountSpent: 5000,
    });
  });

  it("AC4: blocks customer and updates trust score", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/customers/${customerId}/block`,
      {
        method: "POST",
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: customerId }),
    } as { params: Promise<{ id: string }> });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify trust score updated
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
    expect(trustScore[0].status).toBe("blacklisted");
    expect(trustScore[0].trustScore).toBe(0);
  });

  it("AC4: enforces multi-tenancy (cannot block other org's customer)", async () => {
    const otherOrgId = `org_other_${Date.now()}`;
    const otherCustomerId = "cus_other_123";

    // Create detection for other org
    await db.insert(fraudDetections).values({
      organizationId: otherOrgId,
      paymentIntentId: "pi_other_123",
      decision: "ALLOW",
      score: 20,
      amount: 3000,
      currency: "usd",
      customerId: otherCustomerId,
      customerEmail: "other@example.com",
      detectorResults: [],
      executionTimeMs: 90,
    });

    // Try to block other org's customer
    const request = new NextRequest(
      `http://localhost:3000/api/customers/${otherCustomerId}/block`,
      {
        method: "POST",
      }
    );

    const response = await POST(request, {
      params: { id: otherCustomerId },
    } as { params: { id: string } });
    const json = await response.json();

    // Should return 403 or 404 (customer not found for this org)
    expect([403, 404]).toContain(response.status);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost:3000/api/customers/${customerId}/block`,
      {
        method: "POST",
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: customerId }),
    } as { params: Promise<{ id: string }> });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 when customer not found", async () => {
    const nonExistentCustomerId = "cus_not_found";

    const request = new NextRequest(
      `http://localhost:3000/api/customers/${nonExistentCustomerId}/block`,
      {
        method: "POST",
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: nonExistentCustomerId }),
    } as { params: Promise<{ id: string }> });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toContain("not found");
  });
});
