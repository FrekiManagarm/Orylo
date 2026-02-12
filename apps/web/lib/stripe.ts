import Stripe from "stripe";
import { decrypt } from "./encryption";

/**
 * Stripe Client Instance
 * 
 * Used for:
 * - Webhook signature verification
 * - API calls to Stripe
 * 
 * @see https://docs.stripe.com/api
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

/**
 * Webhook Secret for signature verification
 * 
 * Get this from Stripe Dashboard → Webhooks → Endpoint → Signing secret
 * In development, use Stripe CLI: `stripe listen --print-secret`
 */
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Stripe Client
 *
 * Creates Stripe clients for platform and connected accounts.
 */

/**
 * Platform Stripe client (for webhooks and platform operations)
 */
export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

/**
 * Connected account Stripe client
 */
export function getConnectedStripeClient(accessToken: string): Stripe {
  return new Stripe(decrypt(accessToken), {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
