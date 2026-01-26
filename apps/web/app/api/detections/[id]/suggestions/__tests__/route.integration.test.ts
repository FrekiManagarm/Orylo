import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fraudDetections, aiSuggestions } from "@orylo/database";
import { eq, and } from "drizzle-orm";

/**
 * Integration Tests - GET /api/detections/[id]/suggestions
 * 
 * Story 4.1: AC8 - Test API endpoints
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

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  suggestionGetRateLimit: {
    limit: vi.fn().mockResolvedValue({ success: true, reset: Date.now() }),
  },
}));

// Mock suggestion engine
vi.mock("@/lib/ai/suggestion-engine", () => ({
  generateSuggestion: vi.fn().mockResolvedValue({
    type: "whitelist",
    confidence: 0.85,
    reasoning: "Client fiable",
    factors: ["Score élevé", "Transactions réussies"],
  }),
}));

// Mock cache
vi.mock("@/lib/ai/suggestion-cache", () => ({
  getCachedSuggestion: vi.fn().mockResolvedValue(null),
  setCachedSuggestion: vi.fn().mockResolvedValue(undefined),
}));

describe("GET /api/detections/[id]/suggestions - Integration", () => {
  let testOrgId: string;
  let testDetectionId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    testOrgId = `org_test_${Date.now()}`;
    testDetectionId = `det_test_${Date.now()}`;

    // Setup: Mock session
    mockGetSession.mockResolvedValue({
      user: {
        id: "user_test_001",
        organizationId: testOrgId,
      },
    });

    // Clean up test data
    await db
      .delete(aiSuggestions)
      .where(eq(aiSuggestions.organizationId, testOrgId));
    await db
      .delete(fraudDetections)
      .where(eq(fraudDetections.organizationId, testOrgId));
  });

  afterEach(async () => {
    // Clean up
    await db
      .delete(aiSuggestions)
      .where(eq(aiSuggestions.organizationId, testOrgId));
    await db
      .delete(fraudDetections)
      .where(eq(fraudDetections.organizationId, testOrgId));
  });

  it("should return 401 if no session", async () => {
    mockGetSession.mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost/api/detections/${testDetectionId}/suggestions`
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: testDetectionId }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 404 if detection not found", async () => {
    const request = new NextRequest(
      `http://localhost/api/detections/${testDetectionId}/suggestions`
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: testDetectionId }),
    });

    expect(response.status).toBe(404);
  });

  it("should return suggestion for valid detection", async () => {
    // Setup: Create detection
    await db.insert(fraudDetections).values({
      id: testDetectionId,
      organizationId: testOrgId,
      paymentIntentId: "pi_test_001",
      customerId: "cus_test_001",
      customerEmail: "test@example.com",
      amount: 5000,
      currency: "eur",
      decision: "ALLOW",
      score: 20,
      detectorResults: [],
      executionTimeMs: 100,
    });

    const request = new NextRequest(
      `http://localhost/api/detections/${testDetectionId}/suggestions`
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: testDetectionId }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.suggestion).toBeDefined();
    expect(data.suggestion.type).toBe("whitelist");
  });
});
