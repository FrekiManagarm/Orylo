/**
 * PostHog Events Tracking
 * 
 * Story 3.3: User analytics and event tracking
 * AC4: Track key events (user_login, stripe_connected, customer_blocked, detection_created)
 * 
 * Installation required: bun add posthog-node
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let posthog: any = null; // PostHog client type (optional dependency)

// Lazy initialization to avoid errors if PostHog not installed
function getPostHog() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null;
  }

  if (!posthog) {
    try {
      // Dynamic import to avoid errors if package not installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PostHog } = require("posthog-node");
      posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        flushAt: 20,
        flushInterval: 10000,
      });
    } catch {
      console.warn("[PostHog] Package not installed. Run: bun add posthog-node");
      return null;
    }
  }

  return posthog;
}

/**
 * Track user login event
 */
export const trackUserLogin = (userId: string, organizationId: string) => {
  const client = getPostHog();
  if (!client) return;

  try {
    client.capture({
      distinctId: userId,
      event: "user_login",
      properties: { organizationId },
    });
  } catch (error) {
    console.warn("[PostHog] Failed to track user_login:", error);
  }
};

/**
 * Track Stripe connection event
 */
export const trackStripeConnected = (
  organizationId: string,
  stripeAccountId: string
) => {
  const client = getPostHog();
  if (!client) return;

  try {
    client.capture({
      distinctId: organizationId,
      event: "stripe_connected",
      properties: { stripeAccountId },
    });
  } catch (error) {
    console.warn("[PostHog] Failed to track stripe_connected:", error);
  }
};

/**
 * Track customer blocked event
 */
export const trackCustomerBlocked = (
  organizationId: string,
  customerId: string
) => {
  const client = getPostHog();
  if (!client) return;

  try {
    client.capture({
      distinctId: organizationId,
      event: "customer_blocked",
      properties: { customerId },
    });
  } catch (error) {
    console.warn("[PostHog] Failed to track customer_blocked:", error);
  }
};

/**
 * Track detection created event
 */
export const trackDetectionCreated = (
  organizationId: string,
  decision: string,
  riskScore: number
) => {
  const client = getPostHog();
  if (!client) return;

  try {
    client.capture({
      distinctId: organizationId,
      event: "detection_created",
      properties: { decision, riskScore },
    });
  } catch (error) {
    console.warn("[PostHog] Failed to track detection_created:", error);
  }
};

/**
 * Track webhook processed event
 */
export const trackWebhookProcessed = (
  organizationId: string,
  eventType: string,
  duration: number,
  retryCount: number,
  success: boolean
) => {
  const client = getPostHog();
  if (!client) return;

  try {
    client.capture({
      distinctId: organizationId,
      event: "webhook_processed",
      properties: { eventType, duration, retryCount, success },
    });
  } catch (error) {
    console.warn("[PostHog] Failed to track webhook_processed:", error);
  }
};
