/**
 * k6 Load Testing Script
 * 
 * Story 3.4 AC8: Load testing webhooks (10 req/s, P95 <350ms)
 * 
 * Installation: brew install k6 (macOS) or download from k6.io
 * Usage: k6 run scripts/load-test.js
 * 
 * Environment variables:
 * - API_URL: Webhook endpoint URL (default: http://localhost:3000/api/webhooks/stripe)
 * - STRIPE_SIGNATURE: Valid Stripe webhook signature (generate via Stripe CLI)
 */

import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Load test configuration
 * AC8: 10 req/s sustained, P95 <350ms
 */
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 req/s
    { duration: "5m", target: 10 }, // Sustained load
    { duration: "1m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<350"], // NFR1: P95 <350ms
    http_req_failed: ["rate<0.01"], // <1% error rate
  },
};

/**
 * Generate test webhook payload
 */
function generateWebhookPayload() {
  const eventId = `evt_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const paymentIntentId = `pi_test_${Math.random().toString(36).substr(2, 9)}`;

  return JSON.stringify({
    id: eventId,
    type: "payment_intent.created",
    object: "event",
    api_version: "2023-10-16",
    created: Math.floor(Date.now() / 1000),
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
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  });
}

/**
 * Main test function
 */
export default function () {
  const apiUrl = __ENV.API_URL || "http://localhost:3000/api/webhooks/stripe";
  const signature = __ENV.STRIPE_SIGNATURE || "test_signature";

  const payload = generateWebhookPayload();

  const params = {
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": signature,
    },
  };

  const res = http.post(apiUrl, payload, params);

  // AC8: Verify response and performance
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time <350ms": (r) => r.timings.duration < 350,
    "response has received field": (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.received === true;
      } catch {
        return false;
      }
    },
  });

  sleep(0.1); // 100ms between requests per VU (10 req/s per VU)
}
