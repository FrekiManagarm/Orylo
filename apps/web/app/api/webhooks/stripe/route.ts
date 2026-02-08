import { NextRequest, NextResponse } from "next/server";
import { stripe, webhookSecret } from "@/lib/stripe";
import { db } from "@/lib/db";
import { organization, webhookEvents } from "@orylo/database";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { processWebhookWithRetry } from "@/lib/webhook-processor";
import { logger, logWebhookReceived } from "@/lib/logger";

/**
 * POST /api/webhooks/stripe
 * 
 * Stripe Webhook Handler
 * - AC1: Webhook endpoint
 * - AC2: Signature verification
 * - AC3: Filter payment_intent.created events
 * - AC4: Extract payment data
 * - AC5: Async fraud detection
 * - AC6: Response <2s
 * - AC7: Error handling (400/500)
 * - AC8: Logging
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // AC2: Extract raw body and signature for verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("[stripe_webhook] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // AC2: Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe_webhook_signature_invalid]", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      // AC7: Return 400 for invalid signature
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // AC8: Log webhook received (Story 3.3: Structured logging)
    logWebhookReceived(event.id, event.type);

    // AC6: Supported events (expanded from Story 1.2)
    const SUPPORTED_EVENTS = [
      "payment_intent.created", // Existing from Story 1.2
      "charge.succeeded", // NEW
      "charge.failed", // NEW
      "charge.dispute.created", // NEW (integrates with Story 3.2)
    ];

    // AC6: Filter events - return 200 for unsupported (Stripe doesn't retry)
    if (!SUPPORTED_EVENTS.includes(event.type)) {
      logger.info("Webhook ignored - unsupported event type", {
        eventId: event.id,
        eventType: event.type,
      });
      return NextResponse.json({ received: true, skipped: true }, { status: 200 });
    }

    // AC1: Idempotency check - check if event already processed
    const existing = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.stripeEventId, event.id))
      .limit(1);

    if (existing.length > 0) {
      logger.info("Duplicate webhook event detected", { eventId: event.id });
      return NextResponse.json(
        { received: true, duplicate: true },
        { status: 200 }
      );
    }

    // Get organization ID from Stripe account
    // Note: In production, you'd get this from the connected account
    const stripeAccountId = event.account as string | null;
    let organizationId: string | null = null;

    if (stripeAccountId) {
      // Query organization by Stripe account ID
      const orgs = await db
        .select({ id: organization.id })
        .from(organization)
        .where(eq(organization.stripeAccountId, stripeAccountId))
        .limit(1);

      organizationId = orgs[0]?.id || null;
    }

    // For payment_intent.created, also try to get org from metadata
    if (!organizationId && event.type === "payment_intent.created") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (paymentIntent.metadata?.organizationId) {
        organizationId = paymentIntent.metadata.organizationId;
      }
    }

    if (!organizationId) {
      logger.warn("No organization found for Stripe account", {
        eventId: event.id,
        stripeAccountId,
      });
      // Still return 200 OK (we received the webhook successfully)
      // But don't process without an org
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // AC1: Create webhook event record (marks event as received, before processing)
    await db.insert(webhookEvents).values({
      stripeEventId: event.id,
      type: event.type,
      organizationId,
      processed: false,
      retryCount: 0,
    });

    // AC4 & AC5: Process webhook with retry logic (async, fire-and-forget)
    // Don't await - let it run in background with retry logic
    void processWebhookWithRetry(event, organizationId);

    // AC7: Performance monitoring per webhook type (Story 3.3)
    const duration = Date.now() - startTime;
    logger.info("Webhook received and queued for processing", {
      eventId: event.id,
      eventType: event.type,
      responseTimeMs: duration,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // AC7: Return 500 for internal errors (Stripe will retry)
    const responseTime = Date.now() - startTime;
    logger.error("Webhook processing error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTimeMs: responseTime,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

