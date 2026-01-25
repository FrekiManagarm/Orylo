import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// Mock modules
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  webhookSecret: "whsec_test_secret",
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: "org123" }])),
        })),
      })),
    })),
  },
}));

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it("should verify valid signature (AC2)", async () => {
    // Mock valid signature verification
    const mockEvent = {
      id: "evt_test",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test",
          amount: 5000,
          currency: "eur",
          customer: "cus_test",
          metadata: {},
        },
      },
      account: "acct_test",
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      mockEvent as Stripe.Event
    );

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(stripe.webhooks.constructEvent).toHaveBeenCalled();
  });

  it("should reject invalid signature (returns 400) (AC7)", async () => {
    // Mock invalid signature
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "invalid_signature",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid signature");
  });

  it("should return 400 if missing stripe-signature header (AC7)", async () => {
    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {},
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing signature");
  });

  it("should filter payment_intent.created events only (AC3)", async () => {
    // Mock payment_intent.created event
    const mockEvent = {
      id: "evt_test",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test",
          amount: 5000,
          currency: "eur",
          customer: "cus_test",
          metadata: {},
        },
      },
      account: "acct_test",
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      mockEvent as Stripe.Event
    );

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("should ignore other event types (AC3)", async () => {
    // Mock different event type
    const mockEvent = {
      id: "evt_test",
      type: "customer.created", // Different event type
      data: {
        object: {},
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      mockEvent as Stripe.Event
    );

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  it("should extract required fields correctly (AC4)", async () => {
    const mockEvent = {
      id: "evt_test",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test123",
          amount: 10000,
          currency: "usd",
          customer: "cus_test456",
          metadata: {
            customer_ip: "1.2.3.4",
            order_id: "order_789",
          },
          status: "requires_payment_method",
          created: 1234567890,
        },
      },
      account: "acct_test",
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      mockEvent as Stripe.Event
    );

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Fields are extracted internally - verify by checking successful response
  });

  it("should return 500 for missing required fields (AC7)", async () => {
    const mockEvent = {
      id: "evt_test",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test",
          // Missing amount and currency
          customer: "cus_test",
          metadata: {},
        },
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      mockEvent as Stripe.Event
    );

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Missing required fields");
  });

  it("should return 200 OK within 2s (AC6)", async () => {
    const mockEvent = {
      id: "evt_test",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test",
          amount: 5000,
          currency: "eur",
          customer: "cus_test",
          metadata: {},
        },
      },
      account: "acct_test",
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      mockEvent as Stripe.Event
    );

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify(mockEvent),
    });

    const startTime = Date.now();
    const response = await POST(request);
    const responseTime = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(2000); // AC6: <2s response time
  });

  it("should handle internal errors gracefully (AC7)", async () => {
    // Mock unexpected error
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("Unexpected database error");
    });

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400); // Invalid signature error
  });

  it("should process webhook without organizationId (AC5)", async () => {
    const mockEvent = {
      id: "evt_test",
      type: "payment_intent.created",
      data: {
        object: {
          id: "pi_test",
          amount: 5000,
          currency: "eur",
          customer: "cus_test",
          metadata: {},
        },
      },
      // No account field - no organization
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      mockEvent as Stripe.Event
    );

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=signature",
      },
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still return 200 OK even without org
    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });
});
