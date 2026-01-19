import Stripe from "stripe";

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
