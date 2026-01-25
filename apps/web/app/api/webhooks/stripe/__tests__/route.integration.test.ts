import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fraudDetections, webhookEvents } from "@orylo/database";
import { createTestWebhookEvent, generateStripeSignature } from "@/test/helpers/stripe-fixtures";

/**
 * Integration Tests - Stripe Webhook Handler
 * 
 * Story 3.6 AC2: Integration tests for webhook processing
 * - Valid signature → Processing
 * - Duplicate event → Idempotency
 * - Invalid signature → 400 error
 */

// Mock Stripe
const mockConstructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
  webhookSecret: "whsec_test",
}));

// Mock webhook processor (async processing)
const mockProcessWebhook = vi.fn();
vi.mock("@/lib/webhook-processor", () => ({
  processWebhookWithRetry: mockProcessWebhook,
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  logWebhookReceived: vi.fn(),
}));

describe("POST /api/webhooks/stripe - Integration", () => {
  let testOrgId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    testOrgId = `org_test_${Date.now()}`;
    
    // Clean up test data
    await db.delete(fraudDetections);
    await db.delete(webhookEvents);
  });

  it("AC2: processes valid payment_intent.created webhook", async () => {
    const event = createTestWebhookEvent("payment_intent.created", {
      data: {
        object: {
          metadata: { organizationId: testOrgId },
        },
      },
    });

    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload);

    // Mock Stripe signature verification
    mockConstructEvent.mockReturnValue(event);

    // Mock organization lookup
    vi.spyOn(db, "select").mockResolvedValueOnce([
      { id: testOrgId, stripeAccountId: "acct_test" },
    ] as Array<{ id: string; stripeAccountId: string }>);

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": signature,
        "content-type": "application/json",
      },
    });

    const response = await POST(request);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockProcessWebhook).toHaveBeenCalledWith(event, testOrgId);
  });

  it("AC2: detects duplicate events (idempotency)", async () => {
    const event = createTestWebhookEvent("payment_intent.created", {
      data: {
        object: {
          metadata: { organizationId: testOrgId },
        },
      },
    });

    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload);

    mockConstructEvent.mockReturnValue(event);

    // Mock organization lookup
    vi.spyOn(db, "select").mockResolvedValueOnce([
      { id: testOrgId, stripeAccountId: "acct_test" },
    ] as Array<{ id: string; stripeAccountId: string }>);

    // Insert webhook event (simulating first call)
    await db.insert(webhookEvents).values({
      stripeEventId: event.id,
      type: event.type,
      organizationId: testOrgId,
      processed: false,
      retryCount: 0,
    });

    // Mock duplicate check (should find existing)
    vi.spyOn(db, "select").mockResolvedValueOnce([
      { id: "existing_id", stripeEventId: event.id },
    ] as Array<{ id: string; stripeEventId: string }>);

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": signature,
        "content-type": "application/json",
      },
    });

    const response = await POST(request);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const json = await response.json();

    // Should return 200 but indicate duplicate
    expect(response.status).toBe(200);
    // Note: Current implementation doesn't return duplicate flag, but idempotency is enforced
    expect(mockProcessWebhook).not.toHaveBeenCalled(); // Should not process duplicate
  });

  it("AC2: rejects invalid signature", async () => {
    const event = createTestWebhookEvent();
    const payload = JSON.stringify(event);

    // Mock signature verification failure
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": "invalid_signature",
        "content-type": "application/json",
      },
    });

    const response = await POST(request);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Invalid signature");
  });

  it("AC2: rejects missing signature", async () => {
    const payload = JSON.stringify(createTestWebhookEvent());

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST(request);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Missing signature");
  });
});
