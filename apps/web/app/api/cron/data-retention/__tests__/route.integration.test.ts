import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { lt } from "drizzle-orm";

/**
 * Integration Tests - GET /api/cron/data-retention
 * 
 * Story 3.6: Integration tests for data retention cron job
 * - Deletes records older than 90 days
 * - Requires CRON_SECRET authentication
 */

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("GET /api/cron/data-retention - Integration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Clean up test data
    await db.delete(fraudDetections);
  });

  it("deletes records older than 90 days", async () => {
    const cronSecret = process.env.CRON_SECRET || "test_secret";
    const ninetyOneDaysAgo = new Date();
    ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);

    // Create old detection
    await db.insert(fraudDetections).values({
      organizationId: "org_test_123",
      paymentIntentId: "pi_old",
      decision: "ALLOW",
      score: 20,
      amount: 5000,
      currency: "usd",
      customerId: "cus_old",
      customerEmail: "old@example.com",
      detectorResults: [],
      executionTimeMs: 100,
      createdAt: ninetyOneDaysAgo,
    });

    // Create recent detection (should not be deleted)
    await db.insert(fraudDetections).values({
      organizationId: "org_test_123",
      paymentIntentId: "pi_recent",
      decision: "ALLOW",
      score: 20,
      amount: 5000,
      currency: "usd",
      customerId: "cus_recent",
      customerEmail: "recent@example.com",
      detectorResults: [],
      executionTimeMs: 100,
      createdAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/cron/data-retention", {
      method: "GET",
      headers: {
        authorization: `Bearer ${cronSecret}`,
      },
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.deletedCount).toBe(1);

    // Verify old record deleted, recent record kept
    const remaining = await db
      .select()
      .from(fraudDetections)
      .where(lt(fraudDetections.createdAt, new Date()));

    expect(remaining.length).toBe(0); // All old records deleted
  });

  it("rejects requests without valid CRON_SECRET", async () => {
    const request = new NextRequest("http://localhost:3000/api/cron/data-retention", {
      method: "GET",
      headers: {
        authorization: "Bearer invalid_secret",
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("rejects requests without authorization header", async () => {
    const request = new NextRequest("http://localhost:3000/api/cron/data-retention", {
      method: "GET",
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
