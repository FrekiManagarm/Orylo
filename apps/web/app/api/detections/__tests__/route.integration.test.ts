import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";

/**
 * Integration Tests - GET /api/detections
 * 
 * Story 3.6 AC3: Integration tests for detections API
 * - Filters by decision
 * - Pagination
 * - Multi-tenancy enforcement
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

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("GET /api/detections - Integration", () => {
  let testOrgId: string;
  let otherOrgId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    testOrgId = `org_test_${Date.now()}`;
    otherOrgId = `org_other_${Date.now()}`;

    // Clean up test data
    await db.delete(fraudDetections);

    // Mock authenticated session
    mockGetSession.mockResolvedValue({
      user: {
        id: "user_test_123",
        email: "test@example.com",
        organizationId: testOrgId,
      },
    });

    // Seed test data
    await db.insert(fraudDetections).values([
      {
        organizationId: testOrgId,
        paymentIntentId: "pi_1",
        decision: "ALLOW",
        score: 20,
        amount: 5000,
        currency: "usd",
        customerId: "cus_1",
        customerEmail: "test1@example.com",
        detectorResults: [],
        executionTimeMs: 100,
      },
      {
        organizationId: testOrgId,
        paymentIntentId: "pi_2",
        decision: "BLOCK",
        score: 95,
        amount: 10000,
        currency: "usd",
        customerId: "cus_2",
        customerEmail: "test2@example.com",
        detectorResults: [],
        executionTimeMs: 150,
      },
      {
        organizationId: testOrgId,
        paymentIntentId: "pi_3",
        decision: "REVIEW",
        score: 50,
        amount: 7500,
        currency: "usd",
        customerId: "cus_3",
        customerEmail: "test3@example.com",
        detectorResults: [],
        executionTimeMs: 120,
      },
      // Other org's data (should not be returned)
      {
        organizationId: otherOrgId,
        paymentIntentId: "pi_4",
        decision: "ALLOW",
        score: 10,
        amount: 3000,
        currency: "usd",
        customerId: "cus_4",
        customerEmail: "other@example.com",
        detectorResults: [],
        executionTimeMs: 90,
      },
    ]);
  });

  it("AC3: returns all detections for organization", async () => {
    const request = new NextRequest("http://localhost:3000/api/detections");

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(3); // Only testOrgId's detections
    expect(json.total).toBe(3);
    expect(json.data.every((d: { organizationId: string }) => d.organizationId === testOrgId)).toBe(true);
  });

  it("AC3: filters by decision", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/detections?decision=BLOCK"
    );

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].decision).toBe("BLOCK");
  });

  it("AC3: respects pagination limit", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/detections?limit=2"
    );

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.limit).toBe(2);
  });

  it("AC3: respects pagination offset", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/detections?limit=2&offset=1"
    );

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.offset).toBe(1);
  });

  it("AC3: enforces multi-tenancy", async () => {
    const request = new NextRequest("http://localhost:3000/api/detections");

    const response = await GET(request);
    const json = await response.json();

    // Should NOT include other org's detection
    expect(json.data).toHaveLength(3);
    expect(
      json.data.every((d: { organizationId: string }) => d.organizationId === testOrgId)
    ).toBe(true);
    expect(
      json.data.some((d: { paymentIntentId: string }) => d.paymentIntentId === "pi_4")
    ).toBe(false);
  });

  it("AC3: filters by date range", async () => {
    const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = new Date().toISOString();

    const request = new NextRequest(
      `http://localhost:3000/api/detections?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/detections");

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });
});
