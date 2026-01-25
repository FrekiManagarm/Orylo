import Stripe from "stripe";
import crypto from "crypto";

/**
 * Stripe Test Fixtures
 * 
 * Story 3.6 AC2: Test webhook payloads and signature generation
 */

/**
 * Create a test Stripe webhook event
 */
export function createTestWebhookEvent(
  type: string = "payment_intent.created",
  overrides: Partial<Stripe.Event> = {}
): Stripe.Event {
  const eventId = `evt_test_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const paymentIntentId = `pi_test_${crypto.randomBytes(8).toString("hex")}`;

  return {
    id: eventId,
    object: "event",
    api_version: "2023-10-16",
    created: Math.floor(Date.now() / 1000),
    type,
    data: {
      object: {
        id: paymentIntentId,
        object: "payment_intent",
        amount: 5000,
        currency: "usd",
        customer: "cus_test_123",
        metadata: {
          organizationId: "org_test_123",
        },
        status: "requires_payment_method",
        ...(overrides.data?.object as Partial<Stripe.PaymentIntent>),
      } as Stripe.PaymentIntent,
    },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    ...overrides,
  } as Stripe.Event;
}

/**
 * Generate Stripe webhook signature
 * 
 * Story 3.6 AC2: Valid signature for testing
 */
export function generateStripeSignature(
  payload: string,
  secret: string = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test"
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return `t=${timestamp},v1=${signature}`;
}

/**
 * Create a test charge.dispute.created event (for Story 3.2)
 */
export function createChargebackEvent(
  customerId: string = "cus_test_123",
  organizationId: string = "org_test_123"
): Stripe.Event {
  return createTestWebhookEvent("charge.dispute.created", {
    data: {
      object: {
        id: `dp_test_${crypto.randomBytes(8).toString("hex")}`,
        object: "dispute",
        customer: customerId,
        charge: `ch_test_${crypto.randomBytes(8).toString("hex")}`,
        amount: 5000,
        currency: "usd",
        metadata: {
          organizationId,
        },
      } as Stripe.Dispute,
    },
  } as Partial<Stripe.Event>);
}
