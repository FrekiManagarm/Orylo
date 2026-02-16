import { db } from "@/lib/db";
import { paymentProcessorsConnections, webhookEvents } from "@orylo/database";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { logger, logWebhookReceived } from "@/lib/logger";

const SUPPORTED_EVENTS = [
  "payment_intent.created",
  "charge.succeeded",
  "charge.failed",
  "charge.dispute.created",
];

export type WebhookProcessResult =
  | { ok: true; event: Stripe.Event; organizationId: string }
  | { ok: false; status: 400; error: string }
  | { ok: false; status: 200; skip: true };

/**
 * Process incoming Stripe webhook - verify signature, resolve organization, check idempotency.
 * Used by both /api/webhooks/stripe and /api/webhooks/stripe/[accountId].
 */
export async function processStripeWebhook(request: {
  body: string;
  signature: string | null;
  webhookSecret: string;
  accountIdFromUrl?: string | null;
}): Promise<WebhookProcessResult> {
  const { body, signature, webhookSecret, accountIdFromUrl } = request;

  if (!signature) {
    return { ok: false, status: 400, error: "Missing signature" };
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return { ok: false, status: 400, error: "Invalid signature" };
  }

  logWebhookReceived(event.id, event.type);

  if (!SUPPORTED_EVENTS.includes(event.type)) {
    logger.info("Webhook ignored - unsupported event type", {
      eventId: event.id,
      eventType: event.type,
    });
    return { ok: false, status: 200, skip: true };
  }

  const existing = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.stripeEventId, event.id))
    .limit(1);

  if (existing.length > 0) {
    return { ok: false, status: 200, skip: true };
  }

  let organizationId: string | null = null;

  // 1. Account ID from URL (primary for Connect per-account webhooks)
  if (accountIdFromUrl) {
    const connection = await db.query.paymentProcessorsConnections.findFirst({
      where: eq(paymentProcessorsConnections.accountId, accountIdFromUrl),
      columns: { organizationId: true },
    });
    organizationId = connection?.organizationId ?? null;
  }

  // 2. event.account (Stripe Connect when using single platform endpoint)
  if (!organizationId) {
    const stripeAccountId = event.account as string | null;
    if (stripeAccountId) {
      const connection = await db.query.paymentProcessorsConnections.findFirst({
        where: eq(paymentProcessorsConnections.accountId, stripeAccountId),
        columns: { organizationId: true },
      });
      organizationId = connection?.organizationId ?? null;
    }
  }

  // 3. Metadata (platform account, simulate payment)
  if (!organizationId && event.type === "payment_intent.created") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    organizationId =
      paymentIntent.metadata?.organizationId ??
      paymentIntent.metadata?.organization_id ??
      null;
  }

  if (
    !organizationId &&
    (event.type === "charge.succeeded" || event.type === "charge.failed")
  ) {
    const charge = event.data.object as Stripe.Charge;
    organizationId =
      charge.metadata?.organizationId ?? charge.metadata?.organization_id ?? null;
  }

  if (!organizationId) {
    logger.warn("No organization found for Stripe account", {
      eventId: event.id,
      accountIdFromUrl,
    });
    return { ok: false, status: 200, skip: true };
  }

  return { ok: true, event, organizationId };
}
