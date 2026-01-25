import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { webhookEvents } from "@orylo/database";
import Stripe from "stripe";

// Mock Stripe module before any imports
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  webhookSecret: "whsec_test_secret",
}));

// Mock Stripe initialization to prevent API key errors
vi.mock("stripe", () => {
  return {
    default: vi.fn(() => ({
      webhooks: {
        constructEvent: vi.fn(),
      },
    })),
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock("@/lib/webhook-processor", () => ({
  processWebhookWithRetry: vi.fn(() => Promise.resolve()),
}));

vi.mock("@orylo/database", () => ({
  organizations: {},
  webhookEvents: {},
}));

describe("Webhook Idempotency (AC1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect duplicate event and return duplicate: true", async () => {
    const mockEvent = {
      id: "evt_duplicate_123",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test_123",
          amount: 5000,
          currency: "usd",
          customer: "cus_test_123",
          metadata: {},
        },
      },
      account: "acct_test",
    } as Stripe.Event;

    // Mock signature verification
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

    // Mock existing webhook event (duplicate)
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: "existing_id", stripeEventId: "evt_duplicate_123" }])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(mockEvent),
      headers: {
        "stripe-signature": "test_signature",
      },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.duplicate).toBe(true);
    expect(json.received).toBe(true);

    // Verify processWebhookWithRetry was NOT called (duplicate)
    const { processWebhookWithRetry } = await import("@/lib/webhook-processor");
    expect(processWebhookWithRetry).not.toHaveBeenCalled();
  });

  it("should process new event and create webhook_events record", async () => {
    const mockEvent = {
      id: "evt_new_123",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test_123",
          amount: 5000,
          currency: "usd",
          customer: "cus_test_123",
          metadata: {},
        },
      },
      account: "acct_test",
    } as Stripe.Event;

    // Mock signature verification
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

    // Mock no existing webhook event (new event)
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])), // No existing event
        })),
      })),
    } as ReturnType<typeof db.select>);

    // Mock organization lookup
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: "org_test_123" }])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(mockEvent),
      headers: {
        "stripe-signature": "test_signature",
      },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(json.duplicate).toBeUndefined();

    // Verify webhook_events record was created
    expect(db.insert).toHaveBeenCalledWith(webhookEvents);

    // Verify processWebhookWithRetry was called
    const { processWebhookWithRetry } = await import("@/lib/webhook-processor");
    expect(processWebhookWithRetry).toHaveBeenCalled();
  });
});
